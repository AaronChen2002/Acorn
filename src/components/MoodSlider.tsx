import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../utils/theme';

interface MoodSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
}



export const MoodSlider: React.FC<MoodSliderProps> = ({
  label,
  value,
  onValueChange,
  min = 1,
  max = 5,
}) => {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      marginVertical: theme.spacing.xs,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      letterSpacing: 0.2,
      marginBottom: theme.spacing.sm,
    },
    sliderContainer: {
      paddingHorizontal: theme.spacing.sm,
    },
    sliderWrapper: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
    },
    scaleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.xs,
      paddingHorizontal: theme.spacing.xs,
    },
    scaleLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    valueContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    valueText: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.primary,
      backgroundColor: 'rgba(255, 107, 53, 0.1)',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: 16,
      minWidth: 32,
      textAlign: 'center',
    },
  });
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={styles.sliderContainer}>
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{value}</Text>
        </View>
        
        <View style={styles.sliderWrapper}>
          <Slider
            style={{ width: '100%', height: 30 }}
            minimumValue={min}
            maximumValue={max}
            value={value}
            onValueChange={onValueChange}
            onSlidingStart={() => {}}
            onSlidingComplete={onValueChange}
            step={1}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbStyle={{
              backgroundColor: theme.colors.primary,
              width: 20,
              height: 20,
              borderRadius: 10,
              shadowColor: theme.colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
            trackStyle={{
              height: 4,
              borderRadius: 2,
            }}
            accessibilityLabel={`Slider for ${label}`}
            accessibilityHint={`Drag to set value between ${min} and ${max}`}
            accessibilityValue={{ min, max, now: value }}
          />
        </View>
        
        <View style={styles.scaleContainer}>
          <Text style={styles.scaleLabel}>Low</Text>
          <Text style={styles.scaleLabel}>High</Text>
        </View>
      </View>
    </View>
  );
}; 