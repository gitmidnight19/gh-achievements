#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { report } from "./report.js";
import { parseArgs, USAGE } from "./cli-args.js";
import { formatTable } from "./format/table.js";
import { formatJson } from "./format/json.js";
import { formatMarkdown } from "./format/markdown.js";
import { supportsColor } from "./format/color.js";
import { GitHubError } from "./github/client.js";

const FORMATTERS = {
  table: (result, options) => formatTable(result, options),
  json: (result) => formatJson(result),
  markdown: (result) => formatMarkdown(result),
};

export async function main(argv = process.argv.slice(2)) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    process.stderr.write(`${error.message}\n\n${USAGE}`);
    return 2;
  }

  if (options.help) {
    process.stdout.write(USAGE);
    return 0;
  }
  if (options.version) {
    process.stdout.write(`${await version()}\n`);
    return 0;
  }
  if (!options.username) {
    process.stderr.write(`A username is required.\n\n${USAGE}`);
    return 2;
  }

  try {
    const result = await report(options.username, {
      token: options.token,
      only: options.only,
      sample: options.sample,
    });
    const color = options.color && options.format === "table" && supportsColor();
    process.stdout.write(`${FORMATTERS[options.format](result, { color })}\n`);
    return 0;
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) {
      process.stderr.write(`No such GitHub user: ${options.username}\n`);
      return 1;
    }
    if (error instanceof GitHubError && error.isRateLimit) {
      process.stderr.write("GitHub rate limit reached. Pass --token to raise it.\n");
      return 1;
    }
    process.stderr.write(`${error.message}\n`);
    return 1;
  }
}

async function version() {
  const url = new URL("../package.json", import.meta.url);
  return JSON.parse(await readFile(url, "utf8")).version;
}

process.exitCode = await main();
