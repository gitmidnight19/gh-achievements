/** Render a report as JSON, for piping into another tool. */
export function formatJson(result, { indent = 2 } = {}) {
  return JSON.stringify(result, null, indent);
}
