import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { THEME } from '../constants';

interface EmotionButtonProps {
  emotion: string;
  emoji: string;
  selected: boolean;
  onPress: () => void;
}

// Warm morning colors to match the modal
const MORNING_COLORS = {
  sunrise: '#FF8A65',
  sunriseLight: '#FFCCBC',
  goldenHour: '#FFB74D',
  accent: '#FF7043',
  warmGray: '#BCAAA4',
  softWhite: '#FAFAFA',
};

export const EmotionButton: React.FC<EmotionButtonProps> = ({
  emotion,
  emoji,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        selected && styles.selectedButton,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${emotion} emotion`}
      accessibilityHint={selected ? 'Tap to deselect this emotion' : 'Tap to select this emotion'}
      accessibilityState={{ selected }}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[
          styles.text,
          selected && styles.selectedText,
        ]}>
          {emotion}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: MORNING_COLORS.softWhite,
    borderRadius: 12,
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    margin: THEME.spacing.xs,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: MORNING_COLORS.sunrise,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedButton: {
    backgroundColor: MORNING_COLORS.sunriseLight,
    borderColor: MORNING_COLORS.accent,
    shadowColor: MORNING_COLORS.accent,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    transform: [{ scale: 1.02 }],
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
    marginBottom: THEME.spacing.xs,
    textAlign: 'center',
  },
  text: {
    fontSize: 13,
    color: MORNING_COLORS.warmGray,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  selectedText: {
    color: MORNING_COLORS.accent,
    fontWeight: '600',
  },
}); 