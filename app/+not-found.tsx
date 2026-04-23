import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.icon}>🧭</Text>
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Return to Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.bgPrimary,
    gap: Spacing.md,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  link: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  linkText: {
    fontSize: Typography.md,
    color: Colors.accent,
    fontWeight: '600',
  },
});
