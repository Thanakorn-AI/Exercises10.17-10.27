// rate-repository-api/src/graphql/__tests__/schema.test.js
import { ApolloServer } from 'apollo-server-koa';

import { typeDefs, resolvers } from '../schema';

describe('createSchema', () => {
  it('creates schema without errors', () => {
    const apolloServer = new ApolloServer({
      resolvers,
      typeDefs,
    });

    expect(apolloServer).toBeDefined();
  });
});
