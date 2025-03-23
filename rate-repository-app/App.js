// rate-repository-app/App.js
import { StatusBar } from 'expo-status-bar';
import { NativeRouter } from 'react-router-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApolloProvider } from '@apollo/client';
import Constants from 'expo-constants';

import Main from './src/components/Main';
import createApolloClient from './src/utils/apolloClient';
import AuthStorage from './src/utils/authStorage';
import AuthStorageContext from './src/contexts/AuthStorageContext';

const authStorage = new AuthStorage();
const apolloClient = createApolloClient(authStorage);

// Register the main component
import { AppRegistry } from 'react-native';

const App = () => {
  // Log available configuration safely
  console.log('App starting with config:', {
    manifest: Constants.manifest?.extra,
    manifest2: Constants.manifest2?.extra,
    expoConfig: Constants.expoConfig?.extra
  });

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NativeRouter>
        <ApolloProvider client={apolloClient}>
          <AuthStorageContext.Provider value={authStorage}>
            <Main />
          </AuthStorageContext.Provider>
        </ApolloProvider>
      </NativeRouter>
    </SafeAreaProvider>
  );
};

// Make sure to register the component
AppRegistry.registerComponent('main', () => App);

export default App;