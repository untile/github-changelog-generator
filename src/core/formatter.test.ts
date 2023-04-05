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
});
