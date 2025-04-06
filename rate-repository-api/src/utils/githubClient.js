// Exercises10.17-10.27/rate-repository-api/src/utils/githubClient.js
/* global fetch */
import LRUCache from 'lru-cache';
import { ApolloError } from 'apollo-server';
import { pick, get } from 'lodash';
import axios from 'axios';

import {
  GITHUB_API_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} from '../config';

const oneHour = 1000 * 60 * 60;
const HTTP_CLIENT_ERROR = Symbol();

const isNotFoundError = (error) =>
  get(error[HTTP_CLIENT_ERROR], 'response.status') === 404;

export class GithubError extends ApolloError {
  constructor(message, properties) {
    super(message, 'GITHUB_API_FAILURE', properties);
  }

  static fromHttpClientError(error) {
    const githubError = new GithubError('GitHub API request failed', {
      response: error.response
        ? pick(error.response, ['status', 'statusText', 'headers', 'data'])
        : null,
    });

    githubError[HTTP_CLIENT_ERROR] = error;
    return githubError;
  }
}

export class GithubRepositoryNotFoundError extends ApolloError {
  constructor(message, properties) {
    super(message, 'GITHUB_REPOSITORY_NOT_FOUND', properties);
  }

  static fromNames(ownerName, repositoryName) {
    return new GithubRepositoryNotFoundError(
      `GitHub repository ${repositoryName} owned by ${ownerName} does not exist`,
      { ownerName, repositoryName },
    );
  }
}

export class GithubClient {
  constructor({
    baseUrl = GITHUB_API_URL,
    clientId = GITHUB_CLIENT_ID,
    clientSecret = GITHUB_CLIENT_SECRET,
    cacheMaxAge = oneHour,
  } = {}) {
    this.httpClient = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
    });
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.cache = new LRUCache({ max: 100, maxAge: cacheMaxAge });

    // Test connectivity on initialization
    this.testConnectivity();
  }

  async testConnectivity() {
    try {
      const response = await this.httpClient.get('/');
      console.log('✅ Successfully connected to GitHub API:', response.status);
    } catch (error) {
      console.error('❌ Failed to connect to GitHub API on initialization:');
      console.error('🔸 Message:', error.message);
      console.error('🔸 Code:', error.code);
      console.error('🔸 Stack:', error.stack);
    }
  }

  getAuth() {
    return this.clientId && this.clientSecret
      ? {
          username: this.clientId,
          password: this.clientSecret,
        }
      : undefined;
  }

  async getRequest(url, options = {}) {
    try {
      const headers = {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'rate-repository-api/1.0.0',
        ...options.headers,
      };

      const githubToken = process.env.GITHUB_TOKEN;
      if (githubToken) {
        headers.Authorization = `Bearer ${githubToken}`;
      }

      const response = await this.httpClient.get(url, {
        ...options,
        headers,
        auth: githubToken ? undefined : this.getAuth(),
      });

      return response;
    } catch (error) {
      // Log the raw error object to inspect its structure
      console.error('❌ Raw Axios Error:');
      console.error('🔸 Message:', error.message);
      console.error('🔸 Code:', error.code);
      console.error('🔸 Stack:', error.stack);
      console.error('🔸 Error Object:', JSON.stringify(error, null, 2));

      // Handle network errors specifically
      if (!error.response) {
        console.error('❌ Network Error in GitHub API request:');
        console.error('🔸 Message:', error.message);
        console.error('🔸 Code:', error.code);
        console.error('🔸 Stack:', error.stack);
        if (error.code === 'ECONNREFUSED') {
          throw new ApolloError(
            'Connection refused to GitHub API. Check network connectivity.',
            'NETWORK_ERROR',
          );
        } else if (error.code === 'ETIMEDOUT') {
          throw new ApolloError(
            'Request to GitHub API timed out. Check network connectivity or increase timeout.',
            'NETWORK_ERROR',
          );
        } else if (error.code === 'ENOTFOUND') {
          throw new ApolloError(
            'Could not resolve GitHub API domain. Check DNS settings.',
            'NETWORK_ERROR',
          );
        } else {
          throw new ApolloError(
            `Network error: ${error.message}`,
            'NETWORK_ERROR',
          );
        }
      }

      const hasResponse = error && error.response;
      const status = hasResponse && error.response.status;
      const responseData = hasResponse && error.response.data;

      console.error('❌ GitHub API request failed:');
      console.error('🔸 Status:', status);
      console.error('🔸 Message:', error.message);
      console.error('🔸 Stack:', error.stack);
      if (responseData) {
        console.error(
          '🔸 Response Data:',
          JSON.stringify(responseData, null, 2),
        );
      } else {
        console.error('🔸 No response data available');
      }

      throw GithubError.fromHttpClientError(error);
    }
  }

  async getRequestWithCache(cacheKey, url, options) {
    const cachedPromise = this.cache.get(cacheKey);
    if (cachedPromise) {
      const { data } = await cachedPromise;
      return data;
    }

    const promise = this.getRequest(url, options);
    this.cache.set(cacheKey, promise);

    try {
      const { data } = await promise;
      return data;
    } catch (e) {
      this.cache.del(cacheKey);
      throw e;
    }
  }

  async getRepository(ownerName, repository) {
    try {
      const data = await this.getRequestWithCache(
        `repository.${ownerName}.${repository}`,
        `/repos/${ownerName}/${repository}`,
      );
      return data;
    } catch (error) {
      if (isNotFoundError(error)) return null;
      throw error;
    }
  }

  async searchRepositories(query, first, after) {
    try {
      const page = after ? parseInt(after, 10) + 1 : 1;
      const response = await this.getRequestWithCache(
        `search.repositories.${query}.${page}`,
        '/search/repositories',
        {
          params: {
            q: query,
            per_page: first,
            page,
          },
        },
      );

      const data = response.data;

      return {
        total_count: data.total_count,
        items: data.items,
        next_page: data.items.length === first ? page : null,
      };
    } catch (error) {
      throw GithubError.fromHttpClientError(error);
    }
  }

  // Add a method to test with fetch as a fallback
  async searchRepositoriesWithFetch(query, first, after) {
    try {
      const page = after ? parseInt(after, 10) + 1 : 1;
      const url = `${GITHUB_API_URL}/search/repositories?q=${encodeURIComponent(
        query,
      )}&per_page=${first}&page=${page}`;
      const headers = {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'rate-repository-api/1.0.0',
      };

      const githubToken = process.env.GITHUB_TOKEN;
      if (githubToken) {
        headers['Authorization'] = `Bearer ${githubToken}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `GitHub API request failed with status ${
            response.status
          }: ${JSON.stringify(errorData)}`,
        );
      }

      const data = await response.json();

      return {
        total_count: data.total_count,
        items: data.items,
        next_page: data.items.length === first ? page : null,
      };
    } catch (error) {
      console.error('❌ Fetch Error in searchRepositoriesWithFetch:');
      console.error('🔸 Message:', error.message);
      console.error('🔸 Stack:', error.stack);
      throw new ApolloError(
        `GitHub API request failed: ${error.message}`,
        'GITHUB_API_FAILURE',
      );
    }
  }
}

export const githubClient = new GithubClient();
export default githubClient;
