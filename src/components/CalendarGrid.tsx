import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  Platform,
} from 'react-native';
import { CalendarTimeEntry, CalendarSelection, TimeSlot, generateTimeSlots } from '../types/calendar';
import { THEME } from '../constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CalendarGridProps {
  date: Date;
  timeEntries: CalendarTimeEntry[];
  selection: CalendarSelection | null;
  onTimeSlotPress: (time: Date) => void;
  onTimeSlotDrag: (startTime: Date, endTime: Date) => void;
  onDragComplete: (startTime: Date, endTime: Date) => void;
  onEntryPress: (entry: CalendarTimeEntry) => void;
}

const SLOT_HEIGHT = 60; // Height of each 15-minute slot
const HOUR_SLOTS = 4; // Number of 15-minute slots per hour
const TIME_LABEL_WIDTH = 80;
const GRID_START_HOUR = 6;
const GRID_END_HOUR = 23;

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  date,
  timeEntries,
  selection,
  onTimeSlotPress,
  onTimeSlotDrag,
  onDragComplete,
  onEntryPress,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Date | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const timeSlots = generateTimeSlots(date, GRID_START_HOUR, GRID_END_HOUR, 15);

  const getTimeFromY = (y: number): Date => {
    const slotIndex = Math.floor(y / SLOT_HEIGHT);
    const boundedIndex = Math.max(0, Math.min(slotIndex, timeSlots.length - 1));
    return timeSlots[boundedIndex]?.start || new Date();
  };

  const getYFromTime = (time: Date): number => {
    const hour = time.getHours();
    const minute = time.getMinutes();
    const totalMinutes = (hour - GRID_START_HOUR) * 60 + minute;
    return (totalMinutes / 15) * SLOT_HEIGHT;
  };

  // Snap time to nearest 15-minute increment
  const snapToSlot = (time: Date): Date => {
    const snapped = new Date(time);
    const minutes = snapped.getMinutes();
    const snappedMinutes = Math.round(minutes / 15) * 15;
    snapped.setMinutes(snappedMinutes, 0, 0);
    return snapped;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only start drag if we've moved a bit to avoid accidental drags
      return Math.abs(gestureState.dy) > 5;
    },
    
    onPanResponderGrant: (evt) => {
      const { locationY } = evt.nativeEvent;
      const startTime = snapToSlot(getTimeFromY(locationY));
      setDragStart(startTime);
      setDragCurrent(startTime);
      setIsDragging(true);
    },
    
    onPanResponderMove: (evt) => {
      if (!dragStart || !isDragging) return;
      
      const { locationY } = evt.nativeEvent;
      const currentTime = snapToSlot(getTimeFromY(locationY));
      setDragCurrent(currentTime);
      
      // Update visual selection during drag
      onTimeSlotDrag(dragStart, currentTime);
    },
    
    onPanResponderRelease: () => {
      if (dragStart && dragCurrent && isDragging) {
        // Ensure proper start/end ordering
        const startTime = dragStart < dragCurrent ? dragStart : dragCurrent;
        const endTime = dragStart < dragCurrent ? dragCurrent : dragStart;
        
        // Only trigger completion if we actually dragged (at least 15 minutes)
        const timeDiff = Math.abs(endTime.getTime() - startTime.getTime());
        if (timeDiff >= 15 * 60 * 1000) {
          onDragComplete(startTime, endTime);
        }
      }
      
      setIsDragging(false);
      setDragStart(null);
      setDragCurrent(null);
    },
    
    onPanResponderTerminate: () => {
      setIsDragging(false);
      setDragStart(null);
      setDragCurrent(null);
    },
  });

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatHour = (hour: number): string => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const isCurrentTime = (time: Date): boolean => {
    const now = new Date();
    const timeDiff = Math.abs(now.getTime() - time.getTime());
    return timeDiff < 15 * 60 * 1000; // Within 15 minutes
  };

  const isTimeSlotSelected = (time: Date): boolean => {
    // Check if this slot is in the current selection
    if (selection) {
      const slotStart = time.getTime();
      const selectionStart = selection.startTime.getTime();
      const selectionEnd = selection.endTime.getTime();
      
      return slotStart >= Math.min(selectionStart, selectionEnd) && 
             slotStart < Math.max(selectionStart, selectionEnd);
    }
    
    // Check if this slot is in the current drag
    if (isDragging && dragStart && dragCurrent) {
      const slotStart = time.getTime();
      const dragStartTime = dragStart.getTime();
      const dragCurrentTime = dragCurrent.getTime();
      
      return slotStart >= Math.min(dragStartTime, dragCurrentTime) && 
             slotStart < Math.max(dragStartTime, dragCurrentTime);
    }
    
    return false;
  };

  const renderTimeEntry = (entry: CalendarTimeEntry) => {
    const startY = getYFromTime(entry.startTime);
    const endY = getYFromTime(entry.endTime);
    const height = Math.max(endY - startY, SLOT_HEIGHT / 2);
    
    const categoryColor = getCategoryColor(entry.category);
    
    return (
      <TouchableOpacity
        key={entry.id}
        style={[
          styles.timeEntry,
          {
            top: startY,
            height,
            backgroundColor: categoryColor,
            borderLeftColor: categoryColor,
          },
        ]}
        onPress={() => onEntryPress(entry)}
        activeOpacity={0.8}
      >
        <Text style={styles.entryActivity} numberOfLines={1}>
          {entry.activity}
        </Text>
        <Text style={styles.entryTime}>
          {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
        </Text>
        {entry.moodRating && (
          <Text style={styles.entryMood}>
            {getMoodEmoji(entry.moodRating)}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'deep-work': '#6366f1',
      'meetings': '#f59e0b',
      'break': '#10b981',
      'social': '#ec4899',
      'errands': '#8b5cf6',
      'exercise': '#ef4444',
      'learning': '#06b6d4',
      'creative': '#f97316',
      'personal': '#84cc16',
      'other': '#6b7280',
    };
    return colors[category] || colors.other;
  };

  const getMoodEmoji = (rating: number): string => {
    const emojis = ['😫', '😔', '😐', '😊', '😄', '🤩'];
    return emojis[rating - 1] || '😐';
  };

  const renderCurrentTimeIndicator = () => {
    const now = new Date();
    const currentY = getYFromTime(now);
    
    return (
      <View style={[styles.currentTimeIndicator, { top: currentY }]}>
        <View style={styles.currentTimeCircle} />
        <View style={styles.currentTimeLine} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.gridContainer}>
          {/* Time labels */}
          <View style={styles.timeLabels}>
            {Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }, (_, i) => {
              const hour = GRID_START_HOUR + i;
              return (
                <View key={hour} style={styles.timeLabelContainer}>
                  <Text style={styles.timeLabel}>{formatHour(hour)}</Text>
                </View>
              );
            })}
          </View>

          {/* Main grid */}
          <View 
            style={styles.grid}
            {...panResponder.panHandlers}
          >
            {/* Hour lines */}
            {Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.hourLine,
                  { top: i * SLOT_HEIGHT * HOUR_SLOTS },
                ]}
              />
            ))}

            {/* Time slots */}
            {timeSlots.map((slot, index) => {
              const isSelected = isTimeSlotSelected(slot.start);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlot,
                    {
                      top: index * SLOT_HEIGHT,
                      backgroundColor: isCurrentTime(slot.start) ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    },
                  ]}
                  onPress={() => !isDragging && onTimeSlotPress(slot.start)}
                  activeOpacity={isDragging ? 1 : 0.1}
                >
                  {/* 15-minute markers */}
                  {slot.start.getMinutes() !== 0 && (
                    <View style={styles.quarterHourLine} />
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Time entries */}
            {timeEntries.map(renderTimeEntry)}

            {/* Current time indicator */}
            {renderCurrentTimeIndicator()}

            {/* Selection overlay for finalized selections */}
            {selection && selection.selectedSlots.length > 0 && !isDragging && (
              <View
                style={[
                  styles.selectionOverlay,
                  {
                    top: getYFromTime(selection.startTime),
                    height: getYFromTime(selection.endTime) - getYFromTime(selection.startTime),
                  },
                ]}
              >
                <Text style={styles.selectionOverlayText}>
                  {formatTime(selection.startTime)} - {formatTime(selection.endTime)}
                </Text>
              </View>
            )}

            {/* Drag overlay for real-time dragging feedback */}
            {isDragging && dragStart && dragCurrent && (
              <View
                style={[
                  styles.dragOverlay,
                  {
                    top: getYFromTime(dragStart < dragCurrent ? dragStart : dragCurrent),
                    height: Math.abs(getYFromTime(dragCurrent) - getYFromTime(dragStart)),
                  },
                ]}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    minHeight: (GRID_END_HOUR - GRID_START_HOUR) * SLOT_HEIGHT * HOUR_SLOTS,
  },
  gridContainer: {
    flexDirection: 'row',
    minHeight: (GRID_END_HOUR - GRID_START_HOUR) * SLOT_HEIGHT * HOUR_SLOTS,
  },
  timeLabels: {
    width: TIME_LABEL_WIDTH,
    backgroundColor: THEME.colors.surface,
    borderRightWidth: 1,
    borderRightColor: THEME.colors.border,
  },
  timeLabelContainer: {
    height: SLOT_HEIGHT * HOUR_SLOTS,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.xs,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  grid: {
    flex: 1,
    position: 'relative',
  },
  hourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: THEME.colors.border,
  },
  quarterHourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: THEME.colors.border,
    opacity: 0.3,
  },
  timeSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SLOT_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },

  timeEntry: {
    position: 'absolute',
    left: THEME.spacing.xs,
    right: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.sm,
    borderLeftWidth: 4,
    padding: THEME.spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  entryActivity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  entryTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  entryMood: {
    fontSize: 12,
    position: 'absolute',
    top: THEME.spacing.xs,
    right: THEME.spacing.xs,
  },
  currentTimeIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  currentTimeCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginLeft: -4,
  },
  currentTimeLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#ef4444',
  },
  selectionOverlay: {
    position: 'absolute',
    left: THEME.spacing.xs,
    right: THEME.spacing.xs,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.sm,
  },
  selectionOverlayText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.sm,
  },
  dragOverlay: {
    position: 'absolute',
    left: THEME.spacing.xs,
    right: THEME.spacing.xs,
    backgroundColor: 'rgba(66, 165, 245, 0.4)',
    borderWidth: 2,
    borderColor: '#42A5F5',
    borderRadius: THEME.borderRadius.sm,
    shadowColor: '#42A5F5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
}); 