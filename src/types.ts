/**
 * Export `ChangelogOptions` interface.
 */

export interface ChangelogOptions {
  baseBranch: string;
  futureRelease?: string;
  futureReleaseTag?: string;
  labels?: string[];
  owner: string;
  packageName?: string;
  rebuild?: boolean;
  repo: string;
  token?: string;
}

/**
 * Export `PullRequest` interface.
 */

export interface PullRequest {
  author: {
    login: string;
    url: string;
  };
  mergedAt?: string;
  number: number;
  title: string;
  url: string;
}

/**
 * Export `Release` interface.
 */

export interface Release {
  createdAt: string;
  name: string;
  tagName: string;
  url: string;
  pullRequests?: PullRequest[];
  tagCommit?: {
    committedDate: string;
  };
}

/**
 * Export `RepositoryCreatedAtQueryResponse` type
 */

export type RepositoryCreatedAtQueryResponse = {
  repository: {
    createdAt: string;
  };
};

/**
 * Export `ReleasesQueryResponse` type
 */

export type ReleasesQueryResponse = {
  repository: {
    releases: {
      nodes: Release[];
    };
  };
};

/**
 * Export `LatestReleaseQueryResponse` type
 */

export type LatestReleaseQueryResponse = {
  repository: {
    latestRelease: {
      nodes: [Release];
    };
  };
};

/**
 * Export `PullRequestsQueryResponse` type
 */

export type PullRequestsQueryResponse = {
  repository: {
    pullRequests: {
      nodes: PullRequest[];
      pageInfo: {
        endCursor: string;
        hasNextPage?: boolean;
      };
    };
  };
};
