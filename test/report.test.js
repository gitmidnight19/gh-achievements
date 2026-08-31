import test from "node:test";
import assert from "node:assert/strict";
import { report } from "../src/report.js";
import { fakeClient, searchBody } from "./helpers/fake-client.js";

function client(overrides = {}) {
  return fakeClient({
    "users/octocat/repos": [{ name: "hit", stargazers_count: 20, fork: false }],
    "users/octocat": { login: "octocat", name: "The Octocat", html_url: "https://github.com/octocat", public_repos: 8 },
    "search/issues": searchBody([], 4),
    ...overrides,
  });
}

test("a report covers every registered achievement", async () => {
  const result = await report("octocat", { client: client() });
  const ids = result.achievements.map((a) => a.id);
  assert.ok(ids.includes("pull-shark"));
  assert.ok(ids.includes("starstruck"));
  assert.equal(result.total, ids.length);
});

test("the report echoes the canonical login and profile", async () => {
  const result = await report("OctoCat", { client: client() });
  assert.equal(result.username, "octocat");
  assert.equal(result.profile.name, "The Octocat");
  assert.equal(result.profile.publicRepos, 8);
});

test("only counts achievements that were actually earned", async () => {
  const result = await report("octocat", { client: client() });
  const earned = result.achievements.filter((a) => a.earned === true);
  assert.equal(result.earned, earned.length);
});

test("--only narrows the report to the named achievements", async () => {
  const result = await report("octocat", { client: client(), only: "pull-shark,starstruck" });
  assert.deepEqual(result.achievements.map((a) => a.id), ["pull-shark", "starstruck"]);
});

test("--only accepts an array and trims whitespace", async () => {
  const result = await report("octocat", { client: client(), only: [" yolo "] });
  assert.deepEqual(result.achievements.map((a) => a.id), ["yolo"]);
});

test("an unknown achievement id is an error", async () => {
  await assert.rejects(report("octocat", { client: client(), only: "nope" }), /Unknown achievement/);
});

test("a detector that throws is reported, not fatal", async () => {
  const boom = client({
    "search/issues": () => {
      throw new Error("boom");
    },
  });
  const result = await report("octocat", { client: boom, only: "pull-shark" });
  assert.equal(result.achievements[0].earned, null);
  assert.equal(result.achievements[0].error, "boom");
  assert.match(result.achievements[0].detail, /check failed/);
});

test("a missing username is rejected up front", async () => {
  await assert.rejects(report(""), TypeError);
  await assert.rejects(report(undefined), TypeError);
});

test("the report records whether the client was authenticated", async () => {
  const result = await report("octocat", { client: client() });
  assert.equal(result.authenticated, true);
  assert.match(result.generatedAt, /^\d{4}-\d{2}-\d{2}T/);
});
