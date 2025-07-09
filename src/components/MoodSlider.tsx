import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MoodSliderProps } from '../types';
import { THEME } from '../constants';

export const MoodSlider: React.FC<MoodSliderProps> = ({
  value,
  onValueChange,
  label,
  min = 1,
  max = 10,
}) => {
  const getMoodEmoji = (val: number) => {
    if (val <= 3) return '😔';
    if (val <= 6) return '😐';
    if (val <= 8) return '🙂';
    return '😊';
  };

  const getMoodLabel = (val: number) => {
    if (val <= 3) return 'Low';
    if (val <= 6) return 'Moderate';
    if (val <= 8) return 'Good';
    return 'High';
  };

  const renderSliderButtons = () => {
    const buttons = [];
    for (let i = min; i <= max; i++) {
      buttons.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.sliderButton,
            value === i && styles.sliderButtonActive,
          ]}
          onPress={() => onValueChange(i)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.sliderButtonText,
              value === i && styles.sliderButtonTextActive,
            ]}
          >
            {i}
          </Text>
        </TouchableOpacity>
      );
    }
    return buttons;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.emoji}>{getMoodEmoji(value)}</Text>
          <Text style={styles.valueText}>
            {Math.round(value)} - {getMoodLabel(value)}
          </Text>
        </View>
      </View>
      
      <View style={styles.sliderContainer}>
        <View style={styles.buttonsRow}>
          {renderSliderButtons()}
        </View>
        <View style={styles.scaleLabels}>
          <Text style={styles.scaleLabel}>Low</Text>
          <Text style={styles.scaleLabel}>High</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: THEME.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 20,
    marginRight: THEME.spacing.xs,
  },
  valueText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  sliderContainer: {
    paddingHorizontal: THEME.spacing.xs,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: THEME.spacing.sm,
  },
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderButtonActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  sliderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  sliderButtonTextActive: {
    color: 'white',
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: THEME.spacing.xs,
  },
  scaleLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
}); 