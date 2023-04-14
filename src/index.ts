/* eslint-disable no-console */

/**
 * Module dependencies.
 */

export * from './types';
import { changelogGenerator } from 'src/lib/changelog-generator';
import { defineCommands } from 'src/constants/commands';
import yargs from 'yargs';
import path from 'path';
import { getPackagePath, getRootPath } from './core/utils';
import { existsSync, readFileSync, writeFileSync } from 'fs';

/**
 * `KebabCaseOptions` interface.
 */

interface CamelCaseOptions {
  baseBranch?: string;
  futureRelease?: string;
  futureReleaseTag?: string;
  labels?: string[];
  latest?: boolean;
  output?: string;
  owner?: string;
  packageName?: string;
  repo?: string;
  stdout?: boolean;
}

/**
 * `Args` type.
 */

type Args = CamelCaseOptions & yargs.Arguments;

/**
 * Write the changelog file.
 */

function writeChangelog(changelog: string, args: Args) {
  let output = args.output;

  if (!output) {
    output = path.join(
      args.packageName ? getPackagePath(args.packageName) : getRootPath(),
      'CHANGELOG.md'
    );
  }

  if (!args.latest) {
    writeFileSync(output, changelog, { encoding: 'utf-8' });

    return;
  }

  const oldChangelog = existsSync(output)
    ? readFileSync(output, { encoding: 'utf-8' }).replace('# Changelog\n', '')
    : '';

  writeFileSync(output, changelog + oldChangelog, { encoding: 'utf-8' });
}

/**
 * Run.
 */

async function run() {
  const argv = yargs(process.argv.slice(2));
  const configuredYargs = defineCommands(argv);
  const args = configuredYargs.argv as Args;
  const changelog = await changelogGenerator(args);

  if (args.stdout) {
    console.log(changelog);

    return;
  }

  try {
    writeChangelog(changelog, args);
  } catch {
    console.warn(`
      ⚠️ Warning
      Unable to infer path to CHANGELOG.md.
      "${path.resolve('.')}" does not seem to be inside an instance of "${args.owner}/${args.repo}"
      Will output to stdout instead.
    `);

    console.log(changelog);
  }
}

run();
