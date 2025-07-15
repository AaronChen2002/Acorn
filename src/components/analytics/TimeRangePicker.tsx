import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CHART_COLORS } from './BaseChart';

type TimeRange = 'week' | 'month' | 'quarter';

interface TimeRangePickerProps {
  selectedRange: TimeRange;
  onRangeSelect: (range: TimeRange) => void;
  containerStyle?: any;
}

const TIME_RANGE_OPTIONS = [
  { key: 'week' as TimeRange, label: 'This Week', shortLabel: '7D' },
  { key: 'month' as TimeRange, label: 'This Month', shortLabel: '30D' },
  { key: 'quarter' as TimeRange, label: 'This Quarter', shortLabel: '90D' },
];

export const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  selectedRange,
  onRangeSelect,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {TIME_RANGE_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.option,
            selectedRange === option.key && styles.selectedOption,
          ]}
          onPress={() => onRangeSelect(option.key)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.optionText,
              selectedRange === option.key && styles.selectedOptionText,
            ]}
          >
            {option.shortLabel}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: CHART_COLORS.background,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: CHART_COLORS.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: CHART_COLORS.textSecondary,
  },
  selectedOptionText: {
    color: CHART_COLORS.background,
  },
}); 