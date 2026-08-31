const API_ROOT = "https://api.github.com";

/** An error raised when the GitHub API answers with a non-2xx status. */
export class GitHubError extends Error {
  constructor(message, { status, url, body } = {}) {
    super(message);
    this.name = "GitHubError";
    this.status = status;
    this.url = url;
    this.body = body;
  }

  /** True when the request failed because the rate limit is exhausted. */
  get isRateLimit() {
    return this.status === 403 && /rate limit/i.test(this.message);
  }
}

function buildUrl(root, path, params) {
  const url = new URL(path.replace(/^\//, ""), root.endsWith("/") ? root : `${root}/`);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

/**
 * Create a thin GitHub REST client.
 *
 * Unauthenticated requests are capped at 60 per hour, which is not enough for a
 * full report, so callers are expected to pass a token where they have one.
 */
export function createClient({
  token,
  root = API_ROOT,
  fetch: fetchImpl = globalThis.fetch,
  userAgent = "gh-achievements",
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("No fetch implementation available; Node 20 or newer is required");
  }

  async function request(path, { params, ...init } = {}) {
    const url = buildUrl(root, path, params);
    const headers = {
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": userAgent,
      ...init.headers,
    };
    if (token) headers.authorization = `Bearer ${token}`;

    const response = await fetchImpl(url, { ...init, headers });
    const text = await response.text();
    const body = text ? safeParse(text) : null;

    if (!response.ok) {
      const detail = body?.message ?? `HTTP ${response.status}`;
      throw new GitHubError(detail, { status: response.status, url, body });
    }

    return { body, headers: response.headers, url };
  }

  async function get(path, params) {
    const { body } = await request(path, { params });
    return body;
  }

  return { request, get, root, authenticated: Boolean(token) };
}

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
