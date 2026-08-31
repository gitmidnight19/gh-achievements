import { createClient } from "./github/client.js";
import { fetchUser, fetchRepos } from "./github/user.js";
import { all, get } from "./achievements/index.js";

/**
 * Build an achievement report for a public GitHub profile.
 *
 * Every detector runs against a shared context so that the repository list —
 * the most expensive fetch — is paid for once.
 */
export async function report(username, { token, client: given, only, sample } = {}) {
  if (!username || typeof username !== "string") {
    throw new TypeError("A GitHub username is required");
  }

  const client = given ?? createClient({ token: token ?? process.env.GITHUB_TOKEN });
  const wanted = normaliseOnly(only);

  const user = await fetchUser(client, username);
  const repos = await fetchRepos(client, username);
  const context = { client, username: user.login, user, repos, sample };

  const selected = wanted ? wanted.map(requireAchievement) : all();
  const achievements = [];

  for (const achievement of selected) {
    achievements.push({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      tiers: achievement.tiers ?? null,
      ...(await runDetector(achievement, context)),
    });
  }

  return {
    username: user.login,
    profile: {
      name: user.name ?? null,
      url: user.html_url,
      publicRepos: user.public_repos ?? 0,
    },
    achievements,
    earned: achievements.filter((a) => a.earned === true).length,
    total: achievements.length,
    authenticated: client.authenticated ?? false,
    generatedAt: new Date().toISOString(),
  };
}

async function runDetector(achievement, context) {
  try {
    return await achievement.detect(context);
  } catch (error) {
    return {
      earned: null,
      unknown: true,
      exact: false,
      detail: `check failed: ${error.message}`,
      todo: null,
      error: error.message,
    };
  }
}

function normaliseOnly(only) {
  if (!only) return null;
  const list = Array.isArray(only) ? only : String(only).split(",");
  const cleaned = list.map((id) => id.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : null;
}

function requireAchievement(id) {
  const found = get(id);
  if (!found) throw new Error(`Unknown achievement "${id}"`);
  return found;
}
