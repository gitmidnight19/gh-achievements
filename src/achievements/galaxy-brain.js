import { register } from "./registry.js";

export const THRESHOLDS = [2, 8, 16, 32];

export default register({
  id: "galaxy-brain",
  name: "Galaxy Brain",
  description: "Answers marked as accepted in GitHub Discussions.",
  tiers: THRESHOLDS,

  async detect() {
    // Discussion answers are only exposed through the GraphQL API, and only for
    // repositories the caller can enumerate. Rather than guess a number, this
    // detector reports honestly that it cannot tell.
    return {
      count: null,
      level: null,
      earned: null,
      next: THRESHOLDS[0],
      remaining: null,
      maxed: false,
      exact: false,
      unknown: true,
      detail: "not exposed by the REST API",
      todo: "have an answer of yours marked as accepted in a GitHub Discussion",
    };
  },
});
