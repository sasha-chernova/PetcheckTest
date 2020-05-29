import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Alert, Button, AppState } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import * as BackgroundFetch from 'expo-background-fetch';
import { setDataToStore, removeDataFromStore, getDataFromStore } from './state/store';
import { initBackgroundFetch, getData } from './helpers'

const TASK_NAME = 'callWalkAPI'; // needed for running background task
const STORE_KEY = 'beginWalk'; // key for setting data in AsyncStore
// mocked data sent to API
const mockData = JSON.stringify({
  "walk_id": 1876772,
  "walker_id": 43307,
  "ts": "2019-12-22 19:48:00"
});

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
      console.log('network state triggered')
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

  const setWalkStarting = async (body) => {
    // fake request for success response for testing
    return await getData('https://reactnative.dev/movies.json')
      .then(async (json) => {
        console.log('data is received')
        return json;
      })
      .catch(async (error) => {
        // in case of error (no internet connection in this case)
        console.log('error', error)
        return false;
      })
  };

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
      console.log('No Internet');
      await setDataToStore(STORE_KEY, mockData);
      setStore(mockData); // UI only
      Alert.alert('Call API', 'Sorry, you have no internet connection');
    }
  }

  const tryCallApiBackground = async () => {
    console.log('tryCallApiBackground called')
    const dataIsInStore = await getDataFromStore(STORE_KEY);
    if (!dataIsInStore) {
      await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
      return BackgroundFetch.Result.NoData
    }
    const data = await NetInfo.fetch(); 
    const isConnectedNetwork = data.isConnected && data.isInternetReachable && data.type === 'wifi';
    if (isConnectedNetwork) {
      try {
        await setWalkStarting(mockData); // Sending API call
        console.log('tryCallApiBackground success')
        await removeDataFromStore(STORE_KEY); 
        await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
        return BackgroundFetch.Result.NewData
      } catch(e) {
        return BackgroundFetch.Result.NoData
      }
    }
    console.log('tryCallApiBackground error')
    return BackgroundFetch.Result.NoData
  }

  const appStateChangeHandler = async (nextAppState) => {
    console.log('appStateChangeHandler called')
    if (appState === 'active' && nextAppState.match(/inactive|background/)) {
      // App in not active
      // init background task
      // task interval depends on platform 
      await initBackgroundFetch(TASK_NAME, tryCallApiBackground, 2);
      console.log('App has come to the background!');
    } else {
      console.log('App active!');
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
