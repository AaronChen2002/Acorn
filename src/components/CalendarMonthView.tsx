import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { CalendarTimeEntry, getMonthDates, formatMonthYear } from '../types/calendar';
import { useTheme } from '../utils/theme';

const { width: screenWidth } = Dimensions.get('window');

interface CalendarMonthViewProps {
  selectedDate: Date;
  timeEntries: CalendarTimeEntry[];
  onDatePress: (date: Date) => void;
}

const CELL_WIDTH = screenWidth / 7;
const CELL_HEIGHT = 80;

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  selectedDate,
  timeEntries,
  onDatePress,
}) => {
  const { theme } = useTheme();
  const monthDates = getMonthDates(selectedDate);
  const currentMonth = selectedDate.getMonth();
  const today = new Date();

  // Get time entries for a specific date
  const getTimeEntriesForDate = (date: Date): CalendarTimeEntry[] => {
    const dateKey = date.toISOString().split('T')[0];
    return timeEntries.filter(entry => entry.date === dateKey);
  };

  // Get activity density for a date (number of activities)
  const getActivityDensity = (date: Date): number => {
    return getTimeEntriesForDate(date).length;
  };

  // Get dominant category for a date (most common category)
  const getDominantCategory = (date: Date): string | null => {
    const entries = getTimeEntriesForDate(date);
    if (entries.length === 0) return null;

    const categoryCount: Record<string, number> = {};
    entries.forEach(entry => {
      categoryCount[entry.category] = (categoryCount[entry.category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)[0][0];
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

  const renderDayCell = (date: Date, index: number) => {
    const isCurrentMonth = date.getMonth() === currentMonth;
    const isToday = date.toDateString() === today.toDateString();
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const dayEntries = getTimeEntriesForDate(date);
    const activityDensity = getActivityDensity(date);
    const dominantCategory = getDominantCategory(date);

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          !isCurrentMonth && styles.otherMonthCell,
          isToday && styles.todayCell,
          isSelected && styles.selectedCell,
        ]}
        onPress={() => onDatePress(date)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.dayNumber,
          !isCurrentMonth && styles.otherMonthText,
          isToday && styles.todayText,
          isSelected && styles.selectedText,
        ]}>
          {date.getDate()}
        </Text>

        {/* Activity indicators */}
        {activityDensity > 0 && (
          <View style={styles.activityIndicators}>
            {activityDensity <= 3 ? (
              // Show individual dots for few activities
              Array.from({ length: Math.min(activityDensity, 3) }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.activityDot,
                    { backgroundColor: dominantCategory ? getCategoryColor(dominantCategory) : THEME.colors.primary },
                  ]}
                />
              ))
            ) : (
              // Show a single bar for many activities
              <View style={styles.activityBar}>
                <View
                  style={[
                    styles.activityBarFill,
                    { 
                      backgroundColor: dominantCategory ? getCategoryColor(dominantCategory) : THEME.colors.primary,
                      width: `${Math.min(100, (activityDensity / 8) * 100)}%`,
                    },
                  ]}
                />
                <Text style={styles.activityCount}>
                  {activityDensity}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Top activities preview */}
        {dayEntries.length > 0 && (
          <View style={styles.activitiesPreview}>
            {dayEntries.slice(0, 2).map((entry, i) => (
              <Text
                key={i}
                style={[
                  styles.activityPreview,
                  { color: getCategoryColor(entry.category) },
                ]}
                numberOfLines={1}
              >
                {entry.activity}
              </Text>
            ))}
            {dayEntries.length > 2 && (
              <Text style={styles.moreActivities}>
                +{dayEntries.length - 2} more
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderWeekHeader = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <View style={styles.weekHeader}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayHeader}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderWeeks = () => {
    const weeks = [];
    for (let i = 0; i < monthDates.length; i += 7) {
      const week = monthDates.slice(i, i + 7);
      weeks.push(
        <View key={i} style={styles.weekRow}>
          {week.map((date, index) => renderDayCell(date, i + index))}
        </View>
      );
    }
    return weeks;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    weekHeader: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingVertical: theme.spacing.sm,
    },
    weekDayHeader: {
      width: CELL_WIDTH,
      alignItems: 'center',
    },
    weekDayText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    monthGrid: {
      backgroundColor: theme.colors.background,
    },
    weekRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    dayCell: {
      width: CELL_WIDTH,
      height: CELL_HEIGHT,
      padding: theme.spacing.xs,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    otherMonthCell: {
      backgroundColor: `${theme.colors.border}20`,
    },
    todayCell: {
      backgroundColor: `${theme.colors.primary}20`,
    },
    selectedCell: {
      backgroundColor: theme.colors.primary,
    },
    dayNumber: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    otherMonthText: {
      color: theme.colors.textSecondary,
      opacity: 0.5,
    },
    todayText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    selectedText: {
      color: theme.colors.background,
    },
    activityIndicators: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: theme.spacing.xs,
    },
    activityDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 2,
      marginBottom: 2,
    },
    activityBar: {
      width: '100%',
      height: 4,
      backgroundColor: `${theme.colors.primary}30`,
      borderRadius: 2,
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
    },
    activityBarFill: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      borderRadius: 2,
    },
    activityCount: {
      fontSize: 8,
      fontWeight: 'bold',
      color: '#fff',
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 1,
    },
    activitiesPreview: {
      flex: 1,
      justifyContent: 'flex-end',
      width: '100%',
    },
    activityPreview: {
      fontSize: 8,
      fontWeight: '500',
      marginBottom: 1,
    },
    moreActivities: {
      fontSize: 8,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderWeekHeader()}
      <View style={styles.monthGrid}>
        {renderWeeks()}
      </View>
    </ScrollView>
  );
}; 