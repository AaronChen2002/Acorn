import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { THEME } from '../constants';

interface TimePickerProps {
  label: string;
  value: Date;
  onTimeChange: (time: Date) => void;
  placeholder?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  label,
  value,
  onTimeChange,
  placeholder = 'Select time',
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        times.push(time);
      }
    }
    return times;
  };

  const handleTimeSelect = (selectedTime: Date) => {
    onTimeChange(selectedTime);
    setShowPicker(false);
  };

  const renderWebTimePicker = () => {
    if (!showPicker) return null;

    const timeOptions = generateTimeOptions();
    const currentHour = value.getHours();

    return (
      <View style={styles.webPickerContainer}>
        <View style={styles.webPickerContent}>
          <Text style={styles.webPickerTitle}>Select {label}</Text>
          <View style={styles.timeGrid}>
            {timeOptions
              .filter((time) => time.getHours() >= currentHour - 2 && time.getHours() <= currentHour + 4)
              .slice(0, 20)
              .map((time, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeOption,
                    time.getTime() === value.getTime() && styles.timeOptionSelected,
                  ]}
                  onPress={() => handleTimeSelect(time)}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      time.getTime() === value.getTime() && styles.timeOptionTextSelected,
                    ]}
                  >
                    {formatTime(time)}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
          <TouchableOpacity style={styles.webPickerClose} onPress={() => setShowPicker(false)}>
            <Text style={styles.webPickerCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.timeButton}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.timeButtonText}>
          {value ? formatTime(value) : placeholder}
        </Text>
        <Text style={styles.timeButtonIcon}>🕐</Text>
      </TouchableOpacity>
      
      {Platform.OS === 'web' && renderWebTimePicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: THEME.spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.xs,
  },
  timeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    backgroundColor: THEME.colors.background,
  },
  timeButtonText: {
    fontSize: 16,
    color: THEME.colors.text,
  },
  timeButtonIcon: {
    fontSize: 18,
  },
  webPickerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  webPickerContent: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.lg,
    maxWidth: 400,
    width: '90%',
    maxHeight: '80%',
  },
  webPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.colors.text,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.xs,
    marginBottom: THEME.spacing.md,
  },
  timeOption: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.sm,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    minWidth: 70,
    alignItems: 'center',
  },
  timeOptionSelected: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  timeOptionText: {
    fontSize: 14,
    color: THEME.colors.text,
  },
  timeOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  webPickerClose: {
    backgroundColor: THEME.colors.textSecondary,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  webPickerCloseText: {
    color: 'white',
    fontWeight: '600',
  },
}); 