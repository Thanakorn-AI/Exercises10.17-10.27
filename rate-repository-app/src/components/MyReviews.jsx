// rate-repository-app/src/components/MyReviews.jsx
const { FlatList, View, StyleSheet, Text } = require('react-native');
const { useQuery } = require('@apollo/client');
const { GET_CURRENT_USER } = require('../graphql/queries');
const ReviewItem = require('./ReviewItem');

const styles = StyleSheet.create({
  separator: {
    height: 10,
  },
  container: {
    flex: 1,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

const ItemSeparator = () => <View style={styles.separator} />;

const MyReviews = () => {
  const { data, loading, refetch } = useQuery(GET_CURRENT_USER, {
    variables: { includeReviews: true },
    fetchPolicy: 'cache-and-network',
  });

  const handleReviewDeleted = () => {
    refetch();
  };

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Loading reviews...</Text>
      </View>
    );
  }

  const reviewNodes = data?.me?.reviews
    ? data.me.reviews.edges.map(edge => edge.node)
    : [];

  if (reviewNodes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>You haven't created any reviews yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={reviewNodes}
      renderItem={({ item }) => (
        <ReviewItem 
          review={item} 
          showActions={true} 
          onDelete={handleReviewDeleted}
        />
      )}
      keyExtractor={({ id }) => id}
      ItemSeparatorComponent={ItemSeparator}
    />
  );
};

module.exports = MyReviews;