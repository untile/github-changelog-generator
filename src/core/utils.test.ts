/**
 * Module dependencies.
 */

import type { Release } from 'src/types';
import { describe, expect, it, vi } from 'vitest';
import { getGitRepo, getPreviousReleaseDate, toISOStringNoMs } from './utils';

/**
 * Utils tests.
 */

describe('Utils', () => {
  describe('getGitRepo', () => {
    vi.mock('execa', () => ({
      default: {
        sync: () => ({ stdout: '.' })
      }
    }));

    it('should infer git owner and repo', () => {
      const gitRepo = getGitRepo();

      expect(gitRepo).toStrictEqual({
        owner: 'untile',
        repo: 'github-changelog-generator'
      });
    });
  });

  describe('getPreviousReleaseDate', () => {
    const repositoryCreatedAt = '2022-12-25T00:00:00Z';
    const releases: Release[] = [
      {
        createdAt: '2023-02-01T00:00:00Z',
        name: 'Release 2',
        tagName: 'v2.0.0',
        url: 'https://example.com/release2'
      },
      {
        createdAt: '2023-01-01T00:00:00Z',
        name: 'Release 1',
        tagName: 'v1.0.0',
        url: 'https://example.com/release1'
      }
    ];

    it('should return the previous release date', () => {
      const expectedPreviousReleaseDate = new Date(releases[1].createdAt);
      const previousReleaseDate = getPreviousReleaseDate(
        releases,
        0,
        repositoryCreatedAt
      );

      expect(previousReleaseDate).toEqual(expectedPreviousReleaseDate);
    });

    it('should return the repository creation date when there is no previous release', () => {
      const expectedPreviousReleaseDate = new Date(repositoryCreatedAt);
      const previousReleaseDate = getPreviousReleaseDate(
        releases,
        1,
        repositoryCreatedAt
      );

      expect(previousReleaseDate).toEqual(expectedPreviousReleaseDate);
    });
  });

  describe('toISOStringNoMs', () => {
    it('should return an ISO string without milliseconds', () => {
      const date = new Date('2023-01-01T00:00:00.123Z');
      const isoString = toISOStringNoMs(date);
      const expectedISOString = '2023-01-01T00:00:00Z';

      expect(isoString).toBe(expectedISOString);
    });

    it('should handle dates with zero milliseconds', () => {
      const date = new Date('2023-01-01T00:00:00.000Z');
      const isoString = toISOStringNoMs(date);
      const expectedISOString = '2023-01-01T00:00:00Z';

      expect(isoString).toBe(expectedISOString);
    });
  });
});
