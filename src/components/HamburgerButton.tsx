import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme } from '../utils/theme';

interface HamburgerButtonProps {
  onPress: () => void;
  isMenuOpen?: boolean;
}

export const HamburgerButton: React.FC<HamburgerButtonProps> = ({ 
  onPress, 
  isMenuOpen = false 
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      backgroundColor: 'transparent',
    },
    containerOpen: {
      backgroundColor: theme.colors.surface,
    },
    line: {
      width: 24,
      height: 3,
      backgroundColor: theme.colors.text,
      borderRadius: 2,
      marginVertical: 2,
    },
    line1: {},
    line2: {},
    line3: {},
    line1Open: {
      transform: [{ rotate: '45deg' }, { translateY: 7 }],
    },
    line2Open: {
      opacity: 0,
    },
    line3Open: {
      transform: [{ rotate: '-45deg' }, { translateY: -7 }],
    },
  });

  return (
    <TouchableOpacity
      style={[styles.container, isMenuOpen && styles.containerOpen]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel="Open menu"
      accessibilityHint="Double tap to open navigation menu"
    >
      <View style={[styles.line, styles.line1, isMenuOpen && styles.line1Open]} />
      <View style={[styles.line, styles.line2, isMenuOpen && styles.line2Open]} />
      <View style={[styles.line, styles.line3, isMenuOpen && styles.line3Open]} />
    </TouchableOpacity>
  );
}; 