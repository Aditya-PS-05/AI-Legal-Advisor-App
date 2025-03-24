import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../hooks/useAuth';
import { IconButton } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { Slot } from 'expo-router';

function HeaderRight() {
  const { logout } = useAuth();
  return (
    <IconButton
      icon="logout"
      onPress={logout}
      style={{ marginRight: 8 }}
    />
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <PaperProvider>
          <Stack
            screenOptions={{
              headerShown: true,
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                title: 'AI Legal Advisor',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="login"
              options={{
                title: 'Login',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="collections"
              options={{
                title: 'My Collections',
                headerRight: () => <HeaderRight />,
              }}
            />
            <Stack.Screen
              name="collection/[id]"
              options={{
                title: 'Collection Details',
                headerRight: () => <HeaderRight />,
              }}
            />
          </Stack>
        </PaperProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
