# gh-achievements

Inspect any public GitHub profile and find out which achievement badges are
earned, which are still missing, and exactly what is left to do to earn them.

GitHub shows the badges you already have, but it never tells you how close you
are to the next one. `gh-achievements` reads the public API and answers that
question: *"I have 11 merged pull requests — how many more until Pull Shark
turns silver?"*

## Install

Requires Node.js 20 or newer. No runtime dependencies.

```sh
npm install -g gh-achievements
```

Or run it without installing:

```sh
npx gh-achievements <username>
```

## Usage

```sh
gh-achievements <username> [options]
```

| Option | Description |
| --- | --- |
| `--token <token>` | GitHub token, to raise the rate limit from 60 to 5000 requests/hour |
| `--format <name>` | Output format: `table` (default), `json`, `markdown` |
| `--only <ids>` | Comma-separated achievement ids to check |
| `--no-color` | Disable ANSI colours |
| `--help` | Show usage |

The token is also read from the `GITHUB_TOKEN` environment variable, which is
the preferred way to pass it — a token on the command line ends up in your
shell history.

### Example

```sh
$ gh-achievements octocat

  Achievements for octocat

  ✔  Pull Shark          x2    16 more merged PRs until the next tier
  ✔  YOLO                      earned
  ✖  Quickdraw                 close an issue or PR within 5 minutes of opening it
  ✖  Pair Extraordinaire       co-author a commit on a merged pull request
  ✖  Starstruck                9 more stars on your most-starred repository

  2 of 5 earned
```

## Achievements covered

| Badge | What it takes |
| --- | --- |
| Pull Shark | Merged pull requests (2 / 16 / 128 / 1024 tiers) |
| YOLO | Merge a pull request without a review |
| Quickdraw | Close an issue or pull request within 5 minutes |
| Pair Extraordinaire | Co-author a commit on a merged pull request |
| Starstruck | Stars on a single repository (16 / 128 / 512 / 4096 tiers) |
| Galaxy Brain | Accepted answers in GitHub Discussions (2 / 8 / 16 / 32 tiers) |

Some of these cannot be determined exactly from the public API — GitHub does not
expose an achievements endpoint. Where that is the case the report says so
rather than guessing, and explains what it inferred from.

## Library use

```js
import { report } from "gh-achievements";

const result = await report("octocat", { token: process.env.GITHUB_TOKEN });
for (const a of result.achievements) {
  console.log(a.id, a.earned, a.progress);
}
```

## Development

```sh
npm test
```

Tests use the Node.js built-in test runner, so there is nothing to install.

## Licence

MIT
