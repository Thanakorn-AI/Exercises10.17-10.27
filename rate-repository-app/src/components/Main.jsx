// rate-repository-app/src/components/Main.jsx
const { StyleSheet, View } = require('react-native');
const { Route, Routes, Navigate } = require('react-router-native');
const RepositoryList = require('./RepositoryList');
const AppBar = require('./AppBar');
const SignIn = require('./SignIn');
const SignUp = require('./SignUp');
const SingleRepository = require('./SingleRepository');
const CreateReview = require('./CreateReview');
const MyReviews = require('./MyReviews');
const theme = require('../theme');

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: theme.colors.mainBackground,
  },
});

const Main = () => {
  console.log('Main component rendering');
  return (
    <View style={styles.container}>
      <AppBar />
      <Routes>
        <Route path="/" element={<RepositoryList />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/repositories/:id" element={<SingleRepository />} />
        <Route path="/create-review" element={<CreateReview />} />
        <Route path="/my-reviews" element={<MyReviews />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </View>
  );
};

module.exports = Main;