import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Alert, Button, AppState } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import * as BackgroundFetch from 'expo-background-fetch';
import { setDataToStore, removeDataFromStore, getDataFromStore } from './state/store';
import { initBackgroundFetch, tryCallApiBackground } from './helpers';
import { setWalkStarting } from './services/api';

const TASK_NAME = 'callWalkAPI'; // needed for running background task
const STORE_KEY = 'beginWalk'; // key for setting data in AsyncStore
// mocked data sent to API
const mockData = JSON.stringify({
  "walk_id": 1876772,
  "walker_id": 43307,
  "ts": "2019-12-22 19:48:00"
});

// Register task in TaskManager
initBackgroundFetch(TASK_NAME, () => tryCallApiBackground(STORE_KEY, mockData), 2);

export default function App() {
  const [appState, setAppState] = useState(AppState.currentState); // tracking AppState
  const [store, setStore] = useState(null); // see what data is saved in AsyncStore (UI only)
  const [isConnectedNetworkUI, setIsConnectedNetworkUI] = useState(false);

  useEffect(() => {
      AppState.addEventListener('change', appStateChangeHandler);
      // tracking network state To be visible on UI
      const unsubscribe = NetInfo.addEventListener(async state => {
      const isConnectedToNetwork = state.isConnected && state.isInternetReachable && state.type === 'wifi';
      setIsConnectedNetworkUI(isConnectedToNetwork);
      const storedItem = await getDataFromStore(STORE_KEY);
      if (isConnectedToNetwork && storedItem){
        tryCallApi(false);
      }
    });    
    return () => {
      AppState.removeEventListener('change', appStateChangeHandler);
      unsubscribe(); // remove listener on unmount
    }
  }, [])

  const tryCallApi = async () => {
    // we cannot rely on state 'isConnectedNetworkUI' in case of background mode, so it's better to fetch NetInfo data here
    const data = await NetInfo.fetch();
    // For test variant we would rely on 'wifi' to be able to see all logs  
    const isConnectedNetwork = data.isConnected && data.isInternetReachable && data.type === 'wifi';
    if (isConnectedNetwork) {
      // Internet works
      await setWalkStarting(mockData); // Sending API call
      await removeDataFromStore(STORE_KEY); // Remove data from AsyncStorage
      setStore(null); // UI only (show on UI)
      Alert.alert('Call API', 'Data is Successfully sent'); // Show notification for User
    } else {
      // No Internet connection
      await setDataToStore(STORE_KEY, mockData);
      setStore(mockData); // UI only
      Alert.alert('Call API', 'Sorry, you have no internet connection');
    }
  }

  const appStateChangeHandler = async (nextAppState) => {
    if (appState === 'active' && nextAppState.match(/inactive|background/)) {
      // App in not active
      // init background task
      // task interval depends on platform 
      const options = {
        minimumInterval: 2
      };
      await BackgroundFetch.registerTaskAsync(TASK_NAME, options);
    } else {
      const dataIsInStore = await getDataFromStore(STORE_KEY);
      if (dataIsInStore) {
        // if data is in AsyncStore
        tryCallApi()
      }
    }
    // setting state
    setAppState(nextAppState);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Petcheck test App</Text>
      <View style={styles.buttonWrapper}>
        <View style={styles.button}>
          <Button title='Start walk' onPress={() => tryCallApi(false)}/>
        </View>
      </View>
      <View >
        <Text>Is Connected to Internet? {isConnectedNetworkUI.toString()}</Text>
        <Text>Store {store? store.toString() : `${store}`}</Text>
      </View>
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column'
  },
  buttonWrapper: {
    flexDirection: 'row',
  },
  button: {
    marginVertical: 5
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10
  }
});
