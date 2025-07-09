import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';
import { THEME } from './src/constants';
import { useAppStore } from './src/stores/appStore';

export default function App() {
  const theme = useAppStore((state) => state.theme);

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={THEME.colors.background} 
      />
      <View style={styles.header}>
        <Text style={styles.title}>🌱 Acorn</Text>
        <Text style={styles.subtitle}>Emotional Awareness & Productivity</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          Welcome to your emotional awareness journey!
        </Text>
        <Text style={styles.descriptionText}>
          This is the foundation of your personal productivity and emotional awareness app.
          {'\n\n'}Features coming soon:
          {'\n'}• Daily emotional check-ins
          {'\n'}• Self-reflection prompts  
          {'\n'}• Time tracking & calendar
          {'\n'}• AI-powered insights
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.lg,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: THEME.colors.text,
    textAlign: 'center',
    marginBottom: THEME.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: THEME.spacing.lg,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: THEME.colors.text,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
  },
  descriptionText: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
