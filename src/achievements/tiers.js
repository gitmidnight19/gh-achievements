/**
 * Work out which tier a count has reached against an ascending threshold list.
 *
 * GitHub draws multi-level badges with an "x2", "x3", "x4" overlay rather than
 * naming the levels, so the level number is what callers render.
 */
export function resolveTier(count, thresholds) {
  if (!Array.isArray(thresholds) || thresholds.length === 0) {
    throw new TypeError("thresholds must be a non-empty array");
  }

  const sorted = [...thresholds].sort((a, b) => a - b);
  let level = 0;
  for (const threshold of sorted) {
    if (count >= threshold) level += 1;
  }

  const next = sorted[level] ?? null;
  return {
    count,
    level,
    earned: level > 0,
    next,
    remaining: next === null ? 0 : next - count,
    maxed: next === null,
  };
}

/** Format a tier for display: `""` for level 1, `"x3"` beyond that. */
export function formatTier(level) {
  return level > 1 ? `x${level}` : "";
}
