import test from "node:test";
import assert from "node:assert/strict";
import { parseLinkHeader, paginate, collect } from "../src/github/paginate.js";

test("parseLinkHeader returns an empty object for a missing header", () => {
  assert.deepEqual(parseLinkHeader(undefined), {});
  assert.deepEqual(parseLinkHeader(""), {});
});

test("parseLinkHeader picks out each rel", () => {
  const header =
    '<https://api.github.com/x?page=2>; rel="next", <https://api.github.com/x?page=9>; rel="last"';
  assert.deepEqual(parseLinkHeader(header), {
    next: "https://api.github.com/x?page=2",
    last: "https://api.github.com/x?page=9",
  });
});

function pagedClient(pages) {
  let index = 0;
  return {
    async request() {
      const page = pages[index];
      index += 1;
      const link = index < pages.length ? '<https://api.github.com/next>; rel="next"' : "";
      return { body: page, headers: new Headers(link ? { link } : {}) };
    },
  };
}

test("paginate walks every page while a next link is present", async () => {
  const client = pagedClient([[1, 2], [3, 4], [5]]);
  assert.deepEqual(await collect(client, "things"), [1, 2, 3, 4, 5]);
});

test("paginate stops at max", async () => {
  const client = pagedClient([[1, 2], [3, 4], [5]]);
  assert.deepEqual(await collect(client, "things", { max: 3 }), [1, 2, 3]);
});

test("paginate unwraps the items array of a search response", async () => {
  const client = { async request() { return { body: { items: ["a"] }, headers: new Headers() }; } };
  assert.deepEqual(await collect(client, "search/issues"), ["a"]);
});

test("paginate stops on an empty page", async () => {
  const client = { async request() { return { body: [], headers: new Headers() }; } };
  assert.deepEqual(await collect(client, "things"), []);
});
