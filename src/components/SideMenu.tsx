import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { THEME } from '../constants';
import { useAppStore } from '../stores/appStore';

interface SideMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const MENU_WIDTH = screenWidth * 0.8; // 80% of screen width

export const SideMenu: React.FC<SideMenuProps> = ({
  isVisible,
  onClose,
  onNavigate,
}) => {
  const morningCheckIn = useAppStore((state) => state.morningCheckIn);
  
  const handleNavigate = (screen: string) => {
    onNavigate(screen);
    onClose();
  };

  const menuItems = [
    {
      id: 'timetracking',
      title: 'Time Tracking',
      subtitle: 'Focus and productivity',
      icon: '⏰',
      screen: 'timetracking',
    },
    {
      id: 'morning',
      title: 'Morning Ritual',
      subtitle: morningCheckIn.isCompleted ? 'Completed today' : 'Pending',
      icon: '🌅',
      screen: 'morning',
    },
  ];

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={styles.menuContainer}>
          <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.scrollView}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <Text style={styles.appName}>Acorn</Text>
                  <Text style={styles.tagline}>Your mindful companion</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  accessibilityLabel="Close menu"
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              {/* Inspirational Quote */}
              <View style={styles.quoteSection}>
                <Text style={styles.quoteText}>"make your world bigger"</Text>
              </View>

              {/* Navigation Items */}
              <View style={styles.navigationSection}>
                {menuItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.menuItem}
                    onPress={() => handleNavigate(item.screen)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemContent}>
                      <View style={styles.iconContainer}>
                        <Text style={styles.icon}>{item.icon}</Text>
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={styles.menuItemTitle}>{item.title}</Text>
                        <Text style={styles.menuItemSubtitle}>
                          {item.subtitle}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Morning Check-in Status */}
              {morningCheckIn.data && (
                <View style={styles.statusSection}>
                  <Text style={styles.statusTitle}>Today's Morning Check-in</Text>
                  <View style={styles.statusCard}>
                    <View style={styles.statusRow}>
                      <Text style={styles.statusLabel}>Energy:</Text>
                      <Text style={styles.statusValue}>
                        {morningCheckIn.data.energyLevel}/10
                      </Text>
                    </View>
                    <View style={styles.statusRow}>
                      <Text style={styles.statusLabel}>Positivity:</Text>
                      <Text style={styles.statusValue}>
                        {morningCheckIn.data.positivityLevel}/10
                      </Text>
                    </View>
                    <View style={styles.statusRow}>
                      <Text style={styles.statusLabel}>Emotions:</Text>
                      <Text style={styles.statusValue}>
                        {morningCheckIn.data.emotions.join(', ')}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Build healthy habits, one day at a time 🌱
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  menuContainer: {
    width: MENU_WIDTH,
    backgroundColor: THEME.colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
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
  headerContent: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.colors.primary,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: THEME.colors.surface,
  },
  closeButtonText: {
    fontSize: 24,
    color: THEME.colors.text,
    fontWeight: 'bold',
  },
  quoteSection: {
    padding: THEME.spacing.lg,
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: THEME.colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  navigationSection: {
    paddingTop: THEME.spacing.md,
  },
  menuItem: {
    marginHorizontal: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surface,
    overflow: 'hidden',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    borderRadius: 24,
    marginRight: THEME.spacing.md,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  statusSection: {
    margin: THEME.spacing.md,
    marginTop: THEME.spacing.lg,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
  },
  statusCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  statusLabel: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.colors.text,
  },
  footer: {
    padding: THEME.spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    marginTop: THEME.spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 