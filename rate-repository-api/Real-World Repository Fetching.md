## Enabling Real-World Repository Fetching

This section documents the changes and setup steps to enable fetching real-world repositories (e.g., `deepseek-ai/DeepSeek-V3`) in the `rate-repository-app` using the GitHub API.

### Overview

The `rate-repository-app` initially fetched repositories from the local `rate-repository-api` database, limiting searches to repositories that had been reviewed. To allow users to search for any public GitHub repository directly, we implemented the `SEARCH_REPOSITORIES` GraphQL query and integrated it into the `CreateReview` component. However, we encountered issues with the GitHub API requests failing due to `axios`-related errors. After extensive debugging, we switched to using `fetch`, which resolved the issue.

### Changes Made

#### 1. Added `SEARCH_REPOSITORIES` Query

- **File**: `rate-repository-app/src/graphql/queries.js`
- **Change**: Added the `SEARCH_REPOSITORIES` GraphQL query to fetch real-world repositories directly from GitHub.
  ```javascript
  const SEARCH_REPOSITORIES = gql`
    query searchRepositories($query: String!, $first: Int, $after: String) {
      searchRepositories(query: $query, first: $first, after: $after) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          cursor
          node {
            id
            fullName
            description
            language
            forksCount
            stargazersCount
            ownerAvatarUrl
            url
          }
        }
      }
    }
  `;
  ```

#### 2. Implemented `searchRepositories` Query in `rate-repository-api`

- **File**: `rate-repository-api/src/graphql/queries/searchRepositories.js`
- **Change**: Added the `SEARCH_REPOSITORIES` query resolver to call the GitHub API and return repository data.
- **Initial Issue**: The resolver initially used `axios` to make requests, but we encountered `GitHub API request failed` errors with `response: null`.
- **Solution**: Switched to a `fetch`-based implementation (`searchRepositoriesWithFetch`) in `githubClient.js`, which resolved the issue.

#### 3. Updated `githubClient.js` to Support Real-World Fetching

- **File**: `rate-repository-api/src/utils/githubClient.js`
- **Changes**:

  - Added `User-Agent` header to all GitHub API requests to comply with GitHub’s API requirements.
  - Implemented `searchRepositoriesWithFetch` to use `fetch` instead of `axios`, resolving persistent request failures.
  - Added detailed error logging for network and API errors, including connectivity tests on server startup.
  - Added `testConnectivity` method to verify the server can reach `https://api.github.com`.

  ```javascript
  async searchRepositoriesWithFetch(query, first, after) {
    try {
      const page = after ? parseInt(after, 10) + 1 : 1;
      const url = `${GITHUB_API_URL}/search/repositories?q=${encodeURIComponent(query)}&per_page=${first}&page=${page}`;
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
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
        throw new Error(`GitHub API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
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
      throw new ApolloError(`GitHub API request failed: ${error.message}`, 'GITHUB_API_FAILURE');
    }
  }
  ```

#### 4. Enhanced `CreateReview.jsx` for Real-World Repository Search

- **File**: `rate-repository-app/src/components/CreateReview.jsx`
- **Changes**:
  - Updated the search modal to use the `SEARCH_REPOSITORIES` query instead of `GET_REPOSITORIES`, enabling real-world repository fetching.
  - Added improved error handling to display user-friendly messages for network errors, rate limits, and authentication failures.
  - Preserved the existing UI design while integrating the new search functionality.

### Setup Steps

To enable real-world repository fetching, the following setup steps were performed:

1. **Updated `.env` Configuration**:

   - **File**: `rate-repository-api/.env`
   - **Change**: Ensured `GITHUB_TOKEN` is set with a valid GitHub personal access token with the `repo` scope.
     ```env
     GITHUB_TOKEN=ghp_YourValidTokenHere
     ```

2. **Verified Network Connectivity**:

   - Tested DNS resolution using a custom script (`test-dns.js`) to ensure `api.github.com` resolves correctly.
   - Confirmed network access to `https://api.github.com` using `curl` and the `testConnectivity` method in `githubClient.js`.

3. **Ensured GitHub API Compliance**:
   - Added a `User-Agent` header (`rate-repository-api/1.0.0`) to all GitHub API requests to comply with GitHub’s requirements.

### Debugging Process

The following issues were encountered and resolved during debugging:

1. **Initial `NetworkError: Failed to fetch`**:

   - **Cause**: `rate-repository-api` couldn’t reach `https://api.github.com` due to network connectivity issues in the Node.js environment.
   - **Solution**: Added `testConnectivity` to verify network access, resolved DNS issues by ensuring `api.github.com` resolves correctly, and confirmed connectivity with `curl`.

2. **Persistent `GitHub API request failed` with `axios`**:
   - **Cause**: `axios` failed to handle GitHub API responses, throwing errors with `response: null` (possibly due to parsing issues or compatibility problems with Node.js `v20.11.0`).
   - **Solution**: Switched to `fetch` in `githubClient.js` (`searchRepositoriesWithFetch`), which reliably handled GitHub API responses and enabled successful repository searches.

### Testing

- Searched for “deepseek-v3” in the app’s “Create a review” section.
- Successfully fetched real-world repositories, including `deepseek-ai/DeepSeek-V3`.
- Verified error handling displays user-friendly messages for network errors, rate limits, and authentication failures.

### Future Improvements

- **Pagination**: Add pagination to the search results modal using the `after` parameter in `SEARCH_REPOSITORIES` to fetch more repositories.
- **Error Handling**: Further enhance error messages by parsing GitHub API error responses for specific cases (e.g., 403 Forbidden).
- **Performance**: Optimize search performance by caching results in the app or using a more efficient HTTP client if `axios` issues are resolved in future versions.
