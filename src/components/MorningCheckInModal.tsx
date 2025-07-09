import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { MorningCheckInModalProps } from '../types';
import { MoodSlider } from './MoodSlider';
import { EmotionButton } from './EmotionButton';
import { THEME, EMOTIONS } from '../constants';

export const MorningCheckInModal: React.FC<MorningCheckInModalProps> = ({
  isVisible,
  onComplete,
  currentPrompt,
}) => {
  const [energyLevel, setEnergyLevel] = useState(5);
  const [positivityLevel, setPositivityLevel] = useState(5);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [reflectionResponse, setReflectionResponse] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleEmotion = (emotionKey: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotionKey)
        ? prev.filter((e) => e !== emotionKey)
        : [...prev, emotionKey]
    );
  };

  const handleComplete = async () => {
    if (selectedEmotions.length === 0) {
      // TODO: Add proper validation feedback
      return;
    }

    if (!reflectionResponse.trim()) {
      // TODO: Add proper validation feedback
      return;
    }

    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      await onComplete({
        date: today,
        energyLevel,
        positivityLevel,
        emotions: selectedEmotions,
        reflectionPrompt: currentPrompt,
        reflectionResponse: reflectionResponse.trim(),
        notes: notes.trim() || undefined,
      });

      // Reset form
      setEnergyLevel(5);
      setPositivityLevel(5);
      setSelectedEmotions([]);
      setReflectionResponse('');
      setNotes('');
    } catch (error) {
      console.error('Error completing morning check-in:', error);
      // TODO: Add proper error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        // Modal cannot be dismissed by user - completion required
      }}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>🌅</Text>
            <Text style={styles.title}>Good Morning!</Text>
            <Text style={styles.subtitle}>
              Take a moment to check in with yourself
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
              Emotions <Text style={styles.required}>*</Text>
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

          {/* Daily Reflection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Reflection</Text>
            <View style={styles.promptContainer}>
              <Text style={styles.promptText}>{currentPrompt}</Text>
            </View>
            <TextInput
              style={styles.reflectionInput}
              multiline
              numberOfLines={6}
              placeholder="Take your time to reflect on this question..."
              placeholderTextColor={THEME.colors.textSecondary}
              value={reflectionResponse}
              onChangeText={setReflectionResponse}
              maxLength={2000}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {reflectionResponse.length}/2000 characters
            </Text>
          </View>

          {/* Optional Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Additional Notes <Text style={styles.optional}>(optional)</Text>
            </Text>
            <TextInput
              style={styles.notesInput}
              multiline
              numberOfLines={3}
              placeholder="Any additional thoughts, priorities, or concerns..."
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

          {/* Complete Button */}
          <TouchableOpacity
            style={[
              styles.completeButton,
              isSubmitting && styles.completeButtonDisabled,
            ]}
            onPress={handleComplete}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.completeButtonText}>
              {isSubmitting ? 'Completing...' : 'Complete Check-in'}
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacing} />
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
  scrollContent: {
    paddingBottom: THEME.spacing.xl,
  },
  header: {
    padding: THEME.spacing.lg,
    alignItems: 'center',
    backgroundColor: '#fff9e6', // Warm morning color
  },
  emoji: {
    fontSize: 48,
    marginBottom: THEME.spacing.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: THEME.colors.text,
    textAlign: 'center',
    marginBottom: THEME.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    padding: THEME.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
  },
  required: {
    color: THEME.colors.error,
    fontSize: 14,
  },
  optional: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: 'normal',
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
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
    minHeight: 120,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    fontSize: 16,
    color: THEME.colors.text,
    backgroundColor: THEME.colors.background,
    minHeight: 80,
  },
  characterCount: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'right',
    marginTop: THEME.spacing.xs,
  },
  completeButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
    margin: THEME.spacing.lg,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completeButtonDisabled: {
    backgroundColor: THEME.colors.textSecondary,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: THEME.spacing.lg,
  },
}); 