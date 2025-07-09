import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { THEME } from '../constants';

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

interface CalendarTimeSlotPickerProps {
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot) => void;
}

export const CalendarTimeSlotPicker: React.FC<CalendarTimeSlotPickerProps> = ({
  selectedSlot,
  onSlotSelect,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generate time slots for demo (15-minute intervals)
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const start = new Date(date);
        start.setHours(hour, minute, 0, 0);
        
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + 15);
        
        // Randomly mark some slots as unavailable for demo
        const available = Math.random() > 0.3;
        
        slots.push({ start, end, available });
      }
    }
    return slots;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysOfWeek = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const timeSlots = generateTimeSlots(selectedDate);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>📅 Calendar Time Slots</Text>
      <Text style={styles.placeholder}>
        (Placeholder - Full calendar integration coming soon)
      </Text>
      
      {/* Date Selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.daysContainer}
        contentContainerStyle={styles.daysContent}
      >
        {getDaysOfWeek().map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              selectedDate.toDateString() === date.toDateString() && styles.dayButtonSelected,
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text
              style={[
                styles.dayText,
                selectedDate.toDateString() === date.toDateString() && styles.dayTextSelected,
              ]}
            >
              {formatDate(date)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Time Slots Grid */}
      <Text style={styles.slotsLabel}>Available Time Slots for {formatDate(selectedDate)}</Text>
      <ScrollView style={styles.slotsContainer} nestedScrollEnabled>
        <View style={styles.slotsGrid}>
          {timeSlots.slice(0, 16).map((slot, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.slotButton,
                !slot.available && styles.slotUnavailable,
                selectedSlot && 
                selectedSlot.start.getTime() === slot.start.getTime() && 
                styles.slotSelected,
              ]}
              onPress={() => slot.available && onSlotSelect(slot)}
              disabled={!slot.available}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.slotText,
                  !slot.available && styles.slotTextUnavailable,
                  selectedSlot && 
                  selectedSlot.start.getTime() === slot.start.getTime() && 
                  styles.slotTextSelected,
                ]}
              >
                {formatTime(slot.start)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {selectedSlot && (
        <View style={styles.selectedSlotInfo}>
          <Text style={styles.selectedSlotText}>
            Selected: {formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}
          </Text>
        </View>
      )}
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
  placeholder: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: THEME.spacing.sm,
  },
  daysContainer: {
    marginBottom: THEME.spacing.md,
  },
  daysContent: {
    paddingRight: THEME.spacing.md,
  },
  dayButton: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    marginRight: THEME.spacing.xs,
    minWidth: 80,
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  dayText: {
    fontSize: 12,
    color: THEME.colors.text,
    fontWeight: '500',
  },
  dayTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  slotsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.sm,
  },
  slotsContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.sm,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.xs,
  },
  slotButton: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.sm,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    minWidth: 60,
    alignItems: 'center',
  },
  slotSelected: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  slotUnavailable: {
    backgroundColor: THEME.colors.border,
    opacity: 0.5,
  },
  slotText: {
    fontSize: 12,
    color: THEME.colors.text,
    fontWeight: '500',
  },
  slotTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  slotTextUnavailable: {
    color: THEME.colors.textSecondary,
  },
  selectedSlotInfo: {
    marginTop: THEME.spacing.sm,
    padding: THEME.spacing.sm,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  selectedSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
}); 