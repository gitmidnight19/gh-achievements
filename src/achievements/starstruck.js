import { register } from "./registry.js";
import { resolveTier } from "./tiers.js";
import { fetchRepos } from "../github/user.js";

export const THRESHOLDS = [16, 128, 512, 4096];

/** The highest star count across a list of repositories. */
export function peakStars(repos) {
  return (repos ?? []).reduce((max, repo) => Math.max(max, repo?.stargazers_count ?? 0), 0);
}

export default register({
  id: "starstruck",
  name: "Starstruck",
  description: "Created a repository that many people starred.",
  tiers: THRESHOLDS,

  async detect({ client, username, repos }) {
    const list = repos ?? (await fetchRepos(client, username));
    const owned = list.filter((repo) => !repo.fork);
    const count = peakStars(owned);
    const best = owned.find((repo) => (repo.stargazers_count ?? 0) === count);
    const tier = resolveTier(count, THRESHOLDS);

    return {
      ...tier,
      exact: true,
      detail: best ? `${count} stars on ${best.name}` : "no public repositories",
      todo: tier.maxed ? null : `${tier.remaining} more stars on a single repository`,
    };
  },
});
