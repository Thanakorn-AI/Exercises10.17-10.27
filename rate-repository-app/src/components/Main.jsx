// rate-repository-app/src/components/Main.jsx
const { StyleSheet, View } = require('react-native');
const { Route, Routes, Navigate } = require('react-router-native');
const RepositoryList = require('./RepositoryList');
const AppBar = require('./AppBar');
const SignIn = require('./SignIn');
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </View>
  );
};

module.exports = Main;