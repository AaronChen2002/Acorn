import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { MorningCheckInData } from '../types';
import { THEME } from '../constants';
import { EmotionButton } from './EmotionButton';

interface CheckInReviewPanelProps {
  isVisible: boolean;
  onClose: () => void;
  checkInData: MorningCheckInData | null;
}

export const CheckInReviewPanel: React.FC<CheckInReviewPanelProps> = ({
  isVisible,
  onClose,
  checkInData,
}) => {
  if (!checkInData) return null;

  const formatDate = (date: string) => {
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return date;
    }
  };

  const formatTime = (date: Date) => {
    try {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Unknown time';
    }
  };

  const getMoodDescription = (level: number) => {
    if (level >= 8) return 'Excellent';
    if (level >= 6) return 'Good';
    if (level >= 4) return 'Okay';
    if (level >= 2) return 'Low';
    return 'Very Low';
  };

  const getMoodColor = (level: number) => {
    if (level >= 8) return '#4CAF50';
    if (level >= 6) return '#8BC34A';
    if (level >= 4) return '#FFC107';
    if (level >= 2) return '#FF9800';
    return '#F44336';
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Morning Check-in Review</Text>
              <Text style={styles.subtitle}>
                {formatDate(checkInData.date)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Close review"
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Completion Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Completed At</Text>
              <View style={styles.completionInfo}>
                <Text style={styles.completionTime}>
                  {formatTime(checkInData.completedAt)}
                </Text>
                <Text style={styles.completionDate}>
                  {formatDate(checkInData.date)}
                </Text>
              </View>
            </View>

            {/* Mood Levels */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mood & Energy</Text>
              <View style={styles.moodContainer}>
                <View style={styles.moodItem}>
                  <Text style={styles.moodLabel}>Energy Level</Text>
                  <View style={styles.moodLevel}>
                    <View
                      style={[
                        styles.moodBar,
                        { backgroundColor: getMoodColor(checkInData.energyLevel) },
                      ]}
                    />
                    <Text style={styles.moodText}>
                      {checkInData.energyLevel}/10 - {getMoodDescription(checkInData.energyLevel)}
                    </Text>
                  </View>
                </View>
                <View style={styles.moodItem}>
                  <Text style={styles.moodLabel}>Positivity Level</Text>
                  <View style={styles.moodLevel}>
                    <View
                      style={[
                        styles.moodBar,
                        { backgroundColor: getMoodColor(checkInData.positivityLevel) },
                      ]}
                    />
                    <Text style={styles.moodText}>
                      {checkInData.positivityLevel}/10 - {getMoodDescription(checkInData.positivityLevel)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Emotions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Emotions</Text>
              <View style={styles.emotionsContainer}>
                {checkInData.emotions.map((emotion, index) => (
                  <View key={index} style={styles.emotionChip}>
                    <Text style={styles.emotionText}>{emotion}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Reflection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reflection</Text>
              <View style={styles.reflectionContainer}>
                <Text style={styles.reflectionPrompt}>
                  "{checkInData.reflectionPrompt}"
                </Text>
                <Text style={styles.reflectionResponse}>
                  {checkInData.reflectionResponse}
                </Text>
              </View>
            </View>

            {/* Notes */}
            {checkInData.notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <View style={styles.notesContainer}>
                  <Text style={styles.notesText}>{checkInData.notes}</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
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
    backgroundColor: THEME.colors.surface,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
  },
  closeButton: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.md,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    padding: THEME.spacing.lg,
  },
  section: {
    marginBottom: THEME.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
  },
  completionInfo: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  completionTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.colors.primary,
    marginBottom: 4,
  },
  completionDate: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
  },
  moodContainer: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
  },
  moodItem: {
    marginBottom: THEME.spacing.md,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.sm,
  },
  moodLevel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodBar: {
    width: 40,
    height: 20,
    borderRadius: 10,
    marginRight: THEME.spacing.md,
  },
  moodText: {
    fontSize: 16,
    color: THEME.colors.text,
  },
  emotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
  },
  emotionChip: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.lg,
    margin: 2,
  },
  emotionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  reflectionContainer: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
  },
  reflectionPrompt: {
    fontSize: 16,
    fontStyle: 'italic',
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.md,
    lineHeight: 24,
  },
  reflectionResponse: {
    fontSize: 16,
    color: THEME.colors.text,
    lineHeight: 24,
  },
  notesContainer: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
  },
  notesText: {
    fontSize: 16,
    color: THEME.colors.text,
    lineHeight: 24,
  },
}); 