import { register } from "./registry.js";
import { countIssues } from "../github/search.js";

export default register({
  id: "yolo",
  name: "YOLO",
  description: "Merged a pull request without a review.",
  tiers: [1],

  async detect({ client, username }) {
    const count = await countIssues(
      client,
      `is:pr is:merged review:none author:${username}`,
    );

    return {
      count,
      level: count > 0 ? 1 : 0,
      earned: count > 0,
      next: count > 0 ? null : 1,
      remaining: count > 0 ? 0 : 1,
      maxed: count > 0,
      exact: true,
      detail: `${count} merged pull request${count === 1 ? "" : "s"} with no review`,
      todo: count > 0 ? null : "merge one of your pull requests without requesting a review",
    };
  },
});
