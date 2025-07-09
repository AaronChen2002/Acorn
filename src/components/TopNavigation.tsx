import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../constants';

type ScreenType = 'checkin' | 'reflection' | 'timetracking';

interface TopNavigationProps {
  currentScreen: ScreenType;
  onScreenChange: (screen: ScreenType) => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentScreen,
  onScreenChange,
}) => {
  const tabs = [
    { 
      key: 'checkin' as ScreenType, 
      label: 'Check-In', 
      emoji: '😊',
      description: 'Mood & Emotions'
    },
    { 
      key: 'reflection' as ScreenType, 
      label: 'Reflection', 
      emoji: '🤔',
      description: 'Daily Prompts'
    },
    { 
      key: 'timetracking' as ScreenType, 
      label: 'Time Tracking', 
      emoji: '⏱️',
      description: 'Activity Logging'
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌱 Acorn</Text>
      </View>
      
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              currentScreen === tab.key && styles.tabActive,
            ]}
            onPress={() => onScreenChange(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabEmoji}>{tab.emoji}</Text>
            <Text
              style={[
                styles.tabLabel,
                currentScreen === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
            <Text
              style={[
                styles.tabDescription,
                currentScreen === tab.key && styles.tabDescriptionActive,
              ]}
            >
              {tab.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  header: {
    paddingTop: 50,
    paddingBottom: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: THEME.spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.xs,
    marginHorizontal: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    backgroundColor: THEME.colors.surface,
    borderBottomColor: THEME.colors.primary,
  },
  tabEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: THEME.colors.text,
  },
  tabDescription: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 1,
  },
  tabDescriptionActive: {
    color: THEME.colors.primary,
  },
}); 