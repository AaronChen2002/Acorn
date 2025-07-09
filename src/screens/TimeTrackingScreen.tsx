import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAppStore } from '../stores/appStore';
import { useCalendarStore } from '../stores/calendarStore';
import { CalendarGrid } from '../components/CalendarGrid';
import { CalendarWeekView } from '../components/CalendarWeekView';
import { CalendarMonthView } from '../components/CalendarMonthView';
import { ViewModeSwitcher } from '../components/ViewModeSwitcher';
import { CalendarHeader } from '../components/CalendarHeader';
import { ActivityCreationModal } from '../components/ActivityCreationModal';
import { CalendarTimeEntry, TimeSlot, ActivityCreationData, createTimeSlot, ViewMode } from '../types/calendar';
import { useTheme } from '../utils/theme';

export const TimeTrackingScreen: React.FC = () => {
  const addTimeEntry = useAppStore((state) => state.addTimeEntry);
  const { theme, isDark, toggleTheme } = useTheme();
  
  const {
    selectedDate,
    timeEntries,
    selection,
    viewMode,
    isActivityModalVisible,
    editingEntry,
    setSelectedDate,
    setViewMode,
    navigateToDate,
    navigatePrevious,
    navigateNext,
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

  // Handle view mode changes
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // Handle navigation
  const handlePreviousPress = () => {
    navigatePrevious();
  };

  const handleNextPress = () => {
    navigateNext();
  };

  const handleTodayPress = () => {
    navigateToDate(new Date());
  };

  // Handle date selection from different views
  const handleDatePress = (date: Date) => {
    if (viewMode === 'month' || viewMode === 'week') {
      // Switch to day view when selecting a date from month/week view
      setViewMode('day');
    }
    navigateToDate(date);
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

  const renderCalendarView = () => {
    switch (viewMode) {
      case 'day':
        return (
          <CalendarGrid
            date={selectedDate}
            timeEntries={timeEntries}
            selection={selection}
            onTimeSlotPress={handleTimeSlotPress}
            onTimeSlotDrag={handleTimeSlotDrag}
            onDragComplete={handleDragComplete}
            onEntryPress={handleTimeEntryPress}
          />
        );
      case 'week':
        return (
          <CalendarWeekView
            selectedDate={selectedDate}
            timeEntries={timeEntries}
            selection={selection}
            onTimeSlotPress={handleTimeSlotPress}
            onTimeSlotDrag={handleTimeSlotDrag}
            onDragComplete={handleDragComplete}
            onEntryPress={handleTimeEntryPress}
            onDatePress={handleDatePress}
          />
        );
      case 'month':
        return (
          <CalendarMonthView
            selectedDate={selectedDate}
            timeEntries={timeEntries}
            onDatePress={handleDatePress}
          />
        );
      default:
        return null;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    themeToggle: {
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
    },
    themeToggleText: {
      color: theme.colors.background,
      fontSize: 16,
      fontWeight: '600',
    },
    calendarContainer: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Time Tracking</Text>
        <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
          <Text style={styles.themeToggleText}>
            {isDark ? '☀️' : '🌙'}
          </Text>
        </TouchableOpacity>
      </View>

      <ViewModeSwitcher
        currentMode={viewMode}
        onModeChange={handleViewModeChange}
      />

      <CalendarHeader
        selectedDate={selectedDate}
        viewMode={viewMode}
        onPreviousPress={handlePreviousPress}
        onNextPress={handleNextPress}
        onTodayPress={handleTodayPress}
      />

      <View style={styles.calendarContainer}>
        {renderCalendarView()}
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