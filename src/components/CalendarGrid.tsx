import React, { useState, useRef, useEffect } from 'react';
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
import { useTheme } from '../utils/theme';

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

const SLOT_HEIGHT = 15; // Height of each 15-minute slot (reduced to match week view zoom level)
const HOUR_SLOTS = 4; // Number of 15-minute slots per hour
const TIME_LABEL_WIDTH = 60; // Reduced from 80 to match week view
const GRID_START_HOUR = 6;
const GRID_END_HOUR = 24; // Extended to 24:00 (12 AM)

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  date,
  timeEntries,
  selection,
  onTimeSlotPress,
  onTimeSlotDrag,
  onDragComplete,
  onEntryPress,
}) => {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Date | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const hasAutoScrolled = useRef(false);
  const currentDate = useRef(date.toDateString());

  const timeSlots = generateTimeSlots(date, GRID_START_HOUR, GRID_END_HOUR, 15);

  // Auto-scroll to current time when viewing today - only on initial load or date change
  useEffect(() => {
    const today = new Date();
    const dateString = date.toDateString();
    const isToday = dateString === today.toDateString();
    const dateChanged = currentDate.current !== dateString;
    
    // Only auto-scroll if:
    // 1. It's today AND we haven't auto-scrolled yet, OR
    // 2. The date actually changed
    if ((isToday && !hasAutoScrolled.current) || dateChanged) {
      currentDate.current = dateString;
      
      if (isToday) {
      const currentY = getYFromTime(today);
      const scrollY = Math.max(0, currentY - 100); // Offset by 100px to show some context above
      
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: scrollY,
          animated: true,
        });
          hasAutoScrolled.current = true;
      }, 500); // Small delay to ensure component is fully rendered
      }
    }
  }, [date]);

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
      hour12: true 
    });
  };

  const formatHour = (hour: number): string => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
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
          {entry.activity || entry.title}
        </Text>
        <Text style={styles.entryTime}>
          {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
        </Text>
      </TouchableOpacity>
    );
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'work': '#1e293b',           // Dark blue (lighter than before)
      'side-work': '#1e3a8a',      // Dark blue
      'social': '#3b82f6',         // Blue
      'self-care': '#60a5fa',      // Light blue
      'other': '#7dd3fc',          // Sky blue (darker than before)
      // Legacy categories for backward compatibility
      'deep-work': '#1e293b',
      'interview': '#1e3a8a',
      'travel': '#3b82f6',
      'reading-emails': '#60a5fa',
      'break': '#7dd3fc',
      'exercise': '#60a5fa',       // Now maps to self-care
      'learning': '#7dd3fc',
      'creative': '#60a5fa',       // Now maps to self-care
      'networking': '#1e3a8a',     // Now maps to side-work
      'hobbies': '#60a5fa',        // Now maps to self-care
    };
    return colors[category] || colors.other;
  };

  const getMoodEmoji = (rating: number): string => {
    const emojis = ['😫', '😔', '😐', '😊', '😄', '🤩'];
    return emojis[rating - 1] || '😐';
  };

  const renderCurrentTimeIndicator = () => {
    const now = new Date();
    const today = new Date();
    
    // Only show if we're viewing today's date
    if (date.toDateString() !== today.toDateString()) {
      return null;
    }
    
    // Calculate position, but clamp it to visible range
    const currentY = getYFromTime(now);
    const minY = 0;
    const maxY = (GRID_END_HOUR - GRID_START_HOUR) * SLOT_HEIGHT * HOUR_SLOTS;
    const clampedY = Math.max(minY, Math.min(currentY, maxY));
    
    // Check if current time is within visible range
    const currentHour = now.getHours();
    const isInVisibleRange = currentHour >= GRID_START_HOUR && currentHour < GRID_END_HOUR;
    
    return (
      <View style={[styles.currentTimeIndicator, { top: clampedY }]}>
        <View style={styles.currentTimeCircle} />
        <View style={styles.currentTimeLine} />
        {!isInVisibleRange && (
          <Text style={styles.currentTimeLabel}>
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
      backgroundColor: theme.colors.background,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    },
    timeLabelContainer: {
      height: SLOT_HEIGHT * HOUR_SLOTS,
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xs,
      paddingTop: 2, // Align with the start of the hour slot (match week view)
    },
    timeLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.textSecondary,
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
      backgroundColor: theme.colors.border,
    },
    quarterHourLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: theme.colors.border,
      opacity: 0.3,
    },
    timeSlot: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: SLOT_HEIGHT,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    timeEntry: {
      position: 'absolute',
      left: theme.spacing.xs,
      right: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      borderLeftWidth: 4,
      padding: theme.spacing.xs,
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
      top: theme.spacing.xs,
      right: theme.spacing.xs,
    },
    currentTimeIndicator: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 3,
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 1000,
    },
    currentTimeCircle: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#ef4444',
      marginLeft: -5,
      shadowColor: '#ef4444',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 3,
      elevation: 5,
    },
    currentTimeLine: {
      flex: 1,
      height: 3,
      backgroundColor: '#ef4444',
      shadowColor: '#ef4444',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 2,
      elevation: 3,
    },
    currentTimeLabel: {
      position: 'absolute',
      top: -20, // Adjust as needed for spacing
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: 10,
      color: '#ef4444',
      backgroundColor: `${theme.colors.background}E6`,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    selectionOverlay: {
      position: 'absolute',
      left: theme.spacing.xs,
      right: theme.spacing.xs,
      backgroundColor: `${theme.colors.primary}25`,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
    },
    selectionOverlayText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
      backgroundColor: `${theme.colors.background}E6`,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    dragOverlay: {
      position: 'absolute',
      left: theme.spacing.xs,
      right: theme.spacing.xs,
      backgroundColor: `${theme.colors.primary}40`,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
  });

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
                      backgroundColor: isCurrentTime(slot.start) ? `${theme.colors.primary}10` : 'transparent',
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

// Styles moved inside component to use theme hook 