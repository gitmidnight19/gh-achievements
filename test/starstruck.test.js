import test from "node:test";
import assert from "node:assert/strict";
import starstruck, { peakStars } from "../src/achievements/starstruck.js";

const repo = (name, stars, fork = false) => ({ name, stargazers_count: stars, fork });

test("peakStars takes the highest count", () => {
  assert.equal(peakStars([repo("a", 3), repo("b", 40), repo("c", 1)]), 40);
});

test("peakStars is zero for an empty list", () => {
  assert.equal(peakStars([]), 0);
  assert.equal(peakStars(undefined), 0);
});

test("forks do not count towards the badge", async () => {
  const repos = [repo("mine", 4), repo("a-fork", 900, true)];
  const result = await starstruck.detect({ repos, username: "octocat" });
  assert.equal(result.count, 4);
  assert.equal(result.earned, false);
  assert.equal(result.todo, "12 more stars on a single repository");
});

test("earned at sixteen stars on one repository", async () => {
  const result = await starstruck.detect({ repos: [repo("hit", 20)], username: "octocat" });
  assert.equal(result.earned, true);
  assert.equal(result.detail, "20 stars on hit");
});
