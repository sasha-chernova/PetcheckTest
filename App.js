import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Alert, Button, AppState } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { setDataToStore, removeDataFromStore, getDataFromStore } from './state/store';
import { initBackgroundFetch } from './services/background';
import { setWalkStarting } from './services/api';
import { TASK_NAME, STORE_KEY, mockData } from './constants';

// Register task in TaskManager
initBackgroundFetch(TASK_NAME);

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
        if (isConnectedToNetwork && storedItem) {
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
        console.log('Task in background');
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
