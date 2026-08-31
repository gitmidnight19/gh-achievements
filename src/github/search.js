import { collect } from "./paginate.js";

/**
 * Return the `total_count` for a search query without downloading the results.
 *
 * The search API caps `total_count` at 1000 for the results it will hand back,
 * but the count itself is reported in full, which is what the tier maths needs.
 */
export async function countIssues(client, query) {
  const body = await client.get("search/issues", { q: query, per_page: 1 });
  return body?.total_count ?? 0;
}

/** Fetch matching issues or pull requests, newest first. */
export async function searchIssues(client, query, { max = 100, sort = "created" } = {}) {
  return collect(client, "search/issues", {
    params: { q: query, sort, order: "desc" },
    max,
  });
}

/** Build a search query string from qualifier pairs, skipping empty values. */
export function qualifiers(pairs) {
  return Object.entries(pairs)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}:${value}`)
    .join(" ");
}
