import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { ViewMode, formatWeekRange, formatMonthYear } from '../types/calendar';
import { useTheme } from '../utils/theme';
import { ViewModeSwitcher } from './ViewModeSwitcher';

interface CalendarHeaderProps {
  selectedDate: Date;
  viewMode: ViewMode;
  onPreviousPress: () => void;
  onNextPress: () => void;
  onTodayPress: () => void;
  onViewModeChange: (mode: ViewMode) => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  selectedDate,
  viewMode,
  onPreviousPress,
  onNextPress,
  onTodayPress,
  onViewModeChange,
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
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      position: 'relative', // For absolute positioning of view switcher
    },
    titleSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1, // Take up most of the space
      position: 'relative',
    },
    navigationButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: `${theme.colors.primary}20`,
      position: 'absolute',
      zIndex: 1,
    },
    navigationIcon: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    viewSwitcherContainer: {
      position: 'absolute',
      left: theme.spacing.md + 50, // Position after left arrow
      top: '50%',
      transform: [{ translateY: -12 }], // Center vertically
      zIndex: 1,
    },
    titleContainer: {
      alignItems: 'center',
      paddingHorizontal: 60, // Space for arrows on both sides
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
      <View style={styles.titleSection}>
        <TouchableOpacity
          style={[styles.navigationButton, { left: 0 }]}
          onPress={onPreviousPress}
          activeOpacity={0.7}
        >
          <Text style={styles.navigationIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{getHeaderTitle()}</Text>
        </View>

        <TouchableOpacity
          style={[styles.navigationButton, { right: 0 }]}
          onPress={onNextPress}
          activeOpacity={0.7}
        >
          <Text style={styles.navigationIcon}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.viewSwitcherContainer}>
        <ViewModeSwitcher
          currentMode={viewMode}
          onModeChange={onViewModeChange}
        />
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