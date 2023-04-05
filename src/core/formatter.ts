/**
 * Module dependencies.
 */

import { Release } from 'src/types';

/**
 * Export `formatChangelog`.
 */

export function formatChangelog(releases: Release[]): string {
  return `# Changelog\n${releases
    .map(release => {
      const releaseHeader = `\n## [${release.name || release.tagName}](${
        release.url
      }) (${new Date(release.createdAt).toISOString().slice(0, 10)})\n`;

      const pullRequestsText =
        release.pullRequests && release.pullRequests.length > 0
          ? release.pullRequests
            .map(({ author, number, title, url }) => {
              return `- ${title} [\\#${number}](${url}) ([${author.login}](${author.url}))\n`;
            })
            .join('')
          : '';

      return releaseHeader + pullRequestsText;
    })
    .join('')}`;
}
