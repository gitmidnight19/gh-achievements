/**
 * Parse an RFC 5988 `Link` header into a `{ rel: url }` object.
 *
 * GitHub uses it for every paginated collection, and it is the only reliable
 * way to know whether another page exists.
 */
export function parseLinkHeader(value) {
  const links = {};
  if (!value) return links;

  for (const part of value.split(",")) {
    const match = /<([^>]+)>\s*;\s*rel="([^"]+)"/.exec(part.trim());
    if (match) links[match[2]] = match[1];
  }
  return links;
}

/**
 * Walk a paginated endpoint, yielding one item at a time.
 *
 * `max` caps the number of items so a profile with thousands of repositories
 * does not turn a report into a rate-limit incident.
 */
export async function* paginate(client, path, { params = {}, max = Infinity, perPage = 100 } = {}) {
  let next = path;
  let query = { ...params, per_page: perPage };
  let seen = 0;

  while (next && seen < max) {
    const { body, headers } = await client.request(next, { params: query });
    const items = Array.isArray(body) ? body : (body?.items ?? []);

    for (const item of items) {
      yield item;
      if (++seen >= max) return;
    }

    if (items.length === 0) return;
    next = parseLinkHeader(headers.get("link")).next;
    // The `next` URL already carries the query string.
    query = undefined;
  }
}

/** Collect a paginated endpoint into an array. */
export async function collect(client, path, options) {
  const out = [];
  for await (const item of paginate(client, path, options)) out.push(item);
  return out;
}
