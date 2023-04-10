# github-changelog-generator

Generate changelog files from the project's GitHub PRs

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
        --latest              Build only the latest changelog            [boolean]
    -o, --owner               Owner of the repository                     [string]
    -r, --repo                Name of the repository                      [string]
    -d, --output              Path of the changelog file. If omitted, it will be
                              automatically inferred.                     [string]
        --stdout              Outputs to stdout instead of a file.       [boolean]
    -h, --help                Show help                                  [boolean]

  Generate changelog files from the project's GitHub PRs
```

To generate a changelog for your GitHub project, use the following command:

```sh
$ yarn github-changelog-generator
```

This will generate the changelog with all the releases and output it to `CHANGELOG.md`.

### `--base-branch`
This option allows you to filter PRs for a given branch. If not specified, it defaults to the "master" branch.

```sh
$ yarn github-changelog-generator --base-branch development
```

### `--future-release`
This allows you to specify a new release and generate its changelog. This changelog includes all pull requests (PRs) that have been merged since the last release.

```sh
$ yarn github-changelog-generator --future-release 1.0.0
```

### `--latest`
You can generate only the changelog for the latest release, ommiting past releases. This is not recommended as it can lead to bugs.

```sh
$ yarn github-changelog-generator --future-release 1.0.0 --latest
```

### `--package-name`
If you are working with workspaces, you can keep a separate changelog for each package. Use the `--package-name` option to specify a package, and only its releases and pull requests will be considered.

```sh
$ yarn github-changelog-generator --future-release 1.0.0 --package-name project-x
```

In monorepos, it is necessary to add labels to PRs because it is the way to identify the changes and generate separate changelogs for each package. For example, using the labeler https://github.com/actions/labeler

### `--output`, `--stdout`
You can specify a path to a changelog file using the `--output` option. If the file already exists, it will be overwritten. If used with `--latest`, the new changelog will be appended to the top.

```sh
$ yarn github-changelog-generator --future-release 1.0.0 --output CHANGELOG.md
```

If both the `--stdout` and `--output` options are omited, it will automatically write to a `CHANGELOG.md` file in the project root. If used with `--package-name`, it will instead output to that package's root. The same appending/overwitting logic as `--output` applies.

### `--owner`, `--repo`
If you are not inside your project's folder structure, you will need to manually specify the owner and name of the repository:

```sh
$ yarn github-changelog-generator --owner untile --repo github-changelog-generator
```

### `--labels`
This option allows you to filter pull requests based on their labels, which can be useful in certain situations.

```sh
$ yarn github-changelog-generator --future-release 1.0.0 --labels bugfix,support
```

## Release

Be sure to have configured `GITHUB_TOKEN` in your globals.

```sh
yarn build
npm version [<new version> | major | minor | patch] -m "Release %s"
git push origin master && git push --tags
```
