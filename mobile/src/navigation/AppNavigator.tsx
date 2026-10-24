import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MoneyScreen from '../screens/MoneyScreen';
import DaysLeftScreen from '../screens/DaysLeftScreen';
import CheckScreen from '../screens/CheckScreen';
import LoanCostScreen from '../screens/LoanCostScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useT } from '../context/SettingsContext';
import { colors } from '../theme';
import type { Key } from '../i18n';

const Tab = createBottomTabNavigator();

const TABS: { name: string; label: Key; icon: keyof typeof Ionicons.glyphMap; component: React.ComponentType<any> }[] = [
  { name: 'Money', label: 'tabMoney', icon: 'cash-outline', component: MoneyScreen },
  { name: 'Days', label: 'tabDays', icon: 'calendar-outline', component: DaysLeftScreen },
  { name: 'Check', label: 'tabCheck', icon: 'shield-checkmark-outline', component: CheckScreen },
  { name: 'Loan', label: 'tabLoan', icon: 'calculator-outline', component: LoanCostScreen },
  { name: 'Me', label: 'tabMe', icon: 'person-outline', component: SettingsScreen },
];

export default function AppNavigator() {
  const t = useT();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        tabBarStyle: { height: 64 + insets.bottom, paddingBottom: 8 + insets.bottom, paddingTop: 6 },
      }}
    >
      {TABS.map((x) => (
        <Tab.Screen
          key={x.name}
          name={x.name}
          component={x.component}
          options={{
            tabBarLabel: t(x.label),
            tabBarIcon: ({ color, size }) => <Ionicons name={x.icon} size={size + 2} color={color} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
