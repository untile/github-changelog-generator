/**
 * Module dependencies.
 */

import { Release } from 'src/types';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import ini from 'ini';
import path from 'path';

/**
 * Export `getRootPath` util.
 */

export function getRootPath() {
  return path.resolve(
    execSync('git rev-parse --show-toplevel').toString().trim()
  );
}

/**
 * Export `getPackagePath` util.
 */

export function getPackagePath(packageName: string) {
  const rootPath = getRootPath();
  let packagePath: string | undefined;

  try {
    const output = execSync('yarn workspaces list --json').toString().trim();
    const lines = output.split('\n');

    for (const line of lines) {
      const entry = JSON.parse(line);

      if (entry.name === packageName) {
        packagePath = entry.location;
        break;
      }
    }
  } catch (e) {
    const output = execSync('yarn workspaces info --json').toString().trim();
    const workspacesInfo = JSON.parse(output);
    packagePath = workspacesInfo[packageName].location;
  }

  if (!packagePath) {
    throw new Error(`Package ${packageName} not found in workspaces`);
  }

  return path.join(rootPath, packagePath);
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
