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
import { CalendarTimeEntry, CalendarSelection, TimeSlot, generateTimeSlots, getWeekDates, formatTimeSlot } from '../types/calendar';
import { useTheme } from '../utils/theme';

interface CalendarWeekViewProps {
  selectedDate: Date;
  timeEntries: CalendarTimeEntry[];
  selection: CalendarSelection | null;
  onTimeSlotPress: (time: Date) => void;
  onTimeSlotDrag: (startTime: Date, endTime: Date) => void;
  onDragComplete: (startTime: Date, endTime: Date) => void;
  onEntryPress: (entry: CalendarTimeEntry) => void;
  onDatePress: (date: Date) => void;
}

const SLOT_HEIGHT = 20; // Smaller slots for week view (reduced from 40)
const HOUR_SLOTS = 4; // 4 slots per hour (15-minute increments)
const TIME_LABEL_WIDTH = 60;
const GRID_START_HOUR = 6;
const GRID_END_HOUR = 24; // Extended to 24:00 (12 AM)

export const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  selectedDate,
  timeEntries,
  selection,
  onTimeSlotPress,
  onTimeSlotDrag,
  onDragComplete,
  onEntryPress,
  onDatePress,
}) => {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Date | null>(null);
  const [dragDay, setDragDay] = useState<Date | null>(null);
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width);
  const scrollViewRef = useRef<ScrollView>(null);

  const weekDates = getWeekDates(selectedDate);
  const timeSlots = generateTimeSlots(selectedDate, GRID_START_HOUR, GRID_END_HOUR, 15);
  const DAY_COLUMN_WIDTH = (containerWidth - TIME_LABEL_WIDTH) / 7;

  // Auto-scroll to current time when viewing today
  useEffect(() => {
    const today = new Date();
    const isViewingToday = weekDates.some(date => date.toDateString() === today.toDateString());
    
    if (isViewingToday) {
      const currentY = getYFromTime(today);
      const scrollY = Math.max(0, currentY - 100); // Offset by 100px to show some context above
      
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: scrollY,
          animated: true,
        });
      }, 500); // Small delay to ensure component is fully rendered
    }
  }, [selectedDate, weekDates]);

  // Get time entries for a specific date
  const getTimeEntriesForDate = (date: Date): CalendarTimeEntry[] => {
    // Use local date instead of ISO to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    return timeEntries.filter(entry => entry.date === dateKey);
  };

  const getTimeFromY = (y: number): Date => {
    // Adjust Y position to account for visual offset
    const adjustedY = y - (SLOT_HEIGHT / 2); // Offset by half a slot
    const slotIndex = Math.floor(adjustedY / SLOT_HEIGHT);
    const totalMinutes = slotIndex * 15; // 15-minute slots
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    // Create a time object with just the time (no date)
    const time = new Date();
    time.setHours(GRID_START_HOUR + hours, minutes, 0, 0);
    
    return time;
  };

  const getYFromTime = (time: Date): number => {
    const hour = time.getHours();
    const minute = time.getMinutes();
    const totalMinutes = (hour - GRID_START_HOUR) * 60 + minute;
    return (totalMinutes / 15) * SLOT_HEIGHT;
  };

  const getDayFromX = (x: number): Date => {
    const dayIndex = Math.floor(x / DAY_COLUMN_WIDTH);
    const boundedIndex = Math.max(0, Math.min(dayIndex, weekDates.length - 1));
    return weekDates[boundedIndex];
  };

  // Snap time to nearest 15-minute increment
  const snapToSlot = (time: Date, day: Date): Date => {
    const snapped = new Date(day);
    snapped.setHours(time.getHours());
    const minutes = time.getMinutes();
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
      const { locationX, locationY } = evt.nativeEvent;
      const day = getDayFromX(locationX - TIME_LABEL_WIDTH);
      const time = getTimeFromY(locationY);
      const startTime = snapToSlot(time, day);
      
      setDragStart(startTime);
      setDragCurrent(startTime);
      setDragDay(day);
      setIsDragging(true);
    },
    
    onPanResponderMove: (evt) => {
      if (!dragStart || !dragDay || !isDragging) return;
      
      const { locationY } = evt.nativeEvent;
      const time = getTimeFromY(locationY);
      const currentTime = snapToSlot(time, dragDay);
      setDragCurrent(currentTime);
      
      // Update visual selection during drag
      onTimeSlotDrag(dragStart, currentTime);
    },
    
    onPanResponderRelease: () => {
      if (dragStart && dragCurrent && dragDay && isDragging) {
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
      setDragDay(null);
    },
    
    onPanResponderTerminate: () => {
      setIsDragging(false);
      setDragStart(null);
      setDragCurrent(null);
      setDragDay(null);
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

  const formatDayHeader = (date: Date): string => {
    const isToday = date.toDateString() === new Date().toDateString();
    const dayName = date.toLocaleDateString([], { weekday: 'short' });
    const dayNumber = date.getDate();
    
    return `${dayName} ${dayNumber}`;
  };

  const isCurrentTime = (time: Date): boolean => {
    const now = new Date();
    const timeDiff = Math.abs(now.getTime() - time.getTime());
    return timeDiff < 15 * 60 * 1000; // Within 15 minutes
  };

  const isTimeSlotSelected = (time: Date, day: Date): boolean => {
    // Check if this slot is in the current drag
    if (isDragging && dragStart && dragCurrent && dragDay) {
      const slotStart = time.getTime();
      const dragStartTime = dragStart.getTime();
      const dragCurrentTime = dragCurrent.getTime();
      const dayMatches = day.toDateString() === dragDay.toDateString();
      
      return dayMatches && 
             slotStart >= Math.min(dragStartTime, dragCurrentTime) && 
             slotStart < Math.max(dragStartTime, dragCurrentTime);
    }
    
    return false;
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'deep-work': '#6366f1',
      'social': '#ec4899',
      'networking': '#8b5cf6',
      'interview': '#f59e0b',
      'travel': '#06b6d4',
      'reading-emails': '#10b981',
      'break': '#84cc16',
      'exercise': '#ef4444',
      'learning': '#f97316',
      'creative': '#06b6d4',
      'other': '#6b7280',
    };
    return colors[category] || colors.other;
  };

  const getMoodEmoji = (rating: number): string => {
    const emojis = ['😫', '😔', '😐', '😊', '😄', '🤩'];
    return emojis[rating - 1] || '😐';
  };

  const renderTimeEntry = (entry: CalendarTimeEntry, dayIndex: number) => {
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
            left: dayIndex * DAY_COLUMN_WIDTH + 2,
            width: DAY_COLUMN_WIDTH - 4,
            backgroundColor: categoryColor,
            borderLeftColor: categoryColor,
          },
        ]}
        onPress={() => onEntryPress(entry)}
        activeOpacity={0.8}
      >
        <Text style={styles.entryActivity} numberOfLines={1}>
          {entry.isFromCalendar ? '📅 ' : ''}{entry.activity || entry.title}
        </Text>
        <Text style={styles.entryTime} numberOfLines={1}>
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

  const renderCurrentTimeIndicator = () => {
    const now = new Date();
    const currentY = getYFromTime(now);
    const todayIndex = weekDates.findIndex(date => 
      date.toDateString() === now.toDateString()
    );
    
    if (todayIndex === -1) return null;
    
    // Clamp position to visible range
    const minY = 0;
    const maxY = (GRID_END_HOUR - GRID_START_HOUR) * SLOT_HEIGHT * HOUR_SLOTS;
    const clampedY = Math.max(minY, Math.min(currentY, maxY));
    
    // Check if current time is within visible range
    const currentHour = now.getHours();
    const isInVisibleRange = currentHour >= GRID_START_HOUR && currentHour < GRID_END_HOUR;
    
    // Calculate the exact left position for the day column
    // Now relative to gridContainer, so we need to account for time labels
    const dayColumnLeft = TIME_LABEL_WIDTH + todayIndex * DAY_COLUMN_WIDTH;
    
    return (
      <View style={[styles.currentTimeIndicator, { top: clampedY }]}>
        <View style={styles.currentTimeCircle} />
        <View 
          style={[
            styles.currentTimeLine,
            {
              left: dayColumnLeft,
              width: DAY_COLUMN_WIDTH,
            }
          ]} 
        />
        {!isInVisibleRange && (
          <Text style={[
            styles.currentTimeLabel,
            {
              left: dayColumnLeft,
              width: DAY_COLUMN_WIDTH,
            }
          ]}>
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
    dayHeaders: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingVertical: theme.spacing.sm,
    },
    timeHeaderSpacer: {
      width: TIME_LABEL_WIDTH,
    },
    dayHeader: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      marginHorizontal: 2,
    },
    selectedDayHeader: {
      backgroundColor: theme.colors.primary,
    },
    todayHeader: {
      backgroundColor: `${theme.colors.primary}20`,
    },
    dayHeaderText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    selectedDayHeaderText: {
      color: theme.colors.background,
    },
    todayHeaderText: {
      color: theme.colors.primary,
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
      backgroundColor: theme.colors.surface,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    },
    timeLabelContainer: {
      height: SLOT_HEIGHT * HOUR_SLOTS,
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xs,
      paddingTop: 2, // Align with the start of the hour slot
    },
    timeLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    weekGrid: {
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
    dayColumn: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    },
    timeSlot: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: SLOT_HEIGHT,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    quarterHourLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: theme.colors.border,
      opacity: 0.3,
    },
    timeEntry: {
      position: 'absolute',
      borderRadius: theme.borderRadius.xs,
      borderLeftWidth: 3,
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
      fontSize: 11,
      fontWeight: '600',
      color: '#fff',
      marginBottom: 1,
    },
    entryTime: {
      fontSize: 9,
      color: 'rgba(255, 255, 255, 0.9)',
    },
    entryMood: {
      fontSize: 10,
      position: 'absolute',
      top: theme.spacing.xs,
      right: theme.spacing.xs,
    },
    currentTimeIndicator: {
      position: 'absolute',
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
      position: 'absolute',
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
      top: -20,
      textAlign: 'center',
      fontSize: 10,
      color: '#ef4444',
      backgroundColor: `${theme.colors.background}E6`,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      fontWeight: '600',
    },
    dragOverlay: {
      position: 'absolute',
      backgroundColor: 'rgba(66, 165, 245, 0.4)',
      borderWidth: 2,
      borderColor: '#42A5F5',
      borderRadius: theme.borderRadius.sm,
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

  return (
    <View 
      style={styles.container}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
      }}
    >
      {/* Day headers */}
      <View style={styles.dayHeaders}>
        <View style={styles.timeHeaderSpacer} />
        {weekDates.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayHeader,
              date.toDateString() === selectedDate.toDateString() && styles.selectedDayHeader,
              date.toDateString() === new Date().toDateString() && styles.todayHeader,
            ]}
            onPress={() => onDatePress(date)}
          >
            <Text style={[
              styles.dayHeaderText,
              date.toDateString() === selectedDate.toDateString() && styles.selectedDayHeaderText,
              date.toDateString() === new Date().toDateString() && styles.todayHeaderText,
            ]}>
              {formatDayHeader(date)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Scrollable calendar grid */}
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

          {/* Week grid */}
          <View 
            style={styles.weekGrid}
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

            {/* Day columns */}
            {weekDates.map((date, dayIndex) => (
              <View
                key={dayIndex}
                style={[
                  styles.dayColumn,
                  {
                    left: dayIndex * DAY_COLUMN_WIDTH,
                    width: DAY_COLUMN_WIDTH,
                  },
                ]}
              >
                            {/* Time slots for this day */}
            {timeSlots.map((slot, slotIndex) => {
              const slotTime = new Date(date);
              slotTime.setHours(slot.start.getHours(), slot.start.getMinutes(), 0, 0);
              const isSelected = isTimeSlotSelected(slot.start, date);
              
              return (
                <TouchableOpacity
                  key={slotIndex}
                  style={[
                    styles.timeSlot,
                    {
                      top: slotIndex * SLOT_HEIGHT,
                      backgroundColor: isSelected 
                        ? 'rgba(66, 165, 245, 0.3)' 
                        : 'transparent',
                    },
                  ]}
                  onPress={() => !isDragging && onTimeSlotPress(slotTime)}
                  activeOpacity={isDragging ? 1 : 0.1}
                >
                  {/* Quarter hour markers */}
                  {slot.start.getMinutes() !== 0 && (
                    <View style={styles.quarterHourLine} />
                  )}
                </TouchableOpacity>
              );
            })}
              </View>
            ))}

            {/* Time entries */}
            {weekDates.map((date, dayIndex) => {
              const dayEntries = getTimeEntriesForDate(date);
              return dayEntries.map(entry => renderTimeEntry(entry, dayIndex));
            })}

            {/* Drag overlay */}
            {isDragging && dragStart && dragCurrent && dragDay && (
              <View
                style={[
                  styles.dragOverlay,
                  {
                    top: getYFromTime(dragStart < dragCurrent ? dragStart : dragCurrent),
                    height: Math.abs(getYFromTime(dragCurrent) - getYFromTime(dragStart)),
                    left: weekDates.findIndex(d => d.toDateString() === dragDay.toDateString()) * DAY_COLUMN_WIDTH + 2,
                    width: DAY_COLUMN_WIDTH - 4,
                  },
                ]}
              />
            )}
          </View>

          {/* Current time indicator - moved outside weekGrid for proper positioning */}
          {renderCurrentTimeIndicator()}
        </View>
      </ScrollView>
    </View>
  );
}; 