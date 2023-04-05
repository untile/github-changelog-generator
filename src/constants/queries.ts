/**
 * Export `getReleasesQuery`.
 */

export const getReleasesQuery = `
  query getReleases($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      releases(first: 100, orderBy: { field: CREATED_AT, direction: DESC }) {
        nodes {
          createdAt
          name
          tagName
          url
        }
      }
    }
  }
`;

/**
 * Export `latestReleaseQuery`.
 */

export const latestReleaseQuery = `
  query latestRelease($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      latestRelease: releases(first: 1, orderBy: { field: CREATED_AT, direction: DESC }) {
        nodes {
          createdAt
          name
          tagName
          tagCommit: tagCommit {
            committedDate
          }
          url
        }
      }
    }
  }
`;

/**
 * Export `pullRequestsBeforeQuery`.
 */

export const pullRequestsBeforeQuery = `
  query pullRequestsBefore($owner: String!, $repo: String!, $first: Int!, $base: String!, $cursor: String, $labels: [String!]) {
    repository(owner: $owner, name: $repo) {
      pullRequests(baseRefName: $base, first: $first, after: $cursor, orderBy: { field: UPDATED_AT, direction: DESC }, states: [MERGED], labels: $labels) {
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          author{
            login
            url
          }
          mergedAt
          number
          title
          url
        }
      }
    }
  }
`;

/**
 * Export `repositoryCreatedAtQuery`.
 */

export const repositoryCreatedAtQuery = `
  query repositoryCreatedAt($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      createdAt
    }
  }
`;
