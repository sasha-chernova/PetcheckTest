import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";

export const initBackgroundFetch = async (taskName, taskFn, interval = 60 * 15) => {
  try {
    console.log("initBackgroundFetch");
    const taskIsDefined = await TaskManager.isTaskRegisteredAsync(taskName)
    if (!taskIsDefined) {
      TaskManager.defineTask(taskName, taskFn);
      const options = {
        minimumInterval: interval
      };
      await BackgroundFetch.registerTaskAsync(taskName, options);
    } 
  } catch (err) {
    console.log("registerTaskAsync failed: ", err);
  }
}

export const getData = async (url = '') => {
  // use fetch here. Can be substituted by any another tool: axios etc...
  const response = await fetch(url, {
    method: 'GET',
  });
  return response.json();
}