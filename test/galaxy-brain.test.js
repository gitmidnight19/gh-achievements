import test from "node:test";
import assert from "node:assert/strict";
import galaxyBrain from "../src/achievements/galaxy-brain.js";

test("reports unknown rather than guessing", async () => {
  const result = await galaxyBrain.detect({});
  assert.equal(result.unknown, true);
  assert.equal(result.earned, null);
  assert.equal(result.exact, false);
  assert.match(result.detail, /REST API/);
});
