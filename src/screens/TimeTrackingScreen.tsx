import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAppStore } from '../stores/appStore';
import { useCalendarStore } from '../stores/calendarStore';
import { CalendarGrid } from '../components/CalendarGrid';
import { ActivityCreationModal } from '../components/ActivityCreationModal';
import { CalendarTimeEntry, TimeSlot, ActivityCreationData, createTimeSlot } from '../types/calendar';
import { THEME } from '../constants';

export const TimeTrackingScreen: React.FC = () => {
  const addTimeEntry = useAppStore((state) => state.addTimeEntry);
  
  const {
    selectedDate,
    timeEntries,
    selection,
    isActivityModalVisible,
    editingEntry,
    setSelectedDate,
    startSelection,
    updateSelection,
    clearSelection,
    addTimeEntry: addCalendarEntry,
    updateTimeEntry,
    deleteTimeEntry,
    openActivityModal,
    openEditModal,
    closeActivityModal,
  } = useCalendarStore();

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);

  // Format today's date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Handle time slot press (single tap)
  const handleTimeSlotPress = (time: Date) => {
    // Create a 15-minute time slot
    const endTime = new Date(time);
    endTime.setMinutes(endTime.getMinutes() + 15);
    
    const timeSlot = createTimeSlot(time, endTime);
    setSelectedTimeSlot(timeSlot);
    clearSelection();
    openActivityModal();
  };

  // Handle time slot drag (drag to select range)
  const handleTimeSlotDrag = (startTime: Date, endTime: Date) => {
    // Update visual selection during drag
    updateSelection(endTime);
  };

  // Handle drag completion (open modal with selected range)
  const handleDragComplete = (startTime: Date, endTime: Date) => {
    // Create time slot from drag selection
    const timeSlot = createTimeSlot(startTime, endTime);
    setSelectedTimeSlot(timeSlot);
    
    // Open activity modal
    openActivityModal();
  };

  // Handle activity save
  const handleActivitySave = async (activityData: ActivityCreationData) => {
    try {
      let timeSlot: TimeSlot;
      
      if (editingEntry) {
        // Updating existing entry
        await updateTimeEntry(editingEntry.id, {
          activity: activityData.activity,
          category: activityData.category,
          moodRating: activityData.moodRating,
          emotionalTags: activityData.emotionalTags,
          reflection: activityData.reflection,
        });
        return;
      }
      
      // Creating new entry
      if (selection && selection.selectedSlots.length > 0) {
        // Use selection if available
        timeSlot = {
          start: selection.startTime,
          end: selection.endTime,
          duration: (selection.endTime.getTime() - selection.startTime.getTime()) / (1000 * 60),
        };
      } else if (selectedTimeSlot) {
        // Use selected time slot
        timeSlot = selectedTimeSlot;
      } else {
        throw new Error('No time slot selected');
      }

      await addCalendarEntry(timeSlot, activityData);
      
      // Clear selection after successful save
      setSelectedTimeSlot(null);
      clearSelection();
      
    } catch (error) {
      console.error('Error saving activity:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to save activity. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle activity delete
  const handleActivityDelete = async () => {
    if (!editingEntry) return;
    
    try {
      await deleteTimeEntry(editingEntry.id);
    } catch (error) {
      console.error('Error deleting activity:', error);
      Alert.alert(
        'Error',
        'Failed to delete activity. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle time entry press (edit existing entry)
  const handleTimeEntryPress = (entry: CalendarTimeEntry) => {
    openEditModal(entry);
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setSelectedTimeSlot(null);
    clearSelection();
    closeActivityModal();
  };

  // Get current time slot for modal
  const getCurrentTimeSlot = (): TimeSlot | null => {
    if (selection && selection.selectedSlots.length > 0) {
      return {
        start: selection.startTime,
        end: selection.endTime,
        duration: (selection.endTime.getTime() - selection.startTime.getTime()) / (1000 * 60),
      };
    }
    return selectedTimeSlot;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Time Tracking</Text>
        <Text style={styles.subtitle}>{formatDate(selectedDate)}</Text>
      </View>

      <View style={styles.calendarContainer}>
        <CalendarGrid
          date={selectedDate}
          timeEntries={timeEntries}
          selection={selection}
          onTimeSlotPress={handleTimeSlotPress}
          onTimeSlotDrag={handleTimeSlotDrag}
          onDragComplete={handleDragComplete}
          onEntryPress={handleTimeEntryPress}
        />
      </View>

      <ActivityCreationModal
        isVisible={isActivityModalVisible}
        selectedTimeSlot={getCurrentTimeSlot()}
        editingEntry={editingEntry}
        onSave={handleActivitySave}
        onCancel={handleModalCancel}
        onDelete={editingEntry ? handleActivityDelete : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    padding: THEME.spacing.lg,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  calendarContainer: {
    flex: 1,
  },
}); 