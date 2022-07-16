import { createNativeStackNavigator} from '@react-navigation/native-stack';
import { CardStyleInterpolators } from '@react-navigation/stack';

import Home from '../screens/home';
import Add from '../screens/newBirthday';
import AddE from '../screens/essen';
import React, { useContext } from "react";

const Stack = createNativeStackNavigator();

export default function MyStack() {
  return (
    <Stack.Navigator style={{flex: 1}}>
      <Stack.Screen
        name="Home" 
        style={{flex: 1}}
        component={Home}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Add" 
        style={{flex: 1}}
        component={Add}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      />
      <Stack.Screen
        name="AddE" 
        style={{flex: 1}}
        component={AddE}
        options={{
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      />
    </Stack.Navigator>
  );
}