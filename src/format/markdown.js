import { formatTier } from "../achievements/tiers.js";

/** Render a report as a Markdown table, for pasting into a README or issue. */
export function formatMarkdown(result) {
  const lines = [
    `## GitHub achievements for [${result.username}](${result.profile.url})`,
    "",
    "| | Badge | Tier | Status |",
    "| :-: | --- | :-: | --- |",
  ];

  for (const a of result.achievements) {
    const mark = a.earned === true ? "✅" : a.earned === false ? "❌" : "❔";
    const tier = a.level ? formatTier(a.level) : "";
    const status = a.earned === true && !a.todo ? "Earned" : (a.todo ?? a.detail ?? "");
    lines.push(`| ${mark} | **${a.name}** | ${tier} | ${escapePipes(status)} |`);
  }

  const known = result.achievements.filter((a) => a.earned !== null).length;
  lines.push("", `**${result.earned} of ${known} earned.**`, "");
  return lines.join("\n");
}

function escapePipes(text) {
  return String(text).replaceAll("|", "\\|");
}
