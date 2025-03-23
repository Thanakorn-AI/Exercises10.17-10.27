// rate-repository-app/src/components/RepositoryList.jsx
import React, { useState, useEffect } from 'react';
import { FlatList, View, StyleSheet, Pressable } from 'react-native';
import { useNavigate } from 'react-router-native';
import RepositoryItem from './RepositoryItem';
import RepositoryListHeader from './RepositoryListHeader';
import useRepositories from '../hooks/useRepositories';

const styles = StyleSheet.create({
  separator: {
    height: 10,
  },
});

const ItemSeparator = () => <View style={styles.separator} />;

export class RepositoryListContainer extends React.Component {
  renderHeader = () => {
    const { sortOrder, setSortOrder, searchKeyword, setSearchKeyword } = this.props;
    return (
      <RepositoryListHeader
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
      />
    );
  };

  render() {
    const { repositories, navigate, onEndReach } = this.props;
    const repositoryNodes = repositories
      ? repositories.edges.map(edge => edge.node)
      : [];

    const handleRepositoryPress = (id) => {
      navigate(`/repositories/${id}`);
    };

    return (
      <FlatList
        data={repositoryNodes}
        ItemSeparatorComponent={ItemSeparator}
        renderItem={({ item }) => (
          <Pressable onPress={() => handleRepositoryPress(item.id)}>
            <RepositoryItem item={item} />
          </Pressable>
        )}
        keyExtractor={item => item.id}
        ListHeaderComponent={this.renderHeader}
        onEndReached={onEndReach}
        onEndReachedThreshold={0.5}
      />
    );
  }
}

const RepositoryList = () => {
  const [sortOrder, setSortOrder] = useState('latest');
  const [searchKeyword, setSearchKeyword] = useState('');
  const navigate = useNavigate();

  // Get variables based on sortOrder
  const getVariables = () => {
    let variables = {
      first: 8,
      searchKeyword: searchKeyword
    };

    switch (sortOrder) {
      case 'latest':
        variables = { ...variables, orderBy: 'CREATED_AT', orderDirection: 'DESC' };
        break;
      case 'highest':
        variables = { ...variables, orderBy: 'RATING_AVERAGE', orderDirection: 'DESC' };
        break;
      case 'lowest':
        variables = { ...variables, orderBy: 'RATING_AVERAGE', orderDirection: 'ASC' };
        break;
    }

    return variables;
  };

  const { repositories, fetchMore, refetch } = useRepositories(getVariables());

  useEffect(() => {
    refetch();
  }, [sortOrder, searchKeyword]);

  const onEndReach = () => {
    fetchMore();
  };

  return (
    <RepositoryListContainer
      repositories={repositories}
      navigate={navigate}
      sortOrder={sortOrder}
      setSortOrder={setSortOrder}
      searchKeyword={searchKeyword}
      setSearchKeyword={setSearchKeyword}
      onEndReach={onEndReach}
    />
  );
};

export default RepositoryList;