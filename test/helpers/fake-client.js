/**
 * A stand-in for the GitHub client that answers from a fixture map.
 *
 * Keys are matched case-insensitively as substrings of the request path plus
 * its query string, so a test can say "search/issues?q=is:pr" without
 * rebuilding a URL.
 */
export function fakeClient(routes, { authenticated = true } = {}) {
  const calls = [];

  function lookup(path, params) {
    const query = new URLSearchParams(
      Object.entries(params ?? {}).map(([k, v]) => [k, String(v)]),
    );
    // URLSearchParams encodes spaces as "+", which makes search queries hard to
    // read and to assert against, so put them back.
    const rendered = [...query].map(([k, v]) => `${k}=${v}`).join("&");
    const full = rendered ? `${path}?${rendered}` : path;
    calls.push(full);

    const needle = full.toLowerCase();
    for (const [pattern, value] of Object.entries(routes)) {
      if (needle.includes(pattern.toLowerCase())) return value;
    }
    throw new Error(`No fixture for ${full}`);
  }

  return {
    authenticated,
    calls,
    async get(path, params) {
      const value = lookup(path, params);
      return typeof value === "function" ? value() : value;
    },
    async request(path, { params } = {}) {
      const body = lookup(path, params);
      return {
        body: typeof body === "function" ? body() : body,
        headers: new Headers(),
        url: path,
      };
    },
  };
}

/** Build a search-API response body around a list of items. */
export function searchBody(items, totalCount = items.length) {
  return { total_count: totalCount, incomplete_results: false, items };
}
