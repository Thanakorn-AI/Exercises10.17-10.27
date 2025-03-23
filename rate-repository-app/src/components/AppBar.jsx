// rate-repository-app/src/components/AppBar.jsx
const { StyleSheet, ScrollView } = require('react-native');
const { Pressable } = require('react-native');
const { Link, useNavigate } = require('react-router-native');
const { SafeAreaView } = require('react-native-safe-area-context');
const { useQuery, useApolloClient } = require('@apollo/client');

const Text = require('./Text');
const theme = require('../theme');
const { GET_CURRENT_USER } = require('../graphql/queries');
const useAuthStorage = require('../hooks/useAuthStorage');

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.appBarBackground,
    paddingBottom: 10,
  },
  scrollContainer: {
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
});

const AppBarTab = ({ to, children, onPress }) => (
  <Pressable style={styles.tab} onPress={onPress}>
    {to ? (
      <Link to={to}>
        <Text color="white" fontWeight="bold">
          {children}
        </Text>
      </Link>
    ) : (
      <Text color="white" fontWeight="bold">
        {children}
      </Text>
    )}
  </Pressable>
);

const AppBar = () => {
  const { data } = useQuery(GET_CURRENT_USER);
  const authStorage = useAuthStorage();
  const apolloClient = useApolloClient();
  const navigate = useNavigate();

  const isSignedIn = data?.me != null;

  const handleSignOut = async () => {
    await authStorage.removeAccessToken();
    apolloClient.resetStore();
    navigate('/');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView horizontal contentContainerStyle={styles.scrollContainer}>
        <AppBarTab to="/">Repositories</AppBarTab>
        {isSignedIn ? (
          <AppBarTab onPress={handleSignOut}>Sign Out</AppBarTab>
        ) : (
          <AppBarTab to="/signin">Sign In</AppBarTab>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

module.exports = AppBar;