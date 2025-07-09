import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { ViewMode } from '../types/calendar';
import { useTheme } from '../utils/theme';

interface ViewModeSwitcherProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({
  currentMode,
  onModeChange,
}) => {
  const { theme } = useTheme();

  const modes: { key: ViewMode; label: string; icon: string }[] = [
    { key: 'day', label: 'Day', icon: '📅' },
    { key: 'week', label: 'Week', icon: '📊' },
    { key: 'month', label: 'Month', icon: '🗓️' },
  ];

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.xs,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    modeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      marginHorizontal: theme.spacing.xs,
    },
    activeModeButton: {
      backgroundColor: theme.colors.primary,
    },
    modeIcon: {
      fontSize: 16,
      marginRight: theme.spacing.xs,
    },
    modeLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    activeModeLabel: {
      color: theme.colors.background,
    },
  });

  const renderModeButton = (mode: { key: ViewMode; label: string; icon: string }) => {
    const isActive = currentMode === mode.key;
    
    return (
      <TouchableOpacity
        key={mode.key}
        style={[
          styles.modeButton,
          isActive && styles.activeModeButton,
        ]}
        onPress={() => onModeChange(mode.key)}
        activeOpacity={0.7}
      >
        <Text style={styles.modeIcon}>{mode.icon}</Text>
        <Text style={[
          styles.modeLabel,
          isActive && styles.activeModeLabel,
        ]}>
          {mode.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {modes.map(renderModeButton)}
    </View>
  );
}; 