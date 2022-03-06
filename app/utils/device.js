import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const getDeviceToken = async () => {

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('App will not work without push notifications, dick.');
      return;
    }
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C'
    });
  }

  return token;
};

