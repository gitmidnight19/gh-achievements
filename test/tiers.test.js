import test from "node:test";
import assert from "node:assert/strict";
import { resolveTier, formatTier } from "../src/achievements/tiers.js";

test("resolveTier reports nothing earned below the first threshold", () => {
  const tier = resolveTier(1, [2, 16, 128]);
  assert.equal(tier.level, 0);
  assert.equal(tier.earned, false);
  assert.equal(tier.next, 2);
  assert.equal(tier.remaining, 1);
  assert.equal(tier.maxed, false);
});

test("resolveTier climbs one level per threshold passed", () => {
  assert.equal(resolveTier(2, [2, 16, 128]).level, 1);
  assert.equal(resolveTier(15, [2, 16, 128]).level, 1);
  assert.equal(resolveTier(16, [2, 16, 128]).level, 2);
  assert.equal(resolveTier(9000, [2, 16, 128]).level, 3);
});

test("resolveTier marks the top level as maxed with nothing remaining", () => {
  const tier = resolveTier(200, [2, 16, 128]);
  assert.equal(tier.maxed, true);
  assert.equal(tier.next, null);
  assert.equal(tier.remaining, 0);
});

test("resolveTier tolerates unsorted thresholds", () => {
  assert.equal(resolveTier(16, [128, 2, 16]).level, 2);
});

test("resolveTier rejects an empty threshold list", () => {
  assert.throws(() => resolveTier(1, []), TypeError);
});

test("formatTier hides the multiplier at level one", () => {
  assert.equal(formatTier(1), "");
  assert.equal(formatTier(3), "x3");
});
