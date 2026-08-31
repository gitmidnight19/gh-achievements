# Contributing

Thanks for taking a look.

## Getting set up

There are no dependencies to install. You need Node.js 20 or newer, and that is
all:

```sh
git clone https://github.com/<owner>/gh-achievements.git
cd gh-achievements
npm test
```

## Running the CLI locally

```sh
node src/cli.js <username> --token "$GITHUB_TOKEN"
```

An unauthenticated run is capped at 60 API requests per hour, which is not
enough for a full report on an active profile. A token with no scopes at all is
enough to raise that to 5000.

## Adding an achievement

Each badge lives in its own module under `src/achievements/` and registers
itself on import:

```js
import { register } from "./registry.js";

export default register({
  id: "my-badge",
  name: "My Badge",
  description: "What earning it takes.",
  tiers: [1, 10],
  async detect({ client, username }) {
    return { count: 0, level: 0, earned: false, exact: true, todo: "..." };
  },
});
```

Then add an import to `src/achievements/index.js` and a test under `test/`.

If the REST API cannot answer the question exactly, say so: return
`exact: false` with a `detail` explaining what was inspected, or `unknown: true`
if nothing useful can be determined. A wrong number is worse than an honest
"cannot tell".

## Style

- ES modules, no build step, no runtime dependencies.
- Tests use the Node.js built-in runner (`node:test`, `node:assert/strict`).
- Comments explain *why*, not *what*.
