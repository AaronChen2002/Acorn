import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { ViewMode, formatWeekRange, formatMonthYear } from '../types/calendar';
import { useTheme } from '../utils/theme';

interface CalendarHeaderProps {
  selectedDate: Date;
  viewMode: ViewMode;
  onPreviousPress: () => void;
  onNextPress: () => void;
  onTodayPress: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  selectedDate,
  viewMode,
  onPreviousPress,
  onNextPress,
  onTodayPress,
}) => {
  const { theme } = useTheme();

  const getHeaderTitle = (): string => {
    switch (viewMode) {
      case 'day':
        return selectedDate.toLocaleDateString([], { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric',
          year: 'numeric'
        });
      case 'week':
        return formatWeekRange(selectedDate);
      case 'month':
        return formatMonthYear(selectedDate);
      default:
        return '';
    }
  };

  const getNavigationLabel = (): { prev: string; next: string } => {
    switch (viewMode) {
      case 'day':
        return { prev: 'Previous Day', next: 'Next Day' };
      case 'week':
        return { prev: 'Previous Week', next: 'Next Week' };
      case 'month':
        return { prev: 'Previous Month', next: 'Next Month' };
      default:
        return { prev: 'Previous', next: 'Next' };
    }
  };

  const labels = getNavigationLabel();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    navigationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    navigationButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: `${theme.colors.primary}20`,
    },
    navigationIcon: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
    },
    todayButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.primary,
    },
    todayButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.background,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={onPreviousPress}
          activeOpacity={0.7}
        >
          <Text style={styles.navigationIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{getHeaderTitle()}</Text>
        </View>

        <TouchableOpacity
          style={styles.navigationButton}
          onPress={onNextPress}
          activeOpacity={0.7}
        >
          <Text style={styles.navigationIcon}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.todayButton}
        onPress={onTodayPress}
        activeOpacity={0.7}
      >
        <Text style={styles.todayButtonText}>Today</Text>
      </TouchableOpacity>
    </View>
  );
}; 