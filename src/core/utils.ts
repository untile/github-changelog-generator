/**
 * Module dependencies.
 */

import { Release } from 'src/types';
import { readFileSync } from 'fs';
import execa from 'execa';
import ini from 'ini';
import path from 'path';

/**
 * Export `getRootPath` util.
 */

export function getRootPath() {
  return path.resolve(
    execa.sync('git', ['rev-parse', '--show-toplevel']).stdout.trim()
  );
}

/**
 * Export `getPackagePath` util.
 */

export function getPackagePath(packageName: string) {
  const workspacesInfo = JSON.parse(
    execa.sync('yarn', ['workspaces', 'info', '--json']).stdout.trim()
  );

  return path.join(getRootPath(), workspacesInfo[packageName].location);
}

/**
 * Export `getGitRepo` util.
 */

export function getGitRepo(owner?: string, repo?: string) {
  try {
    const dir = getRootPath();
    const gitconfig = readFileSync(path.join(dir, '.git/config'), 'utf-8');
    const remoteOrigin = ini.parse(gitconfig)['remote "origin"'];
    const match = remoteOrigin.url.match(
      /github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/
    );

    return {
      owner: owner ?? match[1],
      repo: repo ?? match[2]
    };
  } catch (e) {
    throw new Error(`
      Failed to infer repository owner and name.
      Please use options --owner and --repo to manually set them.
    `);
  }
}

/**
 * Export `getPreviousReleaseDate` util.
 */

export function getPreviousReleaseDate(
  releases: Release[],
  index: number,
  repositoryCreatedAt: string
): Date {
  return index < releases.length - 1
    ? new Date(releases[index + 1].createdAt)
    : new Date(repositoryCreatedAt);
}

/**
 * Export `toISOStringNoMs` util.
 */

export function toISOStringNoMs(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}
