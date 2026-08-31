import test from "node:test";
import assert from "node:assert/strict";
import yolo from "../src/achievements/yolo.js";
import { fakeClient, searchBody } from "./helpers/fake-client.js";

test("not earned when every merged pull request was reviewed", async () => {
  const client = fakeClient({ "search/issues": searchBody([], 0) });
  const result = await yolo.detect({ client, username: "octocat" });
  assert.equal(result.earned, false);
  assert.match(result.todo, /without requesting a review/);
});

test("earned as soon as one unreviewed merge exists", async () => {
  const client = fakeClient({ "search/issues": searchBody([], 3) });
  const result = await yolo.detect({ client, username: "octocat" });
  assert.equal(result.earned, true);
  assert.equal(result.maxed, true);
  assert.equal(result.todo, null);
});

test("the query asks for merges with no review", async () => {
  const client = fakeClient({ "search/issues": searchBody([], 0) });
  await yolo.detect({ client, username: "octocat" });
  assert.ok(client.calls[0].includes("review:none"));
});
