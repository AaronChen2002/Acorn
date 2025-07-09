import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../utils/theme';
import { HamburgerButton } from './HamburgerButton';
import { SideMenu } from './SideMenu';

interface TopNavigationProps {
  currentScreen: string;
  onScreenChange: (screen: string) => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentScreen,
  onScreenChange,
}) => {
  const { theme } = useTheme();
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

  const styles = StyleSheet.create({
    safeArea: {
      backgroundColor: theme.colors.background,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      minHeight: 64,
    },
    leftSection: {
      width: 44,
      alignItems: 'flex-start',
    },
    centerSection: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: theme.spacing.md,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    rightSection: {
      width: 44,
      alignItems: 'flex-end',
    },
    logo: {
      fontSize: 24,
      marginRight: theme.spacing.xs,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 2,
    },
  });

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

          {/* Center - Acorn Logo + Title */}
          <View style={styles.centerSection}>
            <Text style={styles.logo}>🌰</Text>
            <Text style={styles.title} numberOfLines={1}>
              Acorn
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