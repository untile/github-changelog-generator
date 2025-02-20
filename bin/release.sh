#!/usr/bin/env sh

release() {
  # Install dependencies.
  yarn

  # Bump version.
  yarn version ${1:-patch}

  # Get the new version number.
  local version=`grep -m1 "\"version\"" package.json | awk -F: '{ print $2 }' | sed 's/[", ]//g'`

  # Generate changelog.
  node bin/cli.js --future-release ${version}

  # Add modified files.
  git add .

  # Commit release with new version.
  git commit -m "Release ${version}"

  # Create tag.
  git tag v${version}
}

release $1
