/**
 * Module dependencies.
 */

import type { Release } from 'src/types';
import { describe, expect, it } from 'vitest';
import { formatChangelog } from './formatter';

/**
 * Formatter tests.
 */

describe('formatChangelog', () => {
  it('should format changelog correctly', () => {
    const releases: Release[] = [
      {
        createdAt: '2023-01-01T00:00:00.000Z',
        name: 'Release v1.0.0',
        pullRequests: [
          {
            author: {
              login: 'user1',
              url: 'https://example.com/user1'
            },
            number: 1,
            title: 'Add new feature',
            url: 'https://example.com/pull/1'
          }
        ],
        tagName: 'v1.0.0',
        url: 'https://example.com/release/v1.0.0'
      }
    ];

    const changelog = formatChangelog(releases);
    const expectedChangelog = `# Changelog

## [Release v1.0.0](https://example.com/release/v1.0.0) (2023-01-01)
- Add new feature [\\#1](https://example.com/pull/1) ([user1](https://example.com/user1))
`;

    expect(changelog).toBe(expectedChangelog);
  });

  it('should handle releases with no name', () => {
    const releases: Release[] = [
      {
        createdAt: '2023-01-01T00:00:00.000Z',
        name: 'v1.0.0',
        pullRequests: [],
        tagName: 'v1.0.0',
        url: 'https://example.com/release/v1.0.0'
      }
    ];

    const expectedChangelog = `# Changelog

## [v1.0.0](https://example.com/release/v1.0.0) (2023-01-01)
`;

    expect(formatChangelog(releases)).toEqual(expectedChangelog);
  });

  it('should handle releases with no pull requests', () => {
    const releases: Release[] = [
      {
        createdAt: '2023-01-01T00:00:00.000Z',
        name: 'Release v1.0.0',
        pullRequests: [],
        tagName: 'v1.0.0',
        url: 'https://example.com/release/v1.0.0'
      }
    ];

    const expectedChangelog = `# Changelog

## [Release v1.0.0](https://example.com/release/v1.0.0) (2023-01-01)
`;

    expect(formatChangelog(releases)).toEqual(expectedChangelog);
  });

  it('should handle multiple releases', () => {
    const releases: Release[] = [
      {
        createdAt: '2023-01-01T00:00:00.000Z',
        name: 'Release v1.0.0',
        pullRequests: [],
        tagName: 'v1.0.0',
        url: 'https://example.com/release/v1.0.0'
      },
      {
        createdAt: '2023-02-01T00:00:00.000Z',
        name: 'Release v1.1.0',
        pullRequests: [],
        tagName: 'v1.1.0',
        url: 'https://example.com/release/v1.1.0'
      }
    ];

    const expectedOutput = `# Changelog

## [Release v1.0.0](https://example.com/release/v1.0.0) (2023-01-01)

## [Release v1.1.0](https://example.com/release/v1.1.0) (2023-02-01)
`;

    expect(formatChangelog(releases)).toEqual(expectedOutput);
  });

  it('should handle multiple releases with pull requests', () => {
    const releases: Release[] = [
      {
        createdAt: '2023-03-01T00:00:00.000Z',
        name: 'Release v1.0.0',
        pullRequests: [
          {
            author: {
              login: 'user1',
              url: 'https://example.com/user1'
            },
            mergedAt: '2023-01-01T00:00:00.000Z',
            number: 1,
            title: 'Remove feature',
            url: 'https://example.com/pull/1'
          },
          {
            author: {
              login: 'user1',
              url: 'https://example.com/user1'
            },
            mergedAt: '2023-02-01T00:00:00.000Z',
            number: 2,
            title: 'Improve feature',
            url: 'https://example.com/pull/2'
          }
        ],
        tagName: 'v1.0.0',
        url: 'https://example.com/release/v1.0.0'
      },
      {
        createdAt: '2023-05-01T00:00:00.000Z',
        name: 'Release v1.0.1',
        pullRequests: [
          {
            author: {
              login: 'user1',
              url: 'https://example.com/user1'
            },
            mergedAt: '2023-04-01T00:00:00.000Z',
            number: 3,
            title: 'Add new feature',
            url: 'https://example.com/pull/3'
          }
        ],
        tagName: 'v1.0.1',
        url: 'https://example.com/release/v1.0.1'
      },
      {
        createdAt: '2023-07-01T00:00:00.000Z',
        name: 'Release v1.0.2',
        pullRequests: [
          {
            author: {
              login: 'user1',
              url: 'https://example.com/user1'
            },
            mergedAt: '2023-05-01T00:00:00.000Z',
            number: 4,
            title: 'Add other feature',
            url: 'https://example.com/pull/4'
          }
        ],
        tagName: 'v1.0.2',
        url: 'https://example.com/release/v1.0.2'
      },
      {
        createdAt: '2023-09-01T00:00:00.000Z',
        name: 'Release v1.1.0',
        pullRequests: [
          {
            author: {
              login: 'user1',
              url: 'https://example.com/user1'
            },
            mergedAt: '2023-08-01T00:00:00.000Z',
            number: 5,
            title: 'Add another feature',
            url: 'https://example.com/pull/5'
          }
        ],
        tagName: 'v1.1.0',
        url: 'https://example.com/release/v1.1.0'
      }
    ];

    const expectedOutput = `# Changelog

## [Release v1.0.0](https://example.com/release/v1.0.0) (2023-03-01)
- Remove feature [\\#1](https://example.com/pull/1) ([user1](https://example.com/user1))
- Improve feature [\\#2](https://example.com/pull/2) ([user1](https://example.com/user1))

## [Release v1.0.1](https://example.com/release/v1.0.1) (2023-05-01)
- Add new feature [\\#3](https://example.com/pull/3) ([user1](https://example.com/user1))

## [Release v1.0.2](https://example.com/release/v1.0.2) (2023-07-01)
- Add other feature [\\#4](https://example.com/pull/4) ([user1](https://example.com/user1))

## [Release v1.1.0](https://example.com/release/v1.1.0) (2023-09-01)
- Add another feature [\\#5](https://example.com/pull/5) ([user1](https://example.com/user1))
`;

    expect(formatChangelog(releases)).toEqual(expectedOutput);
  });

  it('should handle multiple releases with pull requests without release name', () => {
    const releases: Release[] = [
      {
        createdAt: '2023-03-01T00:00:00.000Z',
        name: '',
        pullRequests: [
          {
            author: {
              login: 'user1',
              url: 'https://example.com/user1'
            },
            mergedAt: '2023-01-01T00:00:00.000Z',
            number: 1,
            title: 'Remove feature',
            url: 'https://example.com/pull/1'
          },
          {
            author: {
              login: 'user1',
              url: 'https://example.com/user1'
            },
            mergedAt: '2023-02-01T00:00:00.000Z',
            number: 2,
            title: 'Improve feature',
            url: 'https://example.com/pull/2'
          }
        ],
        tagName: 'v1.0.0',
        url: 'https://example.com/release/v1.0.0'
      },
      {
        createdAt: '2023-05-01T00:00:00.000Z',
        name: '',
        pullRequests: [
          {
            author: {
              login: 'user1',
              url: 'https://example.com/user1'
            },
            mergedAt: '2023-04-01T00:00:00.000Z',
            number: 3,
            title: 'Add new feature',
            url: 'https://example.com/pull/3'
          }
        ],
        tagName: 'v1.0.1',
        url: 'https://example.com/release/v1.0.1'
      },
      {
        createdAt: '2023-07-01T00:00:00.000Z',
        name: '',
        pullRequests: [
          {
            author: {
              login: 'user1',
              url: 'https://example.com/user1'
            },
            mergedAt: '2023-05-01T00:00:00.000Z',
            number: 4,
            title: 'Add other feature',
            url: 'https://example.com/pull/4'
          }
        ],
        tagName: 'v1.0.2',
        url: 'https://example.com/release/v1.0.2'
      },
      {
        createdAt: '2023-09-01T00:00:00.000Z',
        name: '',
        pullRequests: [
          {
            author: {
              login: 'user1',
              url: 'https://example.com/user1'
            },
            mergedAt: '2023-08-01T00:00:00.000Z',
            number: 5,
            title: 'Add another feature',
            url: 'https://example.com/pull/5'
          }
        ],
        tagName: 'v1.1.0',
        url: 'https://example.com/release/v1.1.0'
      }
    ];

    const expectedOutput = `# Changelog

## [v1.0.0](https://example.com/release/v1.0.0) (2023-03-01)
- Remove feature [\\#1](https://example.com/pull/1) ([user1](https://example.com/user1))
- Improve feature [\\#2](https://example.com/pull/2) ([user1](https://example.com/user1))

## [v1.0.1](https://example.com/release/v1.0.1) (2023-05-01)
- Add new feature [\\#3](https://example.com/pull/3) ([user1](https://example.com/user1))

## [v1.0.2](https://example.com/release/v1.0.2) (2023-07-01)
- Add other feature [\\#4](https://example.com/pull/4) ([user1](https://example.com/user1))

## [v1.1.0](https://example.com/release/v1.1.0) (2023-09-01)
- Add another feature [\\#5](https://example.com/pull/5) ([user1](https://example.com/user1))
`;

    expect(formatChangelog(releases)).toEqual(expectedOutput);
  });
});
