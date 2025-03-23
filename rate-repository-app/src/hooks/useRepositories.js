// src/hooks/useRepositories.js
const { useQuery } = require('@apollo/client');
const { GET_REPOSITORIES } = require('../graphql/queries');

const useRepositories = () => {
  const { data, loading, refetch } = useQuery(GET_REPOSITORIES, {
    fetchPolicy: 'cache-and-network',
  });

  return { repositories: data?.repositories, loading, refetch };
};

module.exports = useRepositories;