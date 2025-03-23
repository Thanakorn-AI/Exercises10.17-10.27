// src/utils/apolloClient.js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Constants from 'expo-constants';

// Safely access configuration using fallbacks
const getApolloUri = () => {
  // Try different ways to access the configuration
  try {
    if (Constants.expoConfig?.extra?.apolloUri) {
      return Constants.expoConfig.extra.apolloUri;
    } else if (Constants.manifest?.extra?.apolloUri) {
      return Constants.manifest.extra.apolloUri;
    } else if (Constants.manifest2?.extra?.apolloUri) {
      return Constants.manifest2.extra.apolloUri;
    } else {
      // Fallback to default value or environment variable
      return process.env.APOLLO_URI || 'http://192.168.1.146:4000/graphql';
    }
  } catch (error) {
    console.warn('Error getting Apollo URI from config:', error);
    return 'http://192.168.1.146:4000/graphql'; // Fallback default
  }
};

const apolloUri = getApolloUri();
console.log('Using Apollo URI:', apolloUri);

const httpLink = createHttpLink({
  uri: apolloUri,
});

const createApolloClient = (authStorage) => {
  const authLink = setContext(async (_, { headers }) => {
    try {
      const accessToken = await authStorage.getAccessToken();
      return {
        headers: {
          ...headers,
          authorization: accessToken ? `Bearer ${accessToken}` : '',
        },
      };
    } catch (e) {
      console.log(e);
      return { headers };
    }
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
};

export default createApolloClient;