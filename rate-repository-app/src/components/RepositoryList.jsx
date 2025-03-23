// rate-repository-app/src/components/RepositoryList.jsx
const { FlatList, View, StyleSheet } = require('react-native');
const RepositoryItem = require('./RepositoryItem');
const useRepositories = require('../hooks/useRepositories');

const styles = StyleSheet.create({
  separator: {
    height: 10,
  },
});

const ItemSeparator = () => <View style={styles.separator} />;

const RepositoryList = () => {
  const { repositories } = useRepositories();

  const repositoryNodes = repositories
    ? repositories.edges.map(edge => edge.node)
    : [];

  return (
    <FlatList
      data={repositoryNodes}
      ItemSeparatorComponent={ItemSeparator}
      renderItem={({ item }) => <RepositoryItem item={item} />}
      keyExtractor={item => item.id}
    />
  );
};

module.exports = RepositoryList;