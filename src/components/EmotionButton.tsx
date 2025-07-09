import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../utils/theme';

interface EmotionButtonProps {
  emotion: string;
  emoji: string;
  selected: boolean;
  onPress: () => void;
}

export const EmotionButton: React.FC<EmotionButtonProps> = ({
  emotion,
  emoji,
  selected,
  onPress,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    button: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      margin: theme.spacing.xs,
      minWidth: 90,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    selectedButton: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
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
      marginBottom: theme.spacing.xs,
      textAlign: 'center',
    },
    text: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
      letterSpacing: 0.2,
    },
    selectedText: {
      color: theme.colors.background,
      fontWeight: '600',
    },
  });

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