import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import CheckScreen from '../screens/CheckScreen';
import LearnScreen from '../screens/LearnScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useT } from '../context/SettingsContext';
import { colors } from '../theme';
import type { Key } from '../i18n';

const Tab = createBottomTabNavigator();

const TABS: { name: string; label: Key; icon: keyof typeof Ionicons.glyphMap; component: React.ComponentType<any> }[] = [
  { name: 'Home', label: 'tabHome', icon: 'home-outline', component: HomeScreen },
  { name: 'Check', label: 'tabCheck', icon: 'shield-checkmark-outline', component: CheckScreen },
  { name: 'Learn', label: 'tabLearn', icon: 'school-outline', component: LearnScreen },
  { name: 'Me', label: 'tabMe', icon: 'person-outline', component: SettingsScreen },
];

export default function TabsNavigator() {
  const t = useT();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 13, fontWeight: '700' },
        tabBarStyle: { height: 66 + insets.bottom, paddingBottom: 8 + insets.bottom, paddingTop: 6 },
      }}
    >
      {TABS.map((x) => (
        <Tab.Screen
          key={x.name}
          name={x.name}
          component={x.component}
          options={{
            tabBarLabel: t(x.label),
            tabBarIcon: ({ color, size }) => <Ionicons name={x.icon} size={size + 4} color={color} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
