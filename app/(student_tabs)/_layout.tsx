import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { colors, radius, spacing } from '../../lib/theme';

export default function StudentTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          ...Platform.select({
            ios: {
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 1,
              shadowRadius: 8,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="home-outline" size={size} color={color} />,
          tabBarAccessibilityLabel: 'الرئيسية',
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          title: 'الاشتراك',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="receipt-outline" size={size} color={color} />,
          tabBarAccessibilityLabel: 'الاشتراك',
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'الحضور',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="calendar-outline" size={size} color={color} />,
          tabBarAccessibilityLabel: 'الحضور',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'حسابي',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="person-outline" size={size} color={color} />,
          tabBarAccessibilityLabel: 'حسابي',
        }}
      />
    </Tabs>
  );
}
