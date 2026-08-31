const registry = new Map();

/**
 * Register an achievement detector.
 *
 * Detectors register themselves on import, so adding a badge means adding a
 * module and importing it — no central list to keep in sync twice.
 */
export function register(achievement) {
  for (const field of ["id", "name", "detect"]) {
    if (!achievement?.[field]) throw new TypeError(`Achievement is missing "${field}"`);
  }
  if (registry.has(achievement.id)) {
    throw new Error(`Achievement "${achievement.id}" is already registered`);
  }
  registry.set(achievement.id, achievement);
  return achievement;
}

/** Every registered achievement, in registration order. */
export function all() {
  return [...registry.values()];
}

/** Look up a single achievement by id. */
export function get(id) {
  return registry.get(id) ?? null;
}

/** Test seam: forget everything that has been registered. */
export function reset() {
  registry.clear();
}
