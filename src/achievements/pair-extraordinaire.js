import { register } from "./registry.js";
import { resolveTier } from "./tiers.js";
import { searchIssues } from "../github/search.js";

export const THRESHOLDS = [1, 10, 24, 48];

/** Pull the co-author trailers out of a commit message. */
export function coAuthors(message) {
  const found = [];
  for (const line of String(message ?? "").split(/\r?\n/)) {
    const match = /^\s*co-authored-by:\s*(.+?)\s*<([^>]+)>\s*$/i.exec(line);
    if (match) found.push({ name: match[1], email: match[2].toLowerCase() });
  }
  return found;
}

export default register({
  id: "pair-extraordinaire",
  name: "Pair Extraordinaire",
  description: "Co-authored commits on a merged pull request.",
  tiers: THRESHOLDS,

  async detect({ client, username, sample = 30 }) {
    const merged = await searchIssues(client, `is:pr is:merged author:${username}`, {
      max: sample,
    });

    let count = 0;
    for (const pr of merged) {
      const path = new URL(pr.pull_request?.url ?? "", "https://api.github.com/").pathname;
      if (!path || path === "/") continue;

      const commits = await client.get(`${path.replace(/^\//, "")}/commits`, { per_page: 100 });
      const paired = (commits ?? []).some(
        (commit) =>
          coAuthors(commit?.commit?.message).length > 0,
      );
      if (paired) count += 1;
    }

    const tier = resolveTier(count, THRESHOLDS);
    return {
      ...tier,
      // Only the most recent `sample` merged pull requests are inspected.
      exact: false,
      detail: `${count} of the ${merged.length} most recent merged pull requests carry a co-author`,
      todo: tier.maxed
        ? null
        : "add a `Co-authored-by:` trailer to a commit on a pull request you merge",
    };
  },
});
