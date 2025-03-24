import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { Redirect } from 'expo-router';

export default function LoginScreen() {
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/collections" />;
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        AI Legal Advisor
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Your personal legal assistant
      </Text>
      <Button
        mode="contained"
        onPress={login}
        style={styles.button}
      >
        Sign In
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
  },
  button: {
    width: '100%',
    maxWidth: 300,
  },
}); 