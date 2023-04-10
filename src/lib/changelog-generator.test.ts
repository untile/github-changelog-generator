/**
 * Module dependencies.
 */

import { ChangelogOptions } from 'src/types';
import { changelogGenerator } from './changelog-generator';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fetchMock from 'fetch-mock';

/**
 * Common options for tests with workspaces.
 */

const commonWorkspacesOptions: Partial<ChangelogOptions> = {
  baseBranch: 'main',
  owner: 'untile',
  repo: 'workspaces'
};

/**
 * Common options for tests without workspaces.
 */

const commonNoWorkspacesOptions: Partial<ChangelogOptions> = {
  ...commonWorkspacesOptions,
  repo: 'no-workspaces'
};

/**
 * `fetchMockHelper` util.
 */

const fetchMockHelper = (query: string, input: object, output: object) => {
  fetchMock.mock({
    matcher: (url, opts) => {
      const body = JSON.parse(opts.body as string);

      return (
        url === 'https://api.github.com/graphql' &&
        body.query.includes(query) &&
        Object.entries(input).every(
          ([key, value]) =>
            JSON.stringify(body.variables[key]) === JSON.stringify(value)
        )
      );
    },
    method: 'POST',
    response: {
      body: {
        data: output
      },
      status: 200
    }
  });
};

/**
 * Changelog generator tests.
 */

describe('Changelog generator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime('2023-04-04T12:00:00.000Z');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('without workspaces', () => {
    beforeEach(() => {
      fetchMockHelper(
        'repositoryCreatedAt',
        {
          owner: 'untile',
          repo: 'no-workspaces'
        },
        {
          repository: {
            createdAt: '2023-03-31T11:33:40Z'
          }
        }
      );

      fetchMockHelper(
        'getReleases',
        {
          owner: 'untile',
          repo: 'no-workspaces'
        },
        {
          repository: {
            releases: {
              nodes: [
                {
                  createdAt: '2023-04-03T13:15:17Z',
                  name: '4.0.0',
                  tagName: '4.0.0',
                  url: 'https://github.com/untile/no-workspaces/releases/tag/4.0.0'
                },
                {
                  createdAt: '2023-03-31T11:56:57Z',
                  name: '3.0.0',
                  tagName: '3.0.0',
                  url: 'https://github.com/untile/no-workspaces/releases/tag/3.0.0'
                }
              ]
            }
          }
        }
      );

      fetchMockHelper(
        'pullRequestsBefore',
        {
          base: 'main',
          first: 100,
          owner: 'untile',
          repo: 'no-workspaces'
        },
        {
          repository: {
            pullRequests: {
              nodes: [
                {
                  author: {
                    login: 'luisdralves',
                    url: 'https://github.com/luisdralves'
                  },
                  mergedAt: '2023-04-03T13:19:33Z',
                  number: 5,
                  title: 'Add snorlax',
                  url: 'https://github.com/untile/no-workspaces/pull/5'
                },
                {
                  author: {
                    login: 'luisdralves',
                    url: 'https://github.com/luisdralves'
                  },
                  mergedAt: '2023-03-31T12:01:59Z',
                  number: 4,
                  title: 'Add eevee',
                  url: 'https://github.com/untile/no-workspaces/pull/4'
                },
                {
                  author: {
                    login: 'luisdralves',
                    url: 'https://github.com/luisdralves'
                  },
                  mergedAt: '2023-03-31T12:00:50Z',
                  number: 3,
                  title: 'Add sentret',
                  url: 'https://github.com/untile/no-workspaces/pull/3'
                },
                {
                  author: {
                    login: 'luisdralves',
                    url: 'https://github.com/luisdralves'
                  },
                  mergedAt: '2023-03-31T11:59:35Z',
                  number: 2,
                  title: 'Add pikachu',
                  url: 'https://github.com/untile/no-workspaces/pull/2'
                },
                {
                  author: {
                    login: 'luisdralves',
                    url: 'https://github.com/luisdralves'
                  },
                  mergedAt: '2023-03-31T11:54:26Z',
                  number: 1,
                  title: 'Add starters',
                  url: 'https://github.com/untile/no-workspaces/pull/1'
                }
              ],
              pageInfo: {
                endCursor:
                  'Y3Vyc29yOnYyOpK5MjAyMy0wMy0zMVQxMjo1NDoyOCswMTowMM5NWFhu',
                hasNextPage: false
              }
            }
          }
        }
      );

      fetchMockHelper(
        'latestRelease',
        {
          owner: 'untile',
          repo: 'no-workspaces'
        },
        {
          repository: {
            latestRelease: {
              nodes: [
                {
                  createdAt: '2023-04-03T13:15:17Z',
                  name: '4.0.0',
                  tagCommit: {
                    committedDate: '2023-04-03T13:15:17Z'
                  },
                  tagName: '4.0.0',
                  url: 'https://github.com/untile/no-workspaces/releases/tag/4.0.0'
                }
              ]
            }
          }
        }
      );
    });

    it('regenerates the full changelog', async () => {
      expect(
        await changelogGenerator({
          ...commonNoWorkspacesOptions
        })
      ).toMatchSnapshot();
    });

    it('generates the latest changelog for a future root release', async () => {
      expect(
        await changelogGenerator({
          ...commonNoWorkspacesOptions,
          futureRelease: '5.0.0',
          latest: true
        })
      ).toMatchSnapshot();
    });

    it('generates the full changelog for a future root release', async () => {
      expect(
        await changelogGenerator({
          ...commonNoWorkspacesOptions,
          futureRelease: '5.0.0'
        })
      ).toMatchSnapshot();
    });

    it('fails when requesting a future release that already exists', async () => {
      try {
        await changelogGenerator({
          ...commonNoWorkspacesOptions,
          futureRelease: '4.0.0',
          latest: true
        });
      } catch (error) {
        expect(error).toMatchObject({
          message: 'Changelog already on the latest release'
        });
      }

      try {
        await changelogGenerator({
          ...commonNoWorkspacesOptions,
          futureRelease: '4.0.0'
        });
      } catch (error) {
        expect(error).toMatchObject({
          message: 'Changelog already on the latest release'
        });
      }
    });
  });

  describe('with workspaces', () => {
    beforeEach(() => {
      fetchMockHelper(
        'repositoryCreatedAt',
        {
          owner: 'untile',
          repo: 'workspaces'
        },
        {
          repository: {
            createdAt: '2023-03-30T20:59:23Z'
          }
        }
      );

      fetchMockHelper(
        'getReleases',
        {
          owner: 'untile',
          repo: 'workspaces'
        },
        {
          repository: {
            releases: {
              nodes: [
                {
                  createdAt: '2023-03-31T09:58:16Z',
                  name: 'gen2 2.0.0',
                  tagName: 'gen2/2.0.0',
                  url: 'https://github.com/untile/workspaces/releases/tag/gen2/2.0.0'
                },
                {
                  createdAt: '2023-03-31T09:47:29Z',
                  name: 'gen1 2.0.0',
                  tagName: 'gen1/2.0.0',
                  url: 'https://github.com/untile/workspaces/releases/tag/gen1/2.0.0'
                }
              ]
            }
          }
        }
      );

      fetchMockHelper(
        'pullRequestsBefore',
        {
          base: 'main',
          first: 100,
          labels: ['gen1'],
          owner: 'untile',
          repo: 'workspaces'
        },
        {
          repository: {
            pullRequests: {
              nodes: [
                {
                  author: {
                    login: 'luisdralves',
                    url: 'https://github.com/luisdralves'
                  },
                  mergedAt: '2023-03-31T10:04:28Z',
                  number: 10,
                  title: 'Add eevee',
                  url: 'https://github.com/untile/workspaces/pull/10'
                },
                {
                  author: {
                    login: 'luisdralves',
                    url: 'https://github.com/luisdralves'
                  },
                  mergedAt: '2023-03-31T10:01:26Z',
                  number: 8,
                  title: 'Add pikachu',
                  url: 'https://github.com/untile/workspaces/pull/8'
                },
                {
                  author: {
                    login: 'luisdralves',
                    url: 'https://github.com/luisdralves'
                  },
                  mergedAt: '2023-03-31T09:37:35Z',
                  number: 7,
                  title: 'Add starters',
                  url: 'https://github.com/untile/workspaces/pull/7'
                }
              ],
              pageInfo: {
                endCursor:
                  'Y3Vyc29yOnYyOpK5MjAyMy0wMy0zMVQxMDozNzozNyswMTowMM5NVcU8',
                hasNextPage: false
              }
            }
          }
        }
      );

      fetchMockHelper(
        'pullRequestsBefore',
        {
          base: 'main',
          first: 100,
          labels: ['gen2'],
          owner: 'untile',
          repo: 'workspaces'
        },
        {
          repository: {
            pullRequests: {
              nodes: [
                {
                  author: {
                    login: 'luisdralves',
                    url: 'https://github.com/luisdralves'
                  },
                  mergedAt: '2023-03-31T10:03:06Z',
                  number: 9,
                  title: 'Add sentret',
                  url: 'https://github.com/untile/workspaces/pull/9'
                },
                {
                  author: {
                    login: 'luisdralves',
                    url: 'https://github.com/luisdralves'
                  },
                  mergedAt: '2023-03-31T09:37:35Z',
                  number: 7,
                  title: 'Add starters',
                  url: 'https://github.com/untile/workspaces/pull/7'
                }
              ],
              pageInfo: {
                endCursor:
                  'Y3Vyc29yOnYyOpK5MjAyMy0wMy0zMVQxMDozNzozNyswMTowMM5NVcU8',
                hasNextPage: false
              }
            }
          }
        }
      );

      fetchMockHelper(
        'latestRelease',
        {
          owner: 'untile',
          repo: 'workspaces'
        },
        {
          repository: {
            latestRelease: {
              nodes: [
                {
                  createdAt: '2023-03-31T09:58:16Z',
                  name: 'gen2 2.0.0',
                  tagCommit: {
                    committedDate: '2023-03-31T09:58:16Z'
                  },
                  tagName: 'gen2/2.0.0',
                  url: 'https://github.com/untile/workspaces/releases/tag/gen2/2.0.0'
                }
              ]
            }
          }
        }
      );
    });

    it('regenerates the full changelog for a package', async () => {
      expect(
        await changelogGenerator({
          ...commonWorkspacesOptions,
          packageName: 'gen1'
        })
      ).toMatchSnapshot();

      expect(
        await changelogGenerator({
          ...commonWorkspacesOptions,
          packageName: 'gen2'
        })
      ).toMatchSnapshot();
    });

    it('generates the latest changelog for a future package release', async () => {
      expect(
        await changelogGenerator({
          ...commonWorkspacesOptions,
          futureRelease: '3.0.0',
          latest: true,
          packageName: 'gen1'
        })
      ).toMatchSnapshot();

      expect(
        await changelogGenerator({
          ...commonWorkspacesOptions,
          futureRelease: '3.0.0',
          latest: true,
          packageName: 'gen2'
        })
      ).toMatchSnapshot();
    });

    it('generates the full changelog for a future package release', async () => {
      expect(
        await changelogGenerator({
          ...commonWorkspacesOptions,
          futureRelease: '3.0.0',
          packageName: 'gen1'
        })
      ).toMatchSnapshot();

      expect(
        await changelogGenerator({
          ...commonWorkspacesOptions,
          futureRelease: '3.0.0',
          packageName: 'gen2'
        })
      ).toMatchSnapshot();
    });

    it('fails when requesting a future release that already exists', async () => {
      try {
        await changelogGenerator({
          ...commonWorkspacesOptions,
          futureRelease: '2.0.0',
          latest: true,
          packageName: 'gen1'
        });
      } catch (error) {
        expect(error).toMatchObject({
          message: 'Changelog already on the latest release'
        });
      }

      try {
        await changelogGenerator({
          ...commonWorkspacesOptions,
          futureRelease: '2.0.0',
          packageName: 'gen1'
        });
      } catch (error) {
        expect(error).toMatchObject({
          message: 'Changelog already on the latest release'
        });
      }
    });
  });
});
