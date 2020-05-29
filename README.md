# Petcheck test App

Simple Android Expo based App 

## Getting Started

This App is created with [Expo](https://github.com/expo/expo) for time economy. Because of specifics of Expo dev mode on emulator, to test if internet connection is available, we rely on switching Wi-Fi connection only, having cellular network always alive. Otherwise, if we turn off all available network connections, we're unable to see the logs

clone repo 
```
git clone https://github.com/sasha-chernova/PetcheckTest.git
```

In real App we can use Firebase for sending notifications to User to inform that appointment is scheduled and make him click on "Start walk" button.

To initiate a dog walking, user has to click "Start walk" button. 
(Here, for demo purposes, we are trying to reach out some public API)
-- If there is available internet connetion, data should be sent successfully, and user receives a notification, that dog walk has started
-- If there is no available internet connetion, we're saving data to Async Storage and in the case if user decides to collapse and app (switch to another one, or completely close -- remove our app from memory),
we register Background Job, which will try periodically to reach an API and write data, that walk has started. If it was successfull, we clear our storage and unregister background job to not drain the device battery.
-- If, while being in a background, data wasn't sent (no internet connection appeared during that time), and user launches our app again,
we again trying to make an API call in order to send data as soon as possible

### Installing

* install Expo globally
```
npm install --global expo-cli
```

* Install emulator (Android studio etc)
* install dependencies 
```
npm install
```
* run project
```
npm start
```
In opened expo window click on 'run on Android device' (emulator should be opened before)


## Built With

* [Expo](https://github.com/expo/expo)
* [react-native](https://github.com/facebook/react-native)
* [@react-native-community/netinfo](https://github.com/react-native-community/react-native-netinfo)
* [expo-background-fetch](https://docs.expo.io/versions/latest/sdk/background-fetch/)
* [@react-native-community/async-storage](https://www.npmjs.com/package/@react-native-community/async-storage)
* [expo-task-manager](https://www.npmjs.com/package/expo-task-manager)
