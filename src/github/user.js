import { collect } from "./paginate.js";

/** Fetch a user's public profile. */
export async function fetchUser(client, username) {
  return client.get(`users/${encodeURIComponent(username)}`);
}

/**
 * Fetch a user's public repositories.
 *
 * Sorted by star count so that a capped fetch still finds the most-starred
 * repository, which is what Starstruck is measured against.
 */
export async function fetchRepos(client, username, { max = 300 } = {}) {
  return collect(client, `users/${encodeURIComponent(username)}/repos`, {
    params: { type: "owner", sort: "pushed", direction: "desc" },
    max,
  });
}
