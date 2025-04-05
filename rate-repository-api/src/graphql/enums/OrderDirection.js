// rate-repository-api/src/graphql/enums/OrderDirection.js
import { gql } from 'apollo-server';

export const typeDefs = gql`
  enum OrderDirection {
    ASC
    DESC
  }
`;

export const resolvers = {};

export default {
  typeDefs,
  resolvers,
};
