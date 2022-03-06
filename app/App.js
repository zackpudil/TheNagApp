import React from "react";
import {
  NativeBaseProvider,
  extendTheme,
} from "native-base";
import Entry from "./components/common/Entry";
import { setNotificationHandler } from "expo-notifications";

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

// extend the theme
export const theme = extendTheme({ 
  config: {
    useSystemColorMode: false,
    initialColorMode: 'dark'
  },
  components: {
    Center: {
      baseStyle: {
        bg: 'blueGray.900',
        flex: 1,
        px: 1,
        alignItems: 'center'
      }
    }
  }
});

export default function App() {
  return (
    <NativeBaseProvider theme={theme}>
      <Entry />
    </NativeBaseProvider>
  );
}