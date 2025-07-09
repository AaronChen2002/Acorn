import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { EmotionButtonProps } from '../types';
import { THEME } from '../constants';

export const EmotionButton: React.FC<EmotionButtonProps> = ({
  emotion,
  emoji,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.selectedContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[
        styles.label,
        selected && styles.selectedLabel,
      ]}>
        {emotion}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 2,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
    minWidth: 80,
    minHeight: 70,
  },
  selectedContainer: {
    borderColor: THEME.colors.primary,
    backgroundColor: `${THEME.colors.primary}15`, // 15% opacity
  },
  emoji: {
    fontSize: 24,
    marginBottom: THEME.spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
  selectedLabel: {
    color: THEME.colors.primary,
    fontWeight: '600',
  },
}); 