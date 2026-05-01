import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../lib/theme';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="index" options={{ title: 'Login' }} />
            <Stack.Screen name="signup" options={{ title: 'Sign Up', presentation: 'modal' }} />
            <Stack.Screen name="reset-password" options={{ title: 'Reset Password', presentation: 'modal' }} />
          </>
        ) : user?.role === 'unassigned' ? (
          <Stack.Screen name="role-selection" options={{ title: 'Select Role' }} />
        ) : user?.role === 'student' ? (
          <Stack.Screen name="(student_tabs)" options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="(driver_tabs)" options={{ headerShown: false }} />
        )}
      </Stack>
    </QueryClientProvider>
  );
}
