import test from "node:test";
import assert from "node:assert/strict";
import pair, { coAuthors } from "../src/achievements/pair-extraordinaire.js";
import { fakeClient, searchBody } from "./helpers/fake-client.js";

test("coAuthors finds a trailer", () => {
  const message = "Fix the thing\n\nCo-authored-by: Ada <ada@example.com>";
  assert.deepEqual(coAuthors(message), [{ name: "Ada", email: "ada@example.com" }]);
});

test("coAuthors is case insensitive and finds several", () => {
  const message = "x\n\nco-authored-by: A <a@x.com>\nCO-AUTHORED-BY: B <B@X.com>";
  assert.deepEqual(coAuthors(message).map((c) => c.email), ["a@x.com", "b@x.com"]);
});

test("coAuthors ignores messages with no trailer", () => {
  assert.deepEqual(coAuthors("Just a commit"), []);
  assert.deepEqual(coAuthors(undefined), []);
});

test("counts merged pull requests carrying a co-authored commit", async () => {
  const client = fakeClient({
    "search/issues": searchBody([
      { pull_request: { url: "https://api.github.com/repos/o/r/pulls/1" } },
      { pull_request: { url: "https://api.github.com/repos/o/r/pulls/2" } },
    ]),
    "repos/o/r/pulls/1/commits": [{ commit: { message: "x\n\nCo-authored-by: A <a@x.com>" } }],
    "repos/o/r/pulls/2/commits": [{ commit: { message: "plain" } }],
  });

  const result = await pair.detect({ client, username: "octocat" });
  assert.equal(result.count, 1);
  assert.equal(result.earned, true);
  assert.equal(result.exact, false);
});

test("an earned badge is told how far the next tier is, not how to start", async () => {
  const client = fakeClient({
    "search/issues": searchBody([
      { pull_request: { url: "https://api.github.com/repos/o/r/pulls/1" } },
    ]),
    "repos/o/r/pulls/1/commits": [{ commit: { message: "x\n\nCo-authored-by: A <a@x.com>" } }],
  });

  const result = await pair.detect({ client, username: "octocat" });
  assert.equal(result.earned, true);
  assert.equal(result.todo, "9 more co-authored pull requests");
});

test("not earned when no merged pull request is co-authored", async () => {
  const client = fakeClient({
    "search/issues": searchBody([
      { pull_request: { url: "https://api.github.com/repos/o/r/pulls/1" } },
    ]),
    "repos/o/r/pulls/1/commits": [{ commit: { message: "plain" } }],
  });
  const result = await pair.detect({ client, username: "octocat" });
  assert.equal(result.earned, false);
  assert.match(result.todo, /Co-authored-by/);
});
