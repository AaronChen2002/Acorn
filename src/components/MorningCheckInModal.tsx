import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { MoodSlider } from './MoodSlider';
import { EmotionButton } from './EmotionButton';
import { useAppStore } from '../stores/appStore';
import { MorningCheckInData } from '../types';
import { THEME, EMOTIONS } from '../constants';

interface MorningCheckInModalProps {
  isVisible: boolean;
  onComplete: (data: Omit<MorningCheckInData, 'id' | 'completedAt'>) => void;
  onCancel: () => void;
  currentPrompt: string;
}

const { width: screenWidth } = Dimensions.get('window');

// Warm morning color palette
const MORNING_COLORS = {
  sunrise: '#FF8A65', // Warm orange
  sunriseLight: '#FFCCBC', // Light peach
  goldenHour: '#FFB74D', // Golden yellow
  skyBlue: '#81C784', // Soft blue-green
  cloudWhite: '#F8F9FA', // Off-white
  warmGray: '#BCAAA4', // Warm gray
  accent: '#FF7043', // Vibrant coral
};

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
        'Select Your Emotions',
        'Please choose at least one emotion that describes how you feel this morning.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (reflectionResponse.trim().length < 10) {
      Alert.alert(
        'Add Your Reflection',
        'Please share at least a few words about your reflection (minimum 10 characters).',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  };

  const handleComplete = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const checkInData: Omit<MorningCheckInData, 'id' | 'completedAt'> = {
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        energyLevel,
        positivityLevel,
        emotions: selectedEmotions,
        reflectionPrompt: currentPrompt,
        reflectionResponse: reflectionResponse.trim(),
        notes: notes.trim() || undefined,
      };

      // Update store
      completeMorningCheckIn(checkInData);

      // Call parent completion handler
      onComplete(checkInData);

      // Reset form for next time
      setEnergyLevel(5);
      setPositivityLevel(5);
      setSelectedEmotions([]);
      setReflectionResponse('');
      setNotes('');
    } catch (error) {
      console.error('Error completing morning check-in:', error);
      Alert.alert(
        'Error',
        'There was a problem saving your morning check-in. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header with warm gradient feel */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.greeting}>Good morning! 🌅</Text>
                <Text style={styles.subtitle}>Take a moment to check in with yourself</Text>
              </View>
            </View>

            {/* Mood Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How are you feeling?</Text>
              <View style={styles.moodContainer}>
                <MoodSlider
                  label="Energy Level"
                  value={energyLevel}
                  onValueChange={setEnergyLevel}
                />
                <View style={styles.moodSpacing} />
                <MoodSlider
                  label="Positivity Level"
                  value={positivityLevel}
                  onValueChange={setPositivityLevel}
                />
              </View>
            </View>

            {/* Emotions Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                What emotions are present? 
                <Text style={styles.sectionSubtext}> (select all that apply)</Text>
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

            {/* Reflection Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Morning Reflection</Text>
              <View style={styles.promptContainer}>
                <Text style={styles.promptText}>"{currentPrompt}"</Text>
              </View>
              <TextInput
                style={styles.reflectionInput}
                multiline
                numberOfLines={5}
                placeholder="Share your thoughts and feelings about this prompt..."
                placeholderTextColor={MORNING_COLORS.warmGray}
                value={reflectionResponse}
                onChangeText={setReflectionResponse}
                maxLength={1000}
                textAlignVertical="top"
                accessibilityLabel="Reflection response"
                accessibilityHint="Enter your thoughts about the morning reflection prompt"
                accessibilityMultiline={true}
              />
              <Text style={styles.characterCount}>
                {reflectionResponse.length}/1000 characters
              </Text>
            </View>

            {/* Notes Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Additional Notes 
                <Text style={styles.sectionSubtext}> (optional)</Text>
              </Text>
              <TextInput
                style={styles.notesInput}
                multiline
                numberOfLines={3}
                placeholder="Anything else on your mind this morning?"
                placeholderTextColor={MORNING_COLORS.warmGray}
                value={notes}
                onChangeText={setNotes}
                maxLength={500}
                textAlignVertical="top"
                accessibilityLabel="Additional notes"
                accessibilityHint="Optional notes about your morning"
                accessibilityMultiline={true}
              />
              <Text style={styles.characterCount}>
                {notes.length}/500 characters
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Cancel morning check-in"
                accessibilityHint="Dismiss the morning check-in modal"
              >
                <Text style={styles.cancelButtonText}>Maybe Later</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.completeButton,
                  isSubmitting && styles.completeButtonDisabled,
                ]}
                onPress={handleComplete}
                disabled={isSubmitting}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={isSubmitting ? 'Saving morning check-in' : 'Complete morning check-in'}
                accessibilityHint="Save your morning check-in responses"
                accessibilityState={{ disabled: isSubmitting }}
              >
                <Text style={styles.completeButtonText}>
                  {isSubmitting ? 'Saving...' : 'Complete Check-in'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSpacing} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MORNING_COLORS.cloudWhite,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: MORNING_COLORS.sunriseLight,
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: MORNING_COLORS.sunrise,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: THEME.spacing.lg,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: MORNING_COLORS.accent,
    textAlign: 'center',
    marginBottom: THEME.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: MORNING_COLORS.warmGray,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
    letterSpacing: -0.5,
  },
  sectionSubtext: {
    fontSize: 16,
    fontWeight: '400',
    color: MORNING_COLORS.warmGray,
  },
  moodContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: THEME.spacing.lg,
    shadowColor: MORNING_COLORS.sunrise,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  moodSpacing: {
    height: THEME.spacing.lg,
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: THEME.spacing.lg,
    shadowColor: MORNING_COLORS.sunrise,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  promptContainer: {
    backgroundColor: MORNING_COLORS.goldenHour,
    borderRadius: 16,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: MORNING_COLORS.accent,
  },
  promptText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  reflectionInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: THEME.spacing.lg,
    fontSize: 16,
    color: THEME.colors.text,
    textAlignVertical: 'top',
    minHeight: 120,
    borderWidth: 2,
    borderColor: MORNING_COLORS.sunriseLight,
    lineHeight: 22,
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: THEME.spacing.lg,
    fontSize: 16,
    color: THEME.colors.text,
    textAlignVertical: 'top',
    minHeight: 80,
    borderWidth: 2,
    borderColor: MORNING_COLORS.sunriseLight,
    lineHeight: 22,
  },
  characterCount: {
    fontSize: 12,
    color: MORNING_COLORS.warmGray,
    textAlign: 'right',
    marginTop: THEME.spacing.xs,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.lg,
    gap: THEME.spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: MORNING_COLORS.warmGray,
    borderRadius: 16,
    paddingVertical: THEME.spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: MORNING_COLORS.warmGray,
  },
  completeButton: {
    flex: 2,
    backgroundColor: MORNING_COLORS.accent,
    borderRadius: 16,
    paddingVertical: THEME.spacing.md,
    alignItems: 'center',
    shadowColor: MORNING_COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonDisabled: {
    backgroundColor: MORNING_COLORS.warmGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bottomSpacing: {
    height: THEME.spacing.xl,
  },
}); 