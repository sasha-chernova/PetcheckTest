import AsyncStorage from '@react-native-community/async-storage';
import { Alert } from 'react-native';

export const setDataToStore  = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    errorHandler('Store write data', error.message)
  }
}

export const getDataFromStore  = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return JSON.parse(value);
  } catch (error) {
    errorHandler('Store read data', error.message)
  }
}

export const removeDataFromStore  = async (value) => {
  try {
    await AsyncStorage.removeItem(value);
  } catch (error) {
    errorHandler('Store remove data', error.message)
  }
}

export const errorHandler = (title, message) => Alert.alert(
  title,
  message,
  [{
    text: 'Cancel',
    style: 'cancel'
  }],
);
