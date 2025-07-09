import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { SideMenuProps } from '../types';
import { THEME } from '../constants';

export const SideMenu: React.FC<SideMenuProps> = ({
  isVisible,
  onClose,
  hasCompletedCheckIn,
  onViewCheckIn,
}) => {
  const handleViewCheckIn = () => {
    onViewCheckIn();
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.menuContainer]}>
              <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>Menu</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.content}>
                  {/* Check-in Access */}
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      !hasCompletedCheckIn && styles.menuItemDisabled,
                    ]}
                    onPress={hasCompletedCheckIn ? handleViewCheckIn : undefined}
                    disabled={!hasCompletedCheckIn}
                  >
                    <View style={styles.menuItemContent}>
                      <Text style={styles.menuItemIcon}>
                        {hasCompletedCheckIn ? '✓' : '○'}
                      </Text>
                      <View style={styles.menuItemTextContainer}>
                        <Text
                          style={[
                            styles.menuItemText,
                            !hasCompletedCheckIn && styles.menuItemTextDisabled,
                          ]}
                        >
                          Today's Check-in
                        </Text>
                        <Text
                          style={[
                            styles.menuItemSubtext,
                            !hasCompletedCheckIn && styles.menuItemTextDisabled,
                          ]}
                        >
                          {hasCompletedCheckIn 
                            ? 'View your morning reflection' 
                            : 'Complete your morning check-in first'
                          }
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Placeholder for future menu items */}
                  <View style={styles.menuItem}>
                    <View style={styles.menuItemContent}>
                      <Text style={styles.menuItemIcon}>📊</Text>
                      <View style={styles.menuItemTextContainer}>
                        <Text style={[styles.menuItemText, styles.menuItemTextDisabled]}>
                          Insights
                        </Text>
                        <Text style={[styles.menuItemSubtext, styles.menuItemTextDisabled]}>
                          Coming soon
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.menuItem}>
                    <View style={styles.menuItemContent}>
                      <Text style={styles.menuItemIcon}>📅</Text>
                      <View style={styles.menuItemTextContainer}>
                        <Text style={[styles.menuItemText, styles.menuItemTextDisabled]}>
                          History
                        </Text>
                        <Text style={[styles.menuItemSubtext, styles.menuItemTextDisabled]}>
                          Coming soon
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.menuItem}>
                    <View style={styles.menuItemContent}>
                      <Text style={styles.menuItemIcon}>⚙️</Text>
                      <View style={styles.menuItemTextContainer}>
                        <Text style={[styles.menuItemText, styles.menuItemTextDisabled]}>
                          Settings
                        </Text>
                        <Text style={[styles.menuItemSubtext, styles.menuItemTextDisabled]}>
                          Coming soon
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Acorn v1.0</Text>
                </View>
              </SafeAreaView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    width: 280,
    height: '100%',
    backgroundColor: THEME.colors.background,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: THEME.colors.textSecondary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingTop: THEME.spacing.md,
  },
  menuItem: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
  },
  menuItemDisabled: {
    opacity: 0.6,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: THEME.spacing.md,
    width: 24,
    textAlign: 'center',
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: 2,
  },
  menuItemTextDisabled: {
    color: THEME.colors.textSecondary,
  },
  menuItemSubtext: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  footer: {
    padding: THEME.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
}); 