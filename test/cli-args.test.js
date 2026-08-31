import test from "node:test";
import assert from "node:assert/strict";
import { parseArgs, USAGE } from "../src/cli-args.js";

test("a bare username is the only required argument", () => {
  const options = parseArgs(["octocat"]);
  assert.equal(options.username, "octocat");
  assert.equal(options.format, "table");
  assert.equal(options.color, true);
});

test("options with values are read from the next argument", () => {
  const options = parseArgs(["octocat", "--token", "abc", "--format", "json"]);
  assert.equal(options.token, "abc");
  assert.equal(options.format, "json");
});

test("options also accept the equals form", () => {
  assert.equal(parseArgs(["octocat", "--format=markdown"]).format, "markdown");
});

test("--no-color turns colour off", () => {
  assert.equal(parseArgs(["octocat", "--no-color"]).color, false);
  assert.equal(parseArgs(["octocat", "--no-colour"]).color, false);
});

test("help and version flags are recognised in both forms", () => {
  assert.equal(parseArgs(["--help"]).help, true);
  assert.equal(parseArgs(["-h"]).help, true);
  assert.equal(parseArgs(["--version"]).version, true);
  assert.equal(parseArgs(["-v"]).version, true);
});

test("--sample is coerced to an integer", () => {
  assert.equal(parseArgs(["octocat", "--sample", "50"]).sample, 50);
  assert.throws(() => parseArgs(["octocat", "--sample", "0"]), /positive integer/);
  assert.throws(() => parseArgs(["octocat", "--sample", "many"]), /positive integer/);
});

test("an option missing its value is an error", () => {
  assert.throws(() => parseArgs(["octocat", "--token"]), /needs a value/);
  assert.throws(() => parseArgs(["octocat", "--token", "--format"]), /needs a value/);
});

test("unknown options and stray arguments are rejected", () => {
  assert.throws(() => parseArgs(["octocat", "--wat"]), /Unknown option/);
  assert.throws(() => parseArgs(["octocat", "-x"]), /Unknown option/);
  assert.throws(() => parseArgs(["a", "b"]), /Unexpected argument/);
});

test("an unsupported format is rejected", () => {
  assert.throws(() => parseArgs(["octocat", "--format", "yaml"]), /Unknown format/);
});

test("the usage text names every option", () => {
  for (const flag of ["--token", "--format", "--only", "--sample", "--no-color"]) {
    assert.ok(USAGE.includes(flag), `usage is missing ${flag}`);
  }
});
