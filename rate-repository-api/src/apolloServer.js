import { ApolloServer, toApolloError, ApolloError } from 'apollo-server';
import { ValidationError } from 'yup';

import AuthService from './utils/authService';
import createDataLoaders from './utils/createDataLoaders';
import logger from './utils/logger';
import { resolvers, typeDefs } from './graphql/schema';

const apolloErrorFormatter = (error) => {
  logger.error('[GraphQL Error]', error);

  const { originalError, message, path, extensions } = error;

  const isGraphQLError = !(originalError instanceof Error);

  if (originalError instanceof ValidationError) {
    return toApolloError(error, 'BAD_USER_INPUT');
  }

  if (originalError instanceof ApolloError || isGraphQLError) {
    return error;
  }

  // Return detailed error info for debugging (only in development)
  if (process.env.NODE_ENV !== 'production') {
    return new ApolloError(
      message,
      (extensions && extensions.code) || 'INTERNAL_SERVER_ERROR',
      {
        originalErrorMessage: originalError && originalError.message,
        stack: originalError && originalError.stack,
        path: path,
      },
    );
  }

  // Fallback for production
  return new ApolloError('Something went wrong', 'INTERNAL_SERVER_ERROR');
};

const createApolloServer = () => {
  return new ApolloServer({
    resolvers,
    typeDefs,
    formatError: apolloErrorFormatter,
    context: ({ req }) => {
      const authorization = req.headers.authorization;

      const accessToken = authorization
        ? authorization.split(' ')[1]
        : undefined;
      const dataLoaders = createDataLoaders();

      return {
        authService: new AuthService({
          accessToken,
          dataLoaders,
        }),
        dataLoaders,
      };
    },
  });
};

export default createApolloServer;
