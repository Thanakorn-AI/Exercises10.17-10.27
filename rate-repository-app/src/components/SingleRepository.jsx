// rate-repository-app/src/components/SingleRepository.jsx
const { FlatList, View, StyleSheet } = require('react-native');
const { useParams } = require('react-router-native');
const useRepository = require('../hooks/useRepository');
const RepositoryInfo = require('./RepositoryInfo');
const ReviewItem = require('./ReviewItem');
const Text = require('./Text');

const styles = StyleSheet.create({
  separator: {
    height: 10,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  }
});

const ItemSeparator = () => <View style={styles.separator} />;

const SingleRepository = () => {
  const { id } = useParams();
  const { repository, loading, fetchMore } = useRepository({ id, first: 5 });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading repository...</Text>
      </View>
    );
  }

  if (!repository) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Repository not found</Text>
      </View>
    );
  }

  const reviews = repository.reviews
    ? repository.reviews.edges.map(edge => edge.node)
    : [];

  const onEndReach = () => {
    fetchMore();
  };

  return (
    <FlatList
      data={reviews}
      renderItem={({ item }) => <ReviewItem review={item} />}
      keyExtractor={({ id }) => id}
      ListHeaderComponent={() => <RepositoryInfo repository={repository} />}
      ItemSeparatorComponent={ItemSeparator}
      onEndReached={onEndReach}
      onEndReachedThreshold={0.5}
    />
  );
};

module.exports = SingleRepository;