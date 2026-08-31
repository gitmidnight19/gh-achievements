import test from "node:test";
import assert from "node:assert/strict";
import { createPalette, supportsColor, visibleLength } from "../src/format/color.js";

const ESC = String.fromCharCode(27);

test("an enabled palette wraps text in escape codes", () => {
  const c = createPalette({ enabled: true });
  assert.equal(c.green("ok"), `${ESC}[32mok${ESC}[0m`);
  assert.equal(c.bold("hi"), `${ESC}[1mhi${ESC}[0m`);
});

test("a disabled palette is the identity", () => {
  const c = createPalette({ enabled: false });
  assert.equal(c.green("ok"), "ok");
  assert.equal(c.dim(42), "42");
});

test("visibleLength ignores escape codes", () => {
  const c = createPalette({ enabled: true });
  assert.equal(visibleLength(c.red("abc")), 3);
  assert.equal(visibleLength("abc"), 3);
});

test("NO_COLOR wins over a TTY", () => {
  assert.equal(supportsColor({ isTTY: true }, { NO_COLOR: "1" }), false);
});

test("FORCE_COLOR wins over a non-TTY", () => {
  assert.equal(supportsColor({ isTTY: false }, { FORCE_COLOR: "1" }), true);
  assert.equal(supportsColor({ isTTY: true }, { FORCE_COLOR: "0" }), false);
});

test("otherwise colour follows the TTY flag", () => {
  assert.equal(supportsColor({ isTTY: true }, {}), true);
  assert.equal(supportsColor({ isTTY: false }, {}), false);
  assert.equal(supportsColor(undefined, {}), false);
});
