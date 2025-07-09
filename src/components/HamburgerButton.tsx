import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { HamburgerButtonProps } from '../types';
import { THEME } from '../constants';

export const HamburgerButton: React.FC<HamburgerButtonProps> = ({
  onPress,
  isMenuOpen,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={styles.hamburgerContainer}>
        <Animated.View
          style={[
            styles.line,
            styles.topLine,
            isMenuOpen && styles.topLineOpen,
          ]}
        />
        <Animated.View
          style={[
            styles.line,
            styles.middleLine,
            isMenuOpen && styles.middleLineOpen,
          ]}
        />
        <Animated.View
          style={[
            styles.line,
            styles.bottomLine,
            isMenuOpen && styles.bottomLineOpen,
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: 'transparent',
  },
  hamburgerContainer: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  line: {
    height: 2,
    backgroundColor: THEME.colors.text,
    borderRadius: 1,
    width: '100%',
  },
  topLine: {
    // Default state
  },
  topLineOpen: {
    // TODO: Add rotation animation in Phase 5
    backgroundColor: THEME.colors.primary,
  },
  middleLine: {
    // Default state
  },
  middleLineOpen: {
    // TODO: Add fade animation in Phase 5
    opacity: 0.5,
    backgroundColor: THEME.colors.primary,
  },
  bottomLine: {
    // Default state
  },
  bottomLineOpen: {
    // TODO: Add rotation animation in Phase 5
    backgroundColor: THEME.colors.primary,
  },
}); 