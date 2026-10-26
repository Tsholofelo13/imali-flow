import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabsNavigator from './TabsNavigator';
import MoneyInScreen from '../screens/MoneyInScreen';
import DaysLeftScreen from '../screens/DaysLeftScreen';
import LoanCostScreen from '../screens/LoanCostScreen';

const Stack = createNativeStackNavigator();

// Tabs on the bottom. Money in, Runway (days left) and Loan cost open on top and have a Back button.
export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabsNavigator} />
      <Stack.Screen name="MoneyIn" component={MoneyInScreen} />
      <Stack.Screen name="Runway" component={DaysLeftScreen} />
      <Stack.Screen name="Loan" component={LoanCostScreen} />
    </Stack.Navigator>
  );
}
