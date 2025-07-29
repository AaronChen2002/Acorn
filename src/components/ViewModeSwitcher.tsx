import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
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
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const buttonRef = useRef<TouchableOpacity>(null);

  const modes = [
    { key: 'week' as ViewMode, label: 'Week' },
    { key: 'day' as ViewMode, label: 'Day' },
  ];

  const currentModeData = modes.find(mode => mode.key === currentMode) || modes[0];

  const handleModeSelect = (mode: ViewMode) => {
    onModeChange(mode);
    setIsDropdownVisible(false);
  };

  const handleButtonPress = () => {
    if (buttonRef.current) {
      buttonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setButtonPosition({ x: pageX, y: pageY, width, height });
        setIsDropdownVisible(true);
      });
    }
  };

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: 0, // Remove margins since parent handles positioning
      marginBottom: 0,
      marginLeft: 0,
    },
    dropdownButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors?.surface || '#ffffff',
      borderWidth: 1,
      borderColor: theme.colors?.border || '#e5e7eb',
      borderRadius: theme.borderRadius?.sm || 4,
      paddingVertical: theme.spacing?.xs || 4,
      paddingHorizontal: theme.spacing?.sm || 8,
      minWidth: 70, // Much smaller width
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    dropdownButtonText: {
      fontSize: 12, // Smaller font size
      fontWeight: '600',
      color: theme.colors?.text || '#374151',
    },
    dropdownIcon: {
      fontSize: 8, // Smaller dropdown icon
      color: theme.colors?.textSecondary || '#6b7280',
      marginLeft: theme.spacing?.xs || 2,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'transparent', // Remove dark overlay
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    dropdownMenu: {
      position: 'absolute',
      backgroundColor: theme.colors?.surface || '#ffffff',
      borderRadius: theme.borderRadius?.sm || 4,
      borderWidth: 1,
      borderColor: theme.colors?.border || '#e5e7eb',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
      minWidth: 70, // Match button width
      top: buttonPosition.y + buttonPosition.height + 4, // Position below button
      left: buttonPosition.x, // Align with button
      zIndex: 1000,
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing?.xs || 4,
      paddingHorizontal: theme.spacing?.sm || 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors?.border || '#f3f4f6',
    },
    dropdownItemLast: {
      borderBottomWidth: 0,
    },
    dropdownItemText: {
      fontSize: 12, // Smaller font size
      color: theme.colors?.text || '#374151',
      marginLeft: theme.spacing?.xs || 4,
    },
    dropdownItemIcon: {
      fontSize: 12, // Smaller icon
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        ref={buttonRef}
        style={styles.dropdownButton}
        onPress={handleButtonPress}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.dropdownButtonText}>{currentModeData.label}</Text>
        </View>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isDropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            {modes
              .filter(mode => mode.key !== currentMode) // Only show alternate options
              .map((mode, index) => (
                <TouchableOpacity
                  key={mode.key}
                  style={[
                    styles.dropdownItem,
                    index === modes.filter(m => m.key !== currentMode).length - 1 && styles.dropdownItemLast,
                  ]}
                  onPress={() => handleModeSelect(mode.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownItemText}>{mode.label}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}; 