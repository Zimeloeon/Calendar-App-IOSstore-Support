
import React, {useState, useEffect, useCallback} from 'react';
import { NavigationContainer, View, Text } from '@react-navigation/native';
import MyStack from './src/routes/homeStack';
import FlashMessage from "react-native-flash-message";

import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();

const numColumns = 2;
const margin = 15;

const App = () => {
  return (
    <NavigationContainer>
      <MyStack />
      <FlashMessage position="top" />
    </NavigationContainer>
  );
}

export default App;
