/**
 * Module dependencies.
 */

import { ChangelogFetcher } from './fetcher';
import { PullRequest } from 'src/types';
import { afterEach, describe, expect, it } from 'vitest';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';

/**
 * Fetcher tests.
 */

describe('ChangelogFetcher', () => {
  const options = {
    baseBranch: 'main',
    owner: 'some-owner',
    repo: 'some-repo',
    token: 'some-token'
  };

  afterEach(() => {
    fetchMock.restore();
    sinon.restore();
  });

  it('getRepositoryCreatedAt', async () => {
    const changelogFetcher = new ChangelogFetcher(options);
    const mockCreatedAt = '2020-01-01T00:00:00Z';

    fetchMock.mock({
      matcher: (url, opts) => {
        const body = JSON.parse(opts.body as string);

        return (
          url === 'https://api.github.com/graphql' &&
          body.query.includes('repositoryCreatedAt') &&
          body.variables.owner === options.owner &&
          body.variables.repo === options.repo
        );
      },
      method: 'POST',
      response: {
        body: {
          data: {
            repository: {
              createdAt: mockCreatedAt
            }
          }
        },
        status: 200
      }
    });

    const createdAt = await changelogFetcher.getRepositoryCreatedAt();

    expect(createdAt).toEqual(mockCreatedAt);
  });

  describe('getReleases', () => {
    const mockReleases = [
      {
        createdAt: '2020-02-01T00:00:00Z',
        name: 'Release 2',
        tagName: 'v2.0.0',
        url: 'https://github.com/example-owner/example-repo/releases/tag/v2.0.0'
      },
      {
        createdAt: '2020-01-01T00:00:00Z',
        name: 'Release 1',
        tagName: 'v1.0.0',
        url: 'https://github.com/example-owner/example-repo/releases/tag/v1.0.0'
      }
    ];

    const fetchMockReleases = () =>
      fetchMock.mock({
        matcher: (url, opts) => {
          const body = JSON.parse(opts.body as string);

          return (
            url === 'https://api.github.com/graphql' &&
            body.query.includes('getReleases') &&
            body.variables.owner === options.owner &&
            body.variables.repo === options.repo
          );
        },
        method: 'POST',
        response: {
          body: {
            data: {
              repository: {
                releases: {
                  nodes: mockReleases
                }
              }
            }
          },
          status: 200
        }
      });

    it('without future release', async () => {
      const changelogFetcher = new ChangelogFetcher(options);
      fetchMockReleases();
      const releases = await changelogFetcher.getReleases();

      expect(releases).toEqual(mockReleases);
    });

    it('with future release', async () => {
      const changelogFetcher = new ChangelogFetcher({
        ...options,
        futureRelease: '4.0.0'
      });

      fetchMockReleases();
      const releases = await changelogFetcher.getReleases();

      expect(releases.slice(1)).toEqual(mockReleases);
      expect(releases[0].url).toBe(
        `https://github.com/${options.owner}/${options.repo}/releases/tag/4.0.0`
      );
    });
  });

  it('getLatestRelease', async () => {
    const changelogFetcher = new ChangelogFetcher(options);
    const mockLatestRelease = {
      createdAt: '2020-02-01T00:00:00Z',
      name: 'Release 2',
      tagCommit: {
        committedDate: '2020-01-31T23:59:59Z'
      },
      tagName: 'v2.0.0',
      url: 'https://github.com/example-owner/example-repo/releases/tag/v2.0.0'
    };

    fetchMock.mock({
      matcher: (url, opts) => {
        const body = JSON.parse(opts.body as string);

        return (
          url === 'https://api.github.com/graphql' &&
          body.query.includes('latestRelease') &&
          body.variables.owner === options.owner &&
          body.variables.repo === options.repo
        );
      },
      method: 'POST',
      response: {
        body: {
          data: {
            repository: {
              latestRelease: {
                nodes: [mockLatestRelease]
              }
            }
          }
        },
        status: 200
      }
    });

    const latestRelease = await changelogFetcher.getLatestRelease();

    expect(latestRelease).toEqual(mockLatestRelease);
  });

  it('fetchPullRequests', async () => {
    const changelogFetcher = new ChangelogFetcher(options);
    const mockPullRequests = [
      {
        mergedAt: '2022-02-15T10:00:00Z',
        number: 1,
        title: 'Pull Request 1',
        url: 'https://github.com/example-owner/example-repo/pull/1'
      },
      {
        mergedAt: '2022-02-10T10:00:00Z',
        number: 2,
        title: 'Pull Request 2',
        url: 'https://github.com/example-owner/example-repo/pull/2'
      }
    ];

    fetchMock.mock({
      matcher: (url, opts) => {
        const body = JSON.parse(opts.body as string);

        return (
          url === 'https://api.github.com/graphql' &&
          body.query.includes('pullRequestsBefore') &&
          body.variables.owner === options.owner &&
          body.variables.repo === options.repo
        );
      },
      method: 'POST',
      response: {
        body: {
          data: {
            repository: {
              pullRequests: {
                nodes: mockPullRequests,
                pageInfo: {
                  endCursor: null,
                  hasNextPage: false
                }
              }
            }
          }
        },
        status: 200
      }
    });

    const pullRequests = await changelogFetcher.fetchPullRequests();

    expect(pullRequests).toEqual(mockPullRequests);
  });

  it('fetchFullChangelog', async () => {
    const changelogFetcher = new ChangelogFetcher(options);
    const mockRepositoryCreatedAt = '2022-01-01T00:00:00Z';
    const mockReleases = [
      {
        createdAt: '2022-03-01T10:00:00Z',
        name: 'Release 2',
        tagName: 'v2.0.0',
        url: 'https://github.com/example-owner/example-repo/releases/tag/v2.0.0'
      },
      {
        createdAt: '2022-02-01T10:00:00Z',
        name: 'Release 1',
        tagName: 'v1.0.0',
        url: 'https://github.com/example-owner/example-repo/releases/tag/v1.0.0'
      }
    ];

    const mockPullRequests = [
      {
        mergedAt: '2022-02-15T10:00:00Z',
        number: 1,
        title: 'Pull Request 1',
        url: 'https://github.com/example-owner/example-repo/pull/1'
      },
      {
        mergedAt: '2022-01-10T10:00:00Z',
        number: 2,
        title: 'Pull Request 2',
        url: 'https://github.com/example-owner/example-repo/pull/2'
      }
    ];

    fetchMock.mock({
      matcher: (url, opts) => {
        const body = JSON.parse(opts.body as string);

        return (
          url === 'https://api.github.com/graphql' &&
          body.query.includes('repositoryCreatedAt') &&
          body.variables.owner === options.owner &&
          body.variables.repo === options.repo
        );
      },
      method: 'POST',
      response: {
        body: {
          data: {
            repository: {
              createdAt: mockRepositoryCreatedAt
            }
          }
        },
        status: 200
      }
    });

    fetchMock.mock({
      matcher: (url, opts) => {
        const body = JSON.parse(opts.body as string);

        return (
          url === 'https://api.github.com/graphql' &&
          body.query.includes('getReleases') &&
          body.variables.owner === options.owner &&
          body.variables.repo === options.repo
        );
      },
      method: 'POST',
      response: {
        body: {
          data: {
            repository: {
              releases: {
                nodes: mockReleases
              }
            }
          }
        },
        status: 200
      }
    });

    const fetchPullRequestsStub = sinon
      .stub(changelogFetcher, 'fetchPullRequests')
      .resolves(mockPullRequests as PullRequest[]);

    const fullChangelog = await changelogFetcher.fetchFullChangelog();

    expect(fullChangelog).toHaveLength(mockReleases.length);
    expect(fullChangelog[0].pullRequests).toEqual([mockPullRequests[0]]);
    expect(fullChangelog[1].pullRequests).toEqual([mockPullRequests[1]]);

    fetchPullRequestsStub.restore();
  });

  it('fetchLatestChangelog', async () => {
    const changelogFetcher = new ChangelogFetcher({
      ...options,
      futureRelease: '4.0.0',
      packageName: 'some-package'
    });

    const mockLatestRelease = {
      createdAt: '2023-01-01T00:00:00Z',
      name: 'some-package 3.0.0',
      tagCommit: {
        committedDate: '2023-01-01T00:00:00Z'
      },
      tagName: '3.0.0',
      url: 'https://github.com/owner/repo/releases/tag/0.1.0'
    };

    const mockPullRequests = [
      {
        mergedAt: '2023-01-02T00:00:00Z',
        number: 1,
        title: 'Add feature A',
        url: 'https://github.com/owner/repo/pull/1'
      }
    ];

    const getLatestReleaseStub = sinon
      .stub(changelogFetcher, 'getLatestRelease')
      .resolves(mockLatestRelease);

    const fetchPullRequestsStub = sinon
      .stub(changelogFetcher, 'fetchPullRequests')
      .resolves(mockPullRequests as PullRequest[]);

    const latestChangelog = await changelogFetcher.fetchLatestChangelog();

    expect(latestChangelog).toHaveLength(1);
    expect(latestChangelog[0].tagName).toEqual('some-package-4.0.0');
    expect(latestChangelog[0].name).toEqual('some-package 4.0.0');
    expect(latestChangelog[0].pullRequests).toEqual(mockPullRequests);

    getLatestReleaseStub.restore();
    fetchPullRequestsStub.restore();
  });
});
