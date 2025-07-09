import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { THEME } from '../constants';
import { HamburgerButton } from './HamburgerButton';
import { SideMenu } from './SideMenu';

interface TopNavigationProps {
  currentScreen: string;
  onScreenChange: (screen: string) => void;
}

const getScreenTitle = (screen: string): string => {
  switch (screen) {
    case 'timetracking':
      return 'Time Tracking';
    case 'checkin':
      return 'Check-ins';
    case 'reflection':
      return 'Reflections';
    case 'morning':
      return 'Morning Ritual';
    default:
      return 'Acorn';
  }
};

const getScreenSubtitle = (screen: string): string => {
  switch (screen) {
    case 'timetracking':
      return 'Focus on what matters most';
    case 'checkin':
      return 'Track your emotional wellness';
    case 'reflection':
      return 'Reflect on your day';
    case 'morning':
      return 'Start your day mindfully';
    default:
      return 'Your mindful companion';
  }
};

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentScreen,
  onScreenChange,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleNavigate = (screen: string) => {
    onScreenChange(screen);
    setIsMenuOpen(false);
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Left Side - Hamburger Menu */}
          <View style={styles.leftSection}>
            <HamburgerButton
              onPress={handleMenuToggle}
              isMenuOpen={isMenuOpen}
            />
          </View>

          {/* Center - Title */}
          <View style={styles.centerSection}>
            <Text style={styles.title} numberOfLines={1}>
              {getScreenTitle(currentScreen)}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {getScreenSubtitle(currentScreen)}
            </Text>
          </View>

          {/* Right Side - Future actions */}
          <View style={styles.rightSection}>
            {/* Placeholder for future actions like notifications, search, etc. */}
          </View>
        </View>
      </SafeAreaView>

      {/* Side Menu */}
      <SideMenu
        isVisible={isMenuOpen}
        onClose={handleMenuClose}
        onNavigate={handleNavigate}
      />
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: THEME.colors.background,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    backgroundColor: THEME.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    minHeight: 64,
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: THEME.spacing.md,
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
}); 