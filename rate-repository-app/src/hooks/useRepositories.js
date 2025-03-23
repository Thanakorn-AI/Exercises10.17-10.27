// src/hooks/useRepositories.js
const { useQuery } = require('@apollo/client');
const { GET_REPOSITORIES } = require('../graphql/queries');

const useRepositories = (variables) => {
  const { data, loading, fetchMore, refetch } = useQuery(GET_REPOSITORIES, {
    fetchPolicy: 'cache-and-network',
    variables,
  });

  const handleFetchMore = () => {
    const canFetchMore = !loading && data?.repositories.pageInfo.hasNextPage;

    if (!canFetchMore) {
      return;
    }

    fetchMore({
      variables: {
        after: data.repositories.pageInfo.endCursor,
        ...variables,
      },
    });
  };

  return { 
    repositories: data?.repositories, 
    loading, 
    refetch,
    fetchMore: handleFetchMore
  };
};

module.exports = useRepositories;