import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';

import { Provider } from 'react-redux';
import { store, persistor } from './store/configureStore';
import { PersistGate } from 'redux-persist/integration/react';
import Router from './Router';

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaView style={styles.container}>
          <View style={styles.app}>
            <Router />
          </View>
        </SafeAreaView>
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  app: {
    height: `100%`,
    width: `100%`,
    maxWidth: '500px',
  },
  container: {
    height: `100%`,
    width: `100%`,
    backgroundColor: '#0c0c0c',
    display: 'flex',
    alignItems: 'center',
  },
});

export default App;
