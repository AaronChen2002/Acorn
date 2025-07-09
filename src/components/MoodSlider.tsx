import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../constants';

interface MoodSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
}

// Warm morning colors to match the modal
const MORNING_COLORS = {
  sunrise: '#FF8A65',
  sunriseLight: '#FFCCBC', 
  goldenHour: '#FFB74D',
  accent: '#FF7043',
  warmGray: '#BCAAA4',
  softGray: '#E8E8E8',
};

// Mood level descriptors
const getMoodDescriptor = (value: number, type: 'energy' | 'positivity') => {
  const energyLabels = [
    '', 'Very Low', 'Low', 'Moderate', 'Good', 'High', 'Very High'
  ];
  const positivityLabels = [
    '', 'Very Low', 'Low', 'Neutral', 'Good', 'High', 'Very High'
  ];
  
  const labels = type === 'energy' ? energyLabels : positivityLabels;
  const index = Math.min(Math.max(value, 0), labels.length - 1);
  return labels[index];
};

export const MoodSlider: React.FC<MoodSliderProps> = ({
  label,
  value,
  onValueChange,
  min = 1,
  max = 6,
}) => {
  const type = label.toLowerCase().includes('energy') ? 'energy' : 'positivity';
  const descriptor = getMoodDescriptor(value, type);
  
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
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Set ${label.toLowerCase()} to ${i}`}
          accessibilityHint={`Select level ${i} out of ${max}`}
          accessibilityState={{ selected: value === i }}
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
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.descriptor}>{descriptor}</Text>
        </View>
      </View>
      
      <View style={styles.sliderContainer}>
        <View style={styles.buttonsRow}>
          {renderSliderButtons()}
        </View>
        
        <View style={styles.scaleContainer}>
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
    marginBottom: THEME.spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text,
    letterSpacing: 0.2,
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: MORNING_COLORS.accent,
    lineHeight: 28,
  },
  descriptor: {
    fontSize: 12,
    color: MORNING_COLORS.warmGray,
    fontWeight: '500',
    marginTop: -2,
  },
  sliderContainer: {
    paddingHorizontal: THEME.spacing.sm,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: THEME.spacing.sm,
  },
  sliderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MORNING_COLORS.softGray,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: MORNING_COLORS.sunrise,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sliderButtonActive: {
    backgroundColor: MORNING_COLORS.accent,
    borderColor: MORNING_COLORS.sunrise,
    shadowColor: MORNING_COLORS.accent,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    transform: [{ scale: 1.1 }],
  },
  sliderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: MORNING_COLORS.warmGray,
  },
  sliderButtonTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.xs,
  },
  scaleLabel: {
    fontSize: 12,
    color: MORNING_COLORS.warmGray,
    fontWeight: '500',
  },
}); 