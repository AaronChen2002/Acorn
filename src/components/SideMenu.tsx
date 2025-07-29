import React, { useState } from 'react';
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
import { useTheme } from '../utils/theme';
import { useAppStore } from '../stores/appStore';
import { DEV_CONFIG, ACTIVITY_CATEGORIES } from '../constants';
import { AuthenticationPanel } from './AuthenticationPanel';

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
  const { theme } = useTheme();
  const morningCheckIn = useAppStore((state) => state.morningCheckIn);
  const testMode = useAppStore((state) => state.testMode);
  const setTestMode = useAppStore((state) => state.setTestMode);

  
  const handleNavigate = (screen: string) => {
    if (screen === 'morning') {
      // For morning ritual, we'll handle it specially to show the modal
      onNavigate('morning');
      onClose();
    } else {
      onNavigate(screen);
      onClose();
    }
  };

  const toggleTestMode = () => {
    setTestMode(!testMode);
  };

  const menuItems = [
    {
      id: 'morning',
      title: 'Morning Ritual',
      subtitle: morningCheckIn.isCompleted ? 'Completed today' : 'Start your day',
      icon: '🌅',
      screen: 'morning',
    },
    {
      id: 'insights',
      title: 'Weekly Insights',
      subtitle: 'Patterns and trends',
      icon: '📊',
      screen: 'insights',
    },
  ];

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
      backgroundColor: theme.colors.background,
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
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerContent: {
      flex: 1,
    },
    appName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    tagline: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    closeButton: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
    },
    closeButtonText: {
      fontSize: 24,
      color: theme.colors.text,
      fontWeight: 'bold',
    },
    quoteSection: {
      padding: theme.spacing.lg,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    quoteText: {
      fontSize: 18,
      fontStyle: 'italic',
      color: theme.colors.primary,
      textAlign: 'center',
      fontWeight: '500',
    },
    navigationSection: {
      paddingTop: theme.spacing.md,
    },
    menuItem: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
    },
    menuItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    iconContainer: {
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: 24,
      marginRight: theme.spacing.md,
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
      color: theme.colors.text,
      marginBottom: 4,
    },
    menuItemSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    statusSection: {
      margin: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    statusTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    statusCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    statusLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    statusValue: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    categoriesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    categoryDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: theme.spacing.xs,
    },
    categoryLabel: {
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: '500',
    },
    devSection: {
      margin: theme.spacing.md,
      marginTop: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: '#FF7043',
    },
    devSectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FF7043',
      marginBottom: theme.spacing.md,
    },
    devMenuItem: {
      padding: theme.spacing.sm,
      backgroundColor: 'rgba(255, 112, 67, 0.1)',
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.sm,
    },
    devMenuText: {
      fontSize: 12,
      color: '#FF7043',
      fontWeight: '500',
    },
    calendarTestSection: {
      margin: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
    },
    footer: {
      padding: theme.spacing.lg,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      marginTop: theme.spacing.xl,
    },
    footerText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

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
                {menuItems.map((item) => {
                  const isMorningRitual = item.id === 'morning';
                  const isCompleted = isMorningRitual && morningCheckIn.isCompleted;
                  
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.menuItem,
                        isMorningRitual && !isCompleted && {
                          borderWidth: 2,
                          borderColor: theme.colors.primary,
                          backgroundColor: theme.colors.primary + '10',
                        }
                      ]}
                      onPress={() => handleNavigate(item.screen)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.menuItemContent}>
                        <View style={[
                          styles.iconContainer,
                          isMorningRitual && !isCompleted && {
                            backgroundColor: theme.colors.primary,
                          }
                        ]}>
                          <Text style={styles.icon}>{item.icon}</Text>
                        </View>
                        <View style={styles.textContainer}>
                          <Text style={styles.menuItemTitle}>{item.title}</Text>
                          <Text style={styles.menuItemSubtitle}>
                            {item.subtitle}
                          </Text>
                        </View>
                        {isMorningRitual && !isCompleted && (
                          <View style={{
                            backgroundColor: theme.colors.primary,
                            borderRadius: 12,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            marginLeft: 8,
                          }}>
                            <Text style={{
                              color: 'white',
                              fontSize: 12,
                              fontWeight: 'bold',
                            }}>
                              NEW
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Category Legend */}
              <View style={styles.statusSection}>
                <Text style={styles.statusTitle}>Calendar Categories</Text>
                <View style={styles.statusCard}>
                  <View style={styles.categoriesGrid}>
                  {ACTIVITY_CATEGORIES.map((category) => (
                      <View key={category.key} style={styles.categoryChip}>
                      <View 
                        style={[
                            styles.categoryDot, 
                          { backgroundColor: category.color }
                        ]} 
                      />
                        <Text style={styles.categoryLabel}>{category.label}</Text>
                    </View>
                  ))}
                  </View>
                </View>
              </View>

              {/* Authentication Panel */}
              <AuthenticationPanel />

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

              {/* Developer Settings */}
              <View style={styles.statusSection}>
                <Text style={styles.statusTitle}>Developer Settings</Text>
                
                {/* Test Mode Toggle */}
                <TouchableOpacity
                  style={styles.statusCard}
                  onPress={toggleTestMode}
                  activeOpacity={0.7}
                >
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>🧪 Test Mode:</Text>
                    <Text style={[styles.statusValue, { color: testMode ? '#10b981' : '#ef4444' }]}>
                      {testMode ? 'ON' : 'OFF'}
                    </Text>
                  </View>
                  <Text style={[styles.statusLabel, { fontSize: 12, marginTop: 4 }]}>
                    {testMode ? 'Using sample data for AI' : 'Using real user data'}
                  </Text>
                </TouchableOpacity>



              </View>





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