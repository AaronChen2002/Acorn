import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckInScreen } from './src/screens/CheckInScreen';
import { DailyPromptScreen } from './src/screens/DailyPromptScreen';
import { THEME } from './src/constants';

type ScreenType = 'home' | 'checkin' | 'reflection';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');

  const renderHomeScreen = () => (
    <View style={styles.homeContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>🌱 Acorn</Text>
        <Text style={styles.subtitle}>Personal productivity and emotional awareness</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => setCurrentScreen('checkin')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonEmoji}>😊</Text>
          <Text style={styles.buttonTitle}>Daily Check-In</Text>
          <Text style={styles.buttonDescription}>
            Track your mood, emotions, priorities, and concerns for AI insights
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => setCurrentScreen('reflection')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonEmoji}>🤔</Text>
          <Text style={styles.buttonTitle}>Daily Reflection</Text>
          <Text style={styles.buttonDescription}>
            Explore deeper questions about your mental health, productivity, and personal growth
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Your responses help build personalized insights and patterns over time
        </Text>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (currentScreen) {
      case 'checkin':
        return <CheckInScreen />;
      case 'reflection':
        return (
          <DailyPromptScreen 
            onComplete={() => setCurrentScreen('home')}
          />
        );
      default:
        return renderHomeScreen();
    }
  };

  return (
    <View style={styles.container}>
      {currentScreen !== 'home' && (
        <View style={styles.backButton}>
          <TouchableOpacity
            onPress={() => setCurrentScreen('home')}
            style={styles.backButtonTouch}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Back to Home</Text>
          </TouchableOpacity>
        </View>
      )}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  backButton: {
    paddingTop: 50,
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.sm,
    backgroundColor: THEME.colors.surface,
  },
  backButtonTouch: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: THEME.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
  },
  button: {
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: THEME.colors.primary,
  },
  secondaryButton: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  buttonEmoji: {
    fontSize: 32,
    marginBottom: THEME.spacing.sm,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.xs,
  },
  buttonDescription: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: THEME.spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingTop: THEME.spacing.lg,
  },
  footerText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
  },
}); 