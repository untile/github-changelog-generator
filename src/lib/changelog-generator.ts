/**
 * Module dependencies.
 */

import { ChangelogFetcher } from 'src/core/fetcher';
import { ChangelogOptions } from 'src/types';
import { formatChangelog } from 'src/core/formatter';
import { getGitRepo } from 'src/core/utils';

/**
 * Export `changelogGenerator`.
 */

export async function changelogGenerator(options: Partial<ChangelogOptions>) {
  const { baseBranch, futureRelease, futureReleaseTag, labels, rebuild } =
    options;

  const token = process.env.GITHUB_TOKEN;
  let { owner, packageName, repo } = options;

  if (!owner || !repo) {
    ({ owner, repo } = getGitRepo(owner, repo));
  }

  if (packageName?.includes('/')) {
    packageName = packageName.split('/')[1];
  }

  const fetcher = new ChangelogFetcher({
    baseBranch,
    futureRelease,
    futureReleaseTag,
    labels,
    owner,
    packageName,
    repo,
    token
  } as ChangelogOptions);

  const releases = await (rebuild
    ? fetcher.fetchFullChangelog()
    : fetcher.fetchLatestChangelog());

  return formatChangelog(releases);
}
