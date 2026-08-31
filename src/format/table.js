import { createPalette, visibleLength } from "./color.js";
import { formatTier } from "../achievements/tiers.js";

/** Render a report as an aligned, human-readable block of text. */
export function formatTable(result, { color = false } = {}) {
  const c = createPalette({ enabled: color });
  const lines = ["", `  ${c.bold(`Achievements for ${result.username}`)}`, ""];

  const rows = result.achievements.map((a) => ({
    mark: a.earned === true ? c.green("✔") : a.earned === false ? c.red("✖") : c.yellow("?"),
    name: a.earned === true ? c.bold(a.name) : a.name,
    tier: a.level ? formatTier(a.level) : "",
    note: a.earned === true && !a.todo ? c.dim("earned") : c.dim(a.todo ?? a.detail ?? ""),
  }));

  const nameWidth = widest(rows.map((r) => r.name));
  const tierWidth = widest(rows.map((r) => r.tier));

  for (const row of rows) {
    lines.push(
      `  ${row.mark}  ${pad(row.name, nameWidth)}  ${pad(row.tier, tierWidth)}  ${row.note}`.trimEnd(),
    );
  }

  const known = result.achievements.filter((a) => a.earned !== null).length;
  lines.push("", `  ${c.bold(String(result.earned))} of ${known} earned`);
  if (!result.authenticated) {
    lines.push(`  ${c.dim("unauthenticated — pass --token to raise the rate limit")}`);
  }
  lines.push("");

  return lines.join("\n");
}

function widest(values) {
  return values.reduce((max, value) => Math.max(max, visibleLength(value)), 0);
}

function pad(value, width) {
  return value + " ".repeat(Math.max(0, width - visibleLength(value)));
}
