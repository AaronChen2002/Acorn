import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAppStore } from '../stores/appStore';
import { THEME } from '../constants';

export const TimeTrackingScreen: React.FC = () => {
  const addTimeEntry = useAppStore((state) => state.addTimeEntry);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Time Tracking</Text>
        <Text style={styles.subtitle}>Focus on what matters most</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.placeholder}>
          Time tracking interface coming soon! 
        </Text>
        <Text style={styles.description}>
          This will be where you can track your activities, set focus sessions, 
          and monitor how you spend your time throughout the day.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    padding: THEME.spacing.xl,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.xl,
  },
  placeholder: {
    fontSize: 18,
    color: THEME.colors.text,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 400,
  },
}); 