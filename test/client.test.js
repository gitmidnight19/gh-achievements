import test from "node:test";
import assert from "node:assert/strict";
import { createClient, GitHubError } from "../src/github/client.js";

function stubFetch(response, seen = []) {
  return async (url, init) => {
    seen.push({ url, init });
    return response;
  };
}

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(),
    async text() {
      return JSON.stringify(body);
    },
  };
}

test("get returns the parsed body", async () => {
  const client = createClient({ fetch: stubFetch(jsonResponse({ login: "octocat" })) });
  assert.deepEqual(await client.get("users/octocat"), { login: "octocat" });
});

test("query parameters are appended to the URL", async () => {
  const seen = [];
  const client = createClient({ fetch: stubFetch(jsonResponse([]), seen) });
  await client.get("search/issues", { q: "is:pr", per_page: 1 });
  assert.match(seen[0].url, /search\/issues\?q=is%3Apr&per_page=1$/);
});

test("undefined parameters are dropped", async () => {
  const seen = [];
  const client = createClient({ fetch: stubFetch(jsonResponse([]), seen) });
  await client.get("things", { a: 1, b: undefined });
  assert.match(seen[0].url, /things\?a=1$/);
});

test("a token becomes a bearer header", async () => {
  const seen = [];
  const client = createClient({ token: "secret", fetch: stubFetch(jsonResponse({}), seen) });
  await client.get("user");
  assert.equal(seen[0].init.headers.authorization, "Bearer secret");
  assert.equal(client.authenticated, true);
});

test("no token means no authorization header", async () => {
  const seen = [];
  const client = createClient({ fetch: stubFetch(jsonResponse({}), seen) });
  await client.get("user");
  assert.equal(seen[0].init.headers.authorization, undefined);
  assert.equal(client.authenticated, false);
});

test("a non-2xx status raises GitHubError carrying the API message", async () => {
  const client = createClient({ fetch: stubFetch(jsonResponse({ message: "Not Found" }, 404)) });
  await assert.rejects(client.get("users/nobody"), (error) => {
    assert.ok(error instanceof GitHubError);
    assert.equal(error.status, 404);
    assert.equal(error.message, "Not Found");
    return true;
  });
});

test("isRateLimit recognises an exhausted quota", async () => {
  const body = { message: "API rate limit exceeded for 1.2.3.4" };
  const client = createClient({ fetch: stubFetch(jsonResponse(body, 403)) });
  await assert.rejects(client.get("x"), (error) => error.isRateLimit === true);
});

test("a missing fetch implementation is rejected up front", () => {
  assert.throws(() => createClient({ fetch: null }), TypeError);
});
