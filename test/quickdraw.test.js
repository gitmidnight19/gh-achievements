import test from "node:test";
import assert from "node:assert/strict";
import quickdraw, { closedQuickly, WINDOW_MS } from "../src/achievements/quickdraw.js";
import { fakeClient, searchBody } from "./helpers/fake-client.js";

const opened = "2026-01-01T12:00:00Z";
const item = (closedAt) => ({ created_at: opened, closed_at: closedAt });

test("closedQuickly accepts a close inside the five minute window", () => {
  assert.equal(closedQuickly(item("2026-01-01T12:04:59Z")), true);
  assert.equal(closedQuickly(item("2026-01-01T12:05:00Z")), true);
});

test("closedQuickly rejects a close outside the window", () => {
  assert.equal(closedQuickly(item("2026-01-01T12:05:01Z")), false);
  assert.equal(closedQuickly(item("2026-01-02T12:00:00Z")), false);
});

test("closedQuickly rejects items that are still open or malformed", () => {
  assert.equal(closedQuickly({ created_at: opened, closed_at: null }), false);
  assert.equal(closedQuickly({ created_at: "not a date", closed_at: opened }), false);
  assert.equal(closedQuickly(null), false);
});

test("the window is five minutes", () => {
  assert.equal(WINDOW_MS, 300000);
});

test("earned when any recent item closed fast", async () => {
  const client = fakeClient({
    "search/issues": searchBody([item("2026-01-05T00:00:00Z"), item("2026-01-01T12:01:00Z")]),
  });
  const result = await quickdraw.detect({ client, username: "octocat" });
  assert.equal(result.earned, true);
  assert.equal(result.count, 1);
});

test("not earned when nothing recent closed fast", async () => {
  const client = fakeClient({ "search/issues": searchBody([item("2026-02-01T00:00:00Z")]) });
  const result = await quickdraw.detect({ client, username: "octocat" });
  assert.equal(result.earned, false);
  assert.equal(result.exact, false);
});
