const CODES = {
  reset: 0,
  bold: 1,
  dim: 2,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  grey: 90,
};

/**
 * Build a set of colour functions.
 *
 * When colour is off every function is the identity, so call sites never need
 * to branch on whether the output is a terminal.
 */
export function createPalette({ enabled = true } = {}) {
  const palette = {};
  for (const [name, code] of Object.entries(CODES)) {
    palette[name] = enabled ? (text) => `\u001b[${code}m${text}\u001b[0m` : (text) => String(text);
  }
  palette.enabled = enabled;
  return palette;
}

/** Decide whether ANSI colour is appropriate for the current process. */
export function supportsColor(stream = process.stdout, env = process.env) {
  if (env.NO_COLOR) return false;
  if (env.FORCE_COLOR) return env.FORCE_COLOR !== "0";
  return Boolean(stream?.isTTY);
}

/** Length of a string with ANSI escapes discarded, for column alignment. */
export function visibleLength(text) {
  // eslint-disable-next-line no-control-regex
  return String(text).replace(/\u001b\[[0-9;]*m/g, "").length;
}
