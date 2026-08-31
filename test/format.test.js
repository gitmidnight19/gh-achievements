import test from "node:test";
import assert from "node:assert/strict";
import { formatTable } from "../src/format/table.js";
import { formatJson } from "../src/format/json.js";
import { formatMarkdown } from "../src/format/markdown.js";

const result = {
  username: "octocat",
  profile: { name: "The Octocat", url: "https://github.com/octocat", publicRepos: 8 },
  authenticated: true,
  achievements: [
    { id: "pull-shark", name: "Pull Shark", level: 2, earned: true, todo: "108 more merged pull requests" },
    { id: "yolo", name: "YOLO", level: 1, earned: true, todo: null },
    { id: "quickdraw", name: "Quickdraw", level: 0, earned: false, todo: "close one within five minutes" },
    { id: "galaxy-brain", name: "Galaxy Brain", level: null, earned: null, detail: "not exposed by the REST API" },
  ],
  earned: 2,
  total: 4,
};

test("the table names the user and every achievement", () => {
  const text = formatTable(result);
  assert.match(text, /Achievements for octocat/);
  for (const a of result.achievements) assert.ok(text.includes(a.name), `missing ${a.name}`);
});

test("the table marks earned, missing and unknown differently", () => {
  const text = formatTable(result);
  assert.match(text, /✔\s+Pull Shark/);
  assert.match(text, /✖\s+Quickdraw/);
  assert.match(text, /\?\s+Galaxy Brain/);
});

test("the table shows the tier multiplier only above level one", () => {
  const text = formatTable(result);
  assert.match(text, /Pull Shark\s+x2/);
  assert.ok(!/YOLO\s+x1/.test(text));
});

test("the table counts only achievements with a known state", () => {
  assert.match(formatTable(result), /2 of 3 earned/);
});

test("the table warns when the run was unauthenticated", () => {
  assert.match(formatTable({ ...result, authenticated: false }), /--token/);
  assert.ok(!/--token/.test(formatTable(result)));
});

test("the table emits no escape codes unless colour is on", () => {
  const esc = String.fromCharCode(27);
  assert.ok(!formatTable(result).includes(esc));
  assert.ok(formatTable(result, { color: true }).includes(esc));
});

test("json output round-trips", () => {
  assert.deepEqual(JSON.parse(formatJson(result)), result);
});

test("json output honours the indent option", () => {
  assert.ok(!formatJson(result, { indent: 0 }).includes("\n"));
});

test("markdown output is a table with a row per achievement", () => {
  const text = formatMarkdown(result);
  assert.match(text, /\[octocat\]\(https:\/\/github\.com\/octocat\)/);
  assert.match(text, /\| :-: \| --- \| :-: \| --- \|/);
  assert.match(text, /\| ✅ \| \*\*Pull Shark\*\* \| x2 \|/);
  assert.match(text, /\| ❌ \| \*\*Quickdraw\*\* \|/);
  assert.match(text, /\| ❔ \| \*\*Galaxy Brain\*\* \|/);
  assert.match(text, /\*\*2 of 3 earned\.\*\*/);
});

test("markdown escapes pipes so a status cannot break the table", () => {
  const risky = { ...result, achievements: [{ name: "X", level: 0, earned: false, todo: "a | b" }] };
  assert.match(formatMarkdown(risky), /a \\\| b/);
});
