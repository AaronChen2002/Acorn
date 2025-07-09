import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { CheckInReviewPanelProps } from '../types';
import { THEME, EMOTIONS } from '../constants';

export const CheckInReviewPanel: React.FC<CheckInReviewPanelProps> = ({
  checkInData,
  onBack,
}) => {
  const getEmotionLabel = (emotionKey: string) => {
    const emotion = EMOTIONS.find(e => e.key === emotionKey);
    return emotion ? `${emotion.emoji} ${emotion.label}` : emotionKey;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMoodBar = (level: number, maxLevel: number = 10) => {
    const filled = Math.floor((level / maxLevel) * 10);
    const empty = 10 - filled;
    
    return (
      <View style={styles.moodBarContainer}>
        <View style={styles.moodBar}>
          {Array.from({ length: filled }, (_, i) => (
            <View key={`filled-${i}`} style={[styles.moodBarSegment, styles.moodBarFilled]} />
          ))}
          {Array.from({ length: empty }, (_, i) => (
            <View key={`empty-${i}`} style={[styles.moodBarSegment, styles.moodBarEmpty]} />
          ))}
        </View>
        <Text style={styles.moodBarLabel}>({level}/{maxLevel})</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backButtonText}>← Back to Time Tracking</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Today's Check-in ✓</Text>
            <Text style={styles.completedTime}>
              Completed at {formatTime(checkInData.completedAt)}
            </Text>
          </View>

          {/* Mood Levels */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mood Levels</Text>
            <View style={styles.moodItem}>
              <Text style={styles.moodLabel}>Energy Level:</Text>
              {renderMoodBar(checkInData.energyLevel)}
            </View>
            <View style={styles.moodItem}>
              <Text style={styles.moodLabel}>Positivity Level:</Text>
              {renderMoodBar(checkInData.positivityLevel)}
            </View>
          </View>

          {/* Emotions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emotions</Text>
            <View style={styles.emotionsContainer}>
              {checkInData.emotions.map((emotionKey, index) => (
                <View key={emotionKey} style={styles.emotionChip}>
                  <Text style={styles.emotionText}>
                    {getEmotionLabel(emotionKey)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Reflection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reflection</Text>
            <View style={styles.promptContainer}>
              <Text style={styles.promptText}>"{checkInData.reflectionPrompt}"</Text>
            </View>
            <View style={styles.responseContainer}>
              <Text style={styles.responseText}>{checkInData.reflectionResponse}</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: THEME.colors.primary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: THEME.spacing.lg,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.sm,
  },
  completedTime: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
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
  moodItem: {
    marginBottom: THEME.spacing.md,
  },
  moodLabel: {
    fontSize: 16,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.sm,
  },
  moodBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodBar: {
    flexDirection: 'row',
    flex: 1,
    height: 8,
    backgroundColor: THEME.colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  moodBarSegment: {
    flex: 1,
    marginHorizontal: 1,
  },
  moodBarFilled: {
    backgroundColor: THEME.colors.primary,
  },
  moodBarEmpty: {
    backgroundColor: THEME.colors.border,
  },
  moodBarLabel: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginLeft: THEME.spacing.sm,
    minWidth: 40,
  },
  emotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
  },
  emotionChip: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  emotionText: {
    fontSize: 14,
    color: THEME.colors.text,
  },
  promptContainer: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.primary,
  },
  promptText: {
    fontSize: 16,
    color: THEME.colors.text,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  responseContainer: {
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  responseText: {
    fontSize: 16,
    color: THEME.colors.text,
    lineHeight: 24,
  },
  notesContainer: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  notesText: {
    fontSize: 16,
    color: THEME.colors.text,
    lineHeight: 24,
  },
}); 