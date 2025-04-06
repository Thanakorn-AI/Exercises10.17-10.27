// Exercises10.17-10.27/rate-repository-api/src/graphql/queries/searchRepositories.js
import { gql } from 'apollo-server';
import * as yup from 'yup';
import { githubClient } from '../../utils/githubClient';

export const typeDefs = gql`
  extend type Query {
    searchRepositories(
      query: String!
      first: Int
      after: String
    ): RepositorySearchConnection!
  }

  type RepositorySearchEdge {
    cursor: String!
    node: RepositorySearchResult!
  }

  type RepositorySearchConnection {
    totalCount: Int!
    pageInfo: PageInfo!
    edges: [RepositorySearchEdge!]!
  }

  type RepositorySearchResult {
    id: ID!
    fullName: String!
    description: String
    language: String
    forksCount: Int
    stargazersCount: Int
    ownerAvatarUrl: String
    url: String
  }
`;

const argsSchema = yup.object({
  query: yup.string().required().trim(),
  first: yup.number().min(1).max(30).default(30),
  after: yup.string(),
});

export const resolvers = {
  Query: {
    searchRepositories: async (obj, args) => {
      const { query, first, after } = await argsSchema.validate(args);

      // Use fetch-based method instead of axios
      const response = await githubClient.searchRepositoriesWithFetch(
        query,
        first,
        after,
      );

      return {
        totalCount: response.total_count,
        pageInfo: {
          hasNextPage: !!response.next_page,
          hasPreviousPage: false,
          startCursor: response.items.length > 0 ? response.items[0].id : null,
          endCursor:
            response.items.length > 0
              ? response.items[response.items.length - 1].id
              : null,
        },
        edges: response.items.map((item) => ({
          cursor: item.id,
          node: {
            id: item.id.toString(),
            fullName: item.full_name,
            description: item.description,
            language: item.language,
            forksCount: item.forks_count,
            stargazersCount: item.stargazers_count,
            ownerAvatarUrl: item.owner.avatar_url,
            url: item.html_url,
          },
        })),
      };
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
