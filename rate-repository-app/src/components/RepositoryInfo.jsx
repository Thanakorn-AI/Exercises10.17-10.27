// rate-repository-app/src/components/RepositoryInfo.jsx
const { View } = require('react-native');
const RepositoryItem = require('./RepositoryItem');

const RepositoryInfo = ({ repository }) => {
  return (
    <View>
      <RepositoryItem item={repository} showGithubLink={true} />
    </View>
  );
};

module.exports = RepositoryInfo;