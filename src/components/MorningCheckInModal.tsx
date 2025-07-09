import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { MoodSlider } from './MoodSlider';
import { EmotionButton } from './EmotionButton';
import { useAppStore } from '../stores/appStore';
import { generateId } from '../stores/appStore';
import { databaseService } from '../utils/database';
import { MorningCheckInModalProps } from '../types';
import { THEME, EMOTIONS } from '../constants';

export const MorningCheckInModal: React.FC<MorningCheckInModalProps> = ({
  isVisible,
  onComplete,
  onCancel,
  currentPrompt,
}) => {
  const [energyLevel, setEnergyLevel] = useState(5);
  const [positivityLevel, setPositivityLevel] = useState(5);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [reflectionResponse, setReflectionResponse] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeMorningCheckIn = useAppStore((state) => state.completeMorningCheckIn);
  const cycleToNextPrompt = useAppStore((state) => state.cycleToNextPrompt);

  // Reset form when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      setEnergyLevel(5);
      setPositivityLevel(5);
      setSelectedEmotions([]);
      setReflectionResponse('');
      setNotes('');
      setIsSubmitting(false);
    }
  }, [isVisible]);

  const toggleEmotion = (emotionKey: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotionKey)
        ? prev.filter((e) => e !== emotionKey)
        : [...prev, emotionKey]
    );
  };

  const validateForm = (): boolean => {
    if (selectedEmotions.length === 0) {
      Alert.alert(
        'Emotions Required',
        'Please select at least one emotion that describes how you feel this morning.'
      );
      return false;
    }

    if (!reflectionResponse.trim()) {
      Alert.alert(
        'Reflection Required',
        'Please provide a thoughtful response to today\'s reflection prompt. This helps create meaningful insights.'
      );
      return false;
    }

    if (reflectionResponse.trim().length < 10) {
      Alert.alert(
        'Reflection Too Short',
        'Please provide a more detailed reflection (at least 10 characters). Take your time to explore the prompt deeply.'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

      const checkInData = {
        date: todayString,
        energyLevel,
        positivityLevel,
        emotions: selectedEmotions,
        reflectionPrompt: currentPrompt,
        reflectionResponse: reflectionResponse.trim(),
        notes: notes.trim() || undefined,
      };

      // Save to local state
      completeMorningCheckIn(checkInData);

      // Cycle to next prompt for tomorrow
      cycleToNextPrompt();

      // Save to database if available
      if (databaseService) {
        try {
          await databaseService.saveMorningCheckIn({
            ...checkInData,
            id: generateId(),
            completedAt: new Date(),
          });
        } catch (dbError) {
          console.warn('Database save failed:', dbError);
        }
      }

      // Call completion callback
      onComplete(checkInData);

    } catch (error) {
      console.error('Error saving morning check-in:', error);
      Alert.alert(
        'Error',
        'There was a problem saving your morning check-in. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Morning Check-in?',
      'Your morning check-in helps set a positive tone for the day. Are you sure you want to cancel?',
      [
        { text: 'Continue Check-in', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: onCancel },
      ]
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Good morning! ☀️</Text>
            <Text style={styles.subtitle}>
              Let's start your day with a moment of reflection
            </Text>
          </View>

          {/* Mood Levels */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How are you feeling?</Text>
            <MoodSlider
              label="Energy Level"
              value={energyLevel}
              onValueChange={setEnergyLevel}
            />
            <MoodSlider
              label="Positivity Level"
              value={positivityLevel}
              onValueChange={setPositivityLevel}
            />
          </View>

          {/* Emotions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Select your emotions <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.sectionDescription}>
              Choose all that apply to describe your current emotional state
            </Text>
            <View style={styles.emotionsGrid}>
              {EMOTIONS.map((emotion) => (
                <EmotionButton
                  key={emotion.key}
                  emotion={emotion.label}
                  emoji={emotion.emoji}
                  selected={selectedEmotions.includes(emotion.key)}
                  onPress={() => toggleEmotion(emotion.key)}
                />
              ))}
            </View>
          </View>

          {/* Reflection Prompt */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Today's Reflection <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.promptContainer}>
              <Text style={styles.promptText}>{currentPrompt}</Text>
            </View>
            <TextInput
              style={styles.reflectionInput}
              multiline
              numberOfLines={5}
              placeholder="Take your time to explore this question deeply. Consider different perspectives and be honest with yourself..."
              placeholderTextColor={THEME.colors.textSecondary}
              value={reflectionResponse}
              onChangeText={setReflectionResponse}
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {reflectionResponse.length}/1000 characters
            </Text>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Additional Notes <Text style={styles.optional}>(optional)</Text>
            </Text>
            <Text style={styles.sectionDescription}>
              Any other thoughts, goals, or intentions for today?
            </Text>
            <TextInput
              style={styles.notesInput}
              multiline
              numberOfLines={3}
              placeholder="Anything else on your mind as you start your day..."
              placeholderTextColor={THEME.colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {notes.length}/500 characters
            </Text>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Completing...' : 'Complete Check-in'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: THEME.spacing.lg,
    paddingTop: THEME.spacing.xl,
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: THEME.colors.primary,
    textAlign: 'center',
    marginBottom: THEME.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.xs,
  },
  sectionDescription: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.md,
    lineHeight: 20,
  },
  required: {
    color: THEME.colors.error,
    fontSize: 16,
  },
  optional: {
    fontSize: 16,
    fontWeight: 'normal',
    color: THEME.colors.textSecondary,
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
  },
  promptContainer: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.primary,
  },
  promptText: {
    fontSize: 16,
    color: THEME.colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  reflectionInput: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    fontSize: 16,
    color: THEME.colors.text,
    backgroundColor: THEME.colors.background,
    textAlignVertical: 'top',
    minHeight: 120,
    marginBottom: THEME.spacing.xs,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    fontSize: 16,
    color: THEME.colors.text,
    backgroundColor: THEME.colors.background,
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: THEME.spacing.xs,
  },
  characterCount: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'right',
  },
  bottomSpacing: {
    height: THEME.spacing.xl,
  },
  actionBar: {
    flexDirection: 'row',
    padding: THEME.spacing.lg,
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    gap: THEME.spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: THEME.spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: THEME.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: THEME.spacing.md,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: THEME.colors.textSecondary,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 