import { register } from "./registry.js";
import { searchIssues } from "../github/search.js";

/** GitHub awards Quickdraw for closing within five minutes of opening. */
export const WINDOW_MS = 5 * 60 * 1000;

/** True when an issue or pull request was closed inside the Quickdraw window. */
export function closedQuickly(item, windowMs = WINDOW_MS) {
  if (!item?.created_at || !item?.closed_at) return false;
  const opened = Date.parse(item.created_at);
  const closed = Date.parse(item.closed_at);
  if (Number.isNaN(opened) || Number.isNaN(closed)) return false;
  return closed - opened <= windowMs && closed >= opened;
}

export default register({
  id: "quickdraw",
  name: "Quickdraw",
  description: "Closed an issue or pull request within five minutes of opening it.",
  tiers: [1],

  async detect({ client, username }) {
    const items = await searchIssues(client, `is:closed author:${username}`, { max: 200 });
    const fast = items.filter((item) => closedQuickly(item));
    const earned = fast.length > 0;

    return {
      count: fast.length,
      level: earned ? 1 : 0,
      earned,
      next: earned ? null : 1,
      remaining: earned ? 0 : 1,
      maxed: earned,
      // Only the 200 most recent closed items are inspected.
      exact: earned,
      detail: earned
        ? `${fast.length} closed within five minutes`
        : "none of the 200 most recent closed items qualified",
      todo: earned ? null : "close an issue or pull request within five minutes of opening it",
    };
  },
});
