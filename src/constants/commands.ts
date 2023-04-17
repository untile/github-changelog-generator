/**
 * Module dependencies.
 */

import { Argv } from 'yargs';

/**
 * Export `defineCommands`.
 */

export function defineCommands(yargs: Argv): Argv {
  return yargs
    .epilog('Generate changelog files from the project\'s GitHub PRs')
    .option('base-branch', {
      alias: 'b',
      default: 'master',
      describe: 'Specify the base branch name',
      type: 'string'
    })
    .option('future-release', {
      alias: 'f',
      describe: 'Specify the next release version',
      type: 'string'
    })
    .option('future-release-tag', {
      alias: 't',
      describe:
        'Specify the next release tag name if it is different from the release version',
      type: 'string'
    })
    .option('package-name', {
      alias: 'p',
      describe:
        'If monorepo, the name of the package for which to generate the changelog',
      type: 'string'
    })
    .option('labels', {
      alias: 'l',
      describe: 'Comma-separated labels to filter pull requests by',
      type: 'array'
    })
    .option('owner', {
      alias: 'o',
      describe: 'Owner of the repository',
      type: 'string'
    })
    .option('repo', {
      alias: 'r',
      describe: 'Name of the repository',
      type: 'string'
    })
    .option('rebuild', {
      describe: 'Rebuild the full changelog',
      type: 'boolean'
    })
    .option('output', {
      alias: 'd',
      describe:
        'Path of the changelog file. If omitted, it will be automatically inferred.',
      type: 'string'
    })
    .option('stdout', {
      describe: 'Outputs to stdout instead of a file.',
      type: 'boolean'
    })
    .help()
    .alias('help', 'h');
}
