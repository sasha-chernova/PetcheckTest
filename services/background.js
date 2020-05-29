import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import { removeDataFromStore, getDataFromStore } from './../state/store';
import NetInfo from "@react-native-community/netinfo";
import { setWalkStarting } from './../services/api';
import { STORE_KEY, mockData } from './../constants';

export const tryCallApiBackground = async () => {
    const dataIsInStore = await getDataFromStore(STORE_KEY);
    if (!dataIsInStore) {
        return BackgroundFetch.Result.NoData
    }
    const data = await NetInfo.fetch();
    const isConnectedNetwork = data.isConnected && data.isInternetReachable && data.type === 'wifi';
    if (isConnectedNetwork) {
        try {
            await setWalkStarting(mockData); // Sending API call
            await removeDataFromStore(STORE_KEY);
            return BackgroundFetch.Result.NewData;
        } catch (e) {
            return BackgroundFetch.Result.NoData;
        }
    }
    return BackgroundFetch.Result.NoData;
}

// initialization of backgroundFetch
export const initBackgroundFetch = async (taskName) => {
    try {

        if (!TaskManager.isTaskDefined(taskName)) {
            TaskManager.defineTask(taskName, tryCallApiBackground);
        }
        const options = {
            minimumInterval: 2
        };

        await BackgroundFetch.registerTaskAsync(taskName, options);
    } catch (err) {
        console.log("registerTaskAsync failed: ", err);
    }
}
