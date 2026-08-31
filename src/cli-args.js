export const USAGE = `Usage: gh-achievements <username> [options]

Report which GitHub achievement badges a profile has earned, and what is left
to earn the rest.

Options:
  --token <token>   GitHub token (prefer the GITHUB_TOKEN environment variable)
  --format <name>   table (default), json, or markdown
  --only <ids>      comma-separated achievement ids to check
  --sample <n>      merged pull requests to inspect for co-authors (default 30)
  --no-color        disable ANSI colour
  -h, --help        show this message
  -v, --version     show the version
`;

const WITH_VALUE = new Set(["--token", "--format", "--only", "--sample"]);
const FORMATS = new Set(["table", "json", "markdown"]);

/** Parse `process.argv.slice(2)` into an options object. */
export function parseArgs(argv) {
  const options = { username: null, format: "table", color: true, help: false, version: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg === "-v" || arg === "--version") {
      options.version = true;
    } else if (arg === "--no-color" || arg === "--no-colour") {
      options.color = false;
    } else if (WITH_VALUE.has(arg)) {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new Error(`Option ${arg} needs a value`);
      }
      options[arg.slice(2)] = value;
      i += 1;
    } else if (arg.startsWith("--") && arg.includes("=")) {
      const [flag, ...rest] = arg.split("=");
      if (!WITH_VALUE.has(flag)) throw new Error(`Unknown option ${flag}`);
      options[flag.slice(2)] = rest.join("=");
    } else if (arg.startsWith("-")) {
      throw new Error(`Unknown option ${arg}`);
    } else if (options.username === null) {
      options.username = arg;
    } else {
      throw new Error(`Unexpected argument ${arg}`);
    }
  }

  if (!FORMATS.has(options.format)) {
    throw new Error(`Unknown format "${options.format}" — expected one of ${[...FORMATS].join(", ")}`);
  }
  if (options.sample !== undefined) {
    const sample = Number(options.sample);
    if (!Number.isInteger(sample) || sample < 1) throw new Error("--sample must be a positive integer");
    options.sample = sample;
  }

  return options;
}
