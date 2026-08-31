import test from "node:test";
import assert from "node:assert/strict";
import { register, all, get, reset } from "../src/achievements/registry.js";

test.afterEach(() => reset());

const stub = { id: "stub", name: "Stub", detect: async () => ({ earned: false }) };

test("a registered achievement can be looked up by id", () => {
  register(stub);
  assert.equal(get("stub").name, "Stub");
  assert.deepEqual(all().map((a) => a.id), ["stub"]);
});

test("get returns null for an unknown id", () => {
  assert.equal(get("nope"), null);
});

test("registering the same id twice is an error", () => {
  register(stub);
  assert.throws(() => register(stub), /already registered/);
});

test("an achievement missing a required field is rejected", () => {
  assert.throws(() => register({ id: "x", name: "X" }), TypeError);
  assert.throws(() => register({ name: "X", detect: async () => ({}) }), TypeError);
});

test("registration order is preserved", () => {
  register({ ...stub, id: "a" });
  register({ ...stub, id: "b" });
  assert.deepEqual(all().map((a) => a.id), ["a", "b"]);
});
