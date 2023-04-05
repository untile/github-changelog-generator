/**
 * Module dependencies.
 */

import {
  ChangelogOptions,
  LatestReleaseQueryResponse,
  PullRequest,
  PullRequestsQueryResponse,
  Release,
  ReleasesQueryResponse,
  RepositoryCreatedAtQueryResponse
} from 'src/types';

import { getPreviousReleaseDate, toISOStringNoMs } from './utils';
import {
  getReleasesQuery,
  latestReleaseQuery,
  pullRequestsBeforeQuery,
  repositoryCreatedAtQuery
} from '../constants/queries';

import { graphql } from '@octokit/graphql';

/**
 * Export `ChangelogFetcher` class.
 */

export class ChangelogFetcher {

  /**
   * Variables.
   */

  private base: string;
  private client: ReturnType<typeof graphql.defaults>;
  private futureRelease?: string;
  private futureReleaseName?: string;
  private futureReleaseTag?: string;
  private labels: string[];
  private owner: string;
  private packageName?: string;
  private repo: string;

  /**
   * Constructor.
   */

  constructor(options: ChangelogOptions) {
    this.base = options.baseBranch;
    this.futureRelease = options.futureRelease;
    this.labels = options.labels || [];
    this.owner = options.owner;
    this.packageName = options.packageName;
    this.repo = options.repo;
    this.client = graphql.defaults({
      headers: { authorization: `token ${options.token}` }
    });

    this.setDefaultValues();
  }

  /**
   * `setDefaultValues` method.
   */

  private setDefaultValues(): void {
    this.futureReleaseName = this.packageName
      ? `${this.packageName} ${this.futureRelease}`
      : this.futureRelease;

    this.futureReleaseTag =
      this.futureReleaseTag ??
      (this.packageName
        ? `${this.packageName.toLowerCase()}-${this.futureRelease}`
        : this.futureRelease);

    this.labels = this.packageName
      ? [...this.labels, this.packageName]
      : this.labels;
  }

  /**
   * `getRepositoryCreatedAt` method.
   */

  async getRepositoryCreatedAt(): Promise<Release['createdAt']> {
    const result: RepositoryCreatedAtQueryResponse = await this.client(
      repositoryCreatedAtQuery,
      {
        owner: this.owner,
        repo: this.repo
      }
    );

    return result?.repository?.createdAt;
  }

  /**
   * `getReleases` method.
   */

  async getReleases(): Promise<Release[]> {
    const result: ReleasesQueryResponse = await this.client(getReleasesQuery, {
      owner: this.owner,
      repo: this.repo
    });

    const futureRelease = this.futureRelease &&
      this.futureReleaseName &&
      this.futureReleaseTag && {
      createdAt: new Date().toISOString(),
      name: this.futureReleaseName,
      pullRequests: [],
      tagName: this.futureReleaseTag,
      url: `https://github.com/${this.owner}/${this.repo}/releases/tag/${this.futureReleaseTag}`
    };

    if (
      futureRelease &&
      this.futureReleaseName === result?.repository?.releases?.nodes?.[0]?.name
    ) {
      throw new Error('Changelog already on the latest release');
    }

    return [
      ...futureRelease ? [futureRelease] : [],
      ...result?.repository?.releases?.nodes ?? []
    ].filter(
      ({ name }) =>
        !this.packageName ||
        name.toLowerCase().startsWith(this.packageName.toLowerCase())
    );
  }

  /**
   * `getLatestRelease` method.
   */

  async getLatestRelease(): Promise<Release | undefined> {
    const result: LatestReleaseQueryResponse = await this.client(
      latestReleaseQuery,
      {
        owner: this.owner,
        repo: this.repo
      }
    );

    const latestRelease = result.repository.latestRelease.nodes[0];

    return latestRelease;
  }

  /**
   * `fetchPullRequests` method.
   */

  async fetchPullRequests(
    cursor: string | null = null,
    startDate: Date = new Date(0),
    endDate: Date = new Date()
  ): Promise<PullRequest[]> {
    const result: PullRequestsQueryResponse = await this.client(
      pullRequestsBeforeQuery,
      {
        base: this.base,
        cursor: cursor ?? undefined,
        first: 100,
        labels: this.labels.length > 0 ? this.labels : undefined,
        owner: this.owner,
        repo: this.repo
      }
    );

    const pullRequests = result.repository.pullRequests.nodes.filter(pr => {
      if (!pr.mergedAt) {
        return false;
      }

      const mergedAt = new Date(pr.mergedAt);

      return mergedAt > startDate && mergedAt < endDate;
    });

    if (result.repository.pullRequests.pageInfo.hasNextPage) {
      return [
        ...pullRequests,
        ...await this.fetchPullRequests(
          result.repository.pullRequests.pageInfo.endCursor,
          startDate
        )
      ];
    }

    return pullRequests;
  }

  /**
   * `fetchFullChangelog` method.
   */

  async fetchFullChangelog(): Promise<Release[]> {
    const repositoryCreatedAt = await this.getRepositoryCreatedAt();
    const releases = await this.getReleases();
    const pullRequests = await this.fetchPullRequests(
      null,
      new Date(repositoryCreatedAt),
      new Date()
    );

    const updatedReleases = releases.map((release, index) => {
      const releaseDate = new Date(release.createdAt);
      const previousReleaseDate = getPreviousReleaseDate(
        releases,
        index,
        repositoryCreatedAt
      );

      const prsForRelease = pullRequests.filter(pr => {
        if (!pr.mergedAt) {
          return false;
        }

        const mergedAt = new Date(pr.mergedAt);

        return mergedAt > previousReleaseDate && mergedAt <= releaseDate;
      });

      return { ...release, pullRequests: prsForRelease };
    });

    return updatedReleases;
  }

  /**
   * `fetchLatestChangelog` method.
   */

  async fetchLatestChangelog(): Promise<Release[]> {
    if (!this.futureRelease) {
      return [];
    }

    const latestRelease = await this.getLatestRelease();

    if (latestRelease?.tagName === this.futureReleaseTag) {
      throw new Error('Changelog already on the latest release');
    }

    const pullRequests = await this.fetchPullRequests(
      null,
      latestRelease?.tagCommit
        ? new Date(latestRelease?.tagCommit?.committedDate)
        : new Date(0)
    );

    return [
      {
        createdAt: toISOStringNoMs(new Date()),
        name: this.futureReleaseName || 'Unreleased',
        pullRequests,
        tagName: this.futureReleaseTag || 'unreleased',
        url: `https://github.com/${this.owner}/${this.repo}/releases/tag/${this.futureReleaseTag}`
      }
    ];
  }

}
