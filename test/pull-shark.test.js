import test from "node:test";
import assert from "node:assert/strict";
import pullShark from "../src/achievements/pull-shark.js";
import { fakeClient, searchBody } from "./helpers/fake-client.js";

function clientWith(total) {
  return fakeClient({ "search/issues": searchBody([], total) });
}

test("not earned below two merged pull requests", async () => {
  const result = await pullShark.detect({ client: clientWith(1), username: "octocat" });
  assert.equal(result.earned, false);
  assert.equal(result.count, 1);
  assert.equal(result.todo, "1 more merged pull request");
});

test("earned at two merged pull requests", async () => {
  const result = await pullShark.detect({ client: clientWith(2), username: "octocat" });
  assert.equal(result.earned, true);
  assert.equal(result.level, 1);
  assert.equal(result.detail, "2 merged pull requests");
});

test("reaches the second tier at sixteen", async () => {
  const result = await pullShark.detect({ client: clientWith(20), username: "octocat" });
  assert.equal(result.level, 2);
  assert.equal(result.todo, "108 more merged pull requests");
});

test("the query filters to merged pull requests by the user", async () => {
  const client = clientWith(0);
  await pullShark.detect({ client, username: "octocat" });
  assert.ok(client.calls[0].includes("is:pr is:merged author:octocat"));
});
