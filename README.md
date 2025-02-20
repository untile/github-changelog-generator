<p align="center">
  <br><img width="250" src="https://untile.pt/logo.png" /><br>
</p>

<h1 align="center">
  @untile/github-changelog-generator
</h1>

<h4 align="center">
  Generate changelog files from the project's GitHub PRs.
</h4>

<p align="center">
  <a href="https://www.npmjs.com/package/@untile/github-changelog-generator">
    <img src="https://img.shields.io/npm/v/@untile/github-changelog-generator.svg?style=for-the-badge" alt="NPM version" />
  </a>
  <a href="https://github.com/untile/github-changelog-generator/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge" alt="Untile github changelog generator is released under the MIT license." />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=untiledigital">
    <img src="https://img.shields.io/twitter/follow/untiledigital.svg?label=Follow%20@untiledigital&style=for-the-badge" alt="Follow @untiledigital" />
  </a>
</p>

## Usage

Generate a new [GitHub Personal Access Token](https://github.com/settings/tokens) and save it to your `.zshrc.local`, `.bashrc.local` or similar:

```sh
export GITHUB_TOKEN=<your_github_personal_access_token>
```

To see a list of available options, run the following command:

```
$ yarn github-changelog-generator --help

  Options:
        --version             Show version number                        [boolean]
    -b, --base-branch         Specify the base branch name
                                                      [string] [default: "master"]
    -f, --future-release      Specify the next release version            [string]
    -t, --future-release-tag  Specify the next release tag name if it is different
                              from the release version                    [string]
    -p, --package-name        If monorepo, the name of the package for which to
                              generate the changelog                      [string]
    -l, --labels              Comma-separated labels to filter pull requests by
                                                                           [array]
    -o, --owner               Owner of the repository                     [string]
    -r, --repo                Name of the repository                      [string]
        --rebuild             Rebuild the full changelog                 [boolean]
    -d, --output              Path of the changelog file. If omitted, it will be
                              automatically inferred.                     [string]
        --stdout              Outputs to stdout instead of a file.       [boolean]
    -h, --help                Show help                                  [boolean]

  Generate changelog files from the project's GitHub PRs
```

### `--rebuild`
To generate a changelog for your GitHub project, use the following command:

```sh
$ yarn github-changelog-generator --rebuild
```

This will generate the changelog with all the releases and output it to `CHANGELOG.md`.

### `--base-branch`
This option allows you to filter PRs for a given branch. If not specified, it defaults to the "master" branch.

```sh
$ yarn github-changelog-generator --base-branch development
```

### `--future-release`
This allows you to specify a new release and generate its changelog. This changelog includes all pull requests (PRs) that have been merged since the last release. To also include changelogs for past releases, use the `--rebuild` option with `--future-release`. At least one of these two options is required; otherwise, the output will be empty.

```sh
$ yarn github-changelog-generator --future-release 1.0.0
```

### `--package-name`
If you are working with workspaces, you can keep a separate changelog for each package. Use the `--package-name` option to specify a package, and only its releases and pull requests will be considered.

```sh
$ yarn github-changelog-generator --future-release 1.0.0 --package-name project-x
```

> #### ⚠️ In monorepos, it is necessary to add labels to PRs because it is the way to identify the changes and generate separate changelogs for each package. For example, using the labeler https://github.com/actions/labeler.

> #### 🔥 In order to parse tags correctly, the tag convention must be `<package-name>/<version>`

### `--output`, `--stdout`
You can specify a path to a changelog file using the `--output` option. If the file already exists, the new changelog will be appended to the top. If used with `--rebuild`, the file will be overwritten.

```sh
$ yarn github-changelog-generator --future-release 1.0.0 --output CHANGELOG.md
```

If both the `--stdout` and `--output` options are omitted, it will automatically write to a `CHANGELOG.md` file in the project root. If used with `--package-name`, it will instead output to that package's root. The same appending/overwriting logic as `--output` applies.

### `--owner`, `--repo`
If you are not inside your project's folder structure, you will need to manually specify the owner and name of the repository:

```sh
$ yarn github-changelog-generator --rebuild --owner untile --repo github-changelog-generator
```

### `--labels`
This option allows you to filter pull requests based on their labels, which can be useful in certain situations.

```sh
$ yarn github-changelog-generator --future-release 1.0.0 --labels bugfix,support
```

## Release

Be sure to have configured `GITHUB_TOKEN` in your globals.

```sh
yarn release [<new version> | major | minor | patch]
git push origin master && git push --tags
```
