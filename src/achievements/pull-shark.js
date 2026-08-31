import { register } from "./registry.js";
import { resolveTier } from "./tiers.js";
import { countIssues } from "../github/search.js";

export const THRESHOLDS = [2, 16, 128, 1024];

export default register({
  id: "pull-shark",
  name: "Pull Shark",
  description: "Opened pull requests that have been merged.",
  tiers: THRESHOLDS,

  async detect({ client, username }) {
    const count = await countIssues(client, `is:pr is:merged author:${username}`);
    const tier = resolveTier(count, THRESHOLDS);

    return {
      ...tier,
      exact: true,
      detail: `${count} merged pull request${count === 1 ? "" : "s"}`,
      todo: tier.maxed
        ? null
        : `${tier.remaining} more merged pull request${tier.remaining === 1 ? "" : "s"}`,
    };
  },
});
