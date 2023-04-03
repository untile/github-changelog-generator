/**
 * Module dependencies.
 */

import { ChangelogOptions } from 'src/types';
import { changelogGenerator } from './changelog-generator';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Common options for tests with workspaces.
 */

const commonWorkspacesOptions: Partial<ChangelogOptions> = {
  baseBranch: 'main',
  owner: 'untile',
  repo: 'test-github-changelog-generator'
};

/**
 * Common options for tests without workspaces.
 */

const commonNoWorkspacesOptions: Partial<ChangelogOptions> = {
  ...commonWorkspacesOptions,
  repo: 'test-github-changelog-generator-no-workspaces'
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
    it('regenerates the full changelog', async () => {
      expect(
        await changelogGenerator({
          ...commonNoWorkspacesOptions,
          rebuild: true
        })
      ).toMatchSnapshot();
    });

    it('generates the latest changelog for a future root release', async () => {
      expect(
        await changelogGenerator({
          ...commonNoWorkspacesOptions,
          futureRelease: '5.0.0'
        })
      ).toMatchSnapshot();
    });

    it('generates the full changelog for a future root release', async () => {
      expect(
        await changelogGenerator({
          ...commonNoWorkspacesOptions,
          futureRelease: '5.0.0',
          rebuild: true
        })
      ).toMatchSnapshot();
    });

    it('fails when requesting a future release that already exists', async () => {
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

      try {
        await changelogGenerator({
          ...commonNoWorkspacesOptions,
          futureRelease: '4.0.0',
          rebuild: true
        });
      } catch (error) {
        expect(error).toMatchObject({
          message: 'Changelog already on the latest release'
        });
      }
    });
  });

  describe('with workspaces', () => {
    it('regenerates the full changelog for a package', async () => {
      expect(
        await changelogGenerator({
          ...commonWorkspacesOptions,
          packageName: 'gen1',
          rebuild: true
        })
      ).toMatchSnapshot();

      expect(
        await changelogGenerator({
          ...commonWorkspacesOptions,
          packageName: 'gen2',
          rebuild: true
        })
      ).toMatchSnapshot();
    });

    it('generates the latest changelog for a future package release', async () => {
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

    it('generates the full changelog for a future package release', async () => {
      expect(
        await changelogGenerator({
          ...commonWorkspacesOptions,
          futureRelease: '3.0.0',
          packageName: 'gen1',
          rebuild: true
        })
      ).toMatchSnapshot();

      expect(
        await changelogGenerator({
          ...commonWorkspacesOptions,
          futureRelease: '3.0.0',
          packageName: 'gen2',
          rebuild: true
        })
      ).toMatchSnapshot();
    });

    it('fails when requesting a future release that already exists', async () => {
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

      try {
        await changelogGenerator({
          ...commonWorkspacesOptions,
          futureRelease: '2.0.0',
          packageName: 'gen1',
          rebuild: true
        });
      } catch (error) {
        expect(error).toMatchObject({
          message: 'Changelog already on the latest release'
        });
      }
    });
  });
});
