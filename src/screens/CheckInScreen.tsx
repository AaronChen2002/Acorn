import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { MoodSlider } from '../components/MoodSlider';
import { EmotionButton } from '../components/EmotionButton';
import { useAppStore } from '../stores/appStore';
import { THEME, EMOTIONS } from '../constants';

// Conditionally import database service only for native platforms
let databaseService: any = null;
if (Platform.OS !== 'web') {
  try {
    databaseService = require('../services/database').databaseService;
  } catch (error) {
    console.log('Database service not available on this platform');
  }
}

export const CheckInScreen: React.FC = () => {
  const [moodEnergy, setMoodEnergy] = useState(5);
  const [moodPositivity, setMoodPositivity] = useState(5);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addCheckIn = useAppStore((state) => state.addCheckIn);

  const toggleEmotion = (emotionKey: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotionKey)
        ? prev.filter((e) => e !== emotionKey)
        : [...prev, emotionKey]
    );
  };

  const handleSubmit = async () => {
    if (selectedEmotions.length === 0) {
      Alert.alert(
        'Please select emotions',
        'Choose at least one emotion that describes how you feel today.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const checkInData = {
        date: new Date(),
        mood_energy: moodEnergy,
        mood_positivity: moodPositivity,
        emotions: selectedEmotions,
        description: description.trim() || undefined,
      };

      // Add to local state
      addCheckIn(checkInData);

      // Save to database (only on native platforms)
      if (databaseService) {
        try {
          await databaseService.saveCheckIn({
            ...checkInData,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            created_at: new Date(),
          });
        } catch (dbError) {
          console.warn('Database save failed:', dbError);
        }
      }

      Alert.alert(
        'Check-in saved!',
        Platform.OS === 'web' 
          ? 'Your emotional check-in has been recorded (stored locally for this session).'
          : 'Your emotional check-in has been recorded.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setMoodEnergy(5);
              setMoodPositivity(5);
              setSelectedEmotions([]);
              setDescription('');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving check-in:', error);
      Alert.alert(
        'Error',
        'There was a problem saving your check-in. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>How are you feeling today?</Text>
        <Text style={styles.subtitle}>
          Take a moment to check in with yourself
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mood Levels</Text>
        <MoodSlider
          label="Energy Level"
          value={moodEnergy}
          onValueChange={setMoodEnergy}
        />
        <MoodSlider
          label="Positivity Level"
          value={moodPositivity}
          onValueChange={setMoodPositivity}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Emotions <Text style={styles.optional}>(select all that apply)</Text>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Notes <Text style={styles.optional}>(optional)</Text>
        </Text>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={4}
          placeholder="Describe how you're feeling... What are you excited about today? Any concerns on your mind? What are your priorities? What's going well or challenging?"
          placeholderTextColor={THEME.colors.textSecondary}
          value={description}
          onChangeText={setDescription}
          maxLength={500}
        />
        <Text style={styles.characterCount}>
          {description.length}/500 characters
        </Text>
      </View>

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
          {isSubmitting ? 'Saving...' : 'Save Check-in'}
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    padding: THEME.spacing.lg,
    paddingTop: THEME.spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.colors.text,
    textAlign: 'center',
    marginBottom: THEME.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
  },
  optional: {
    fontSize: 14,
    fontWeight: '400',
    color: THEME.colors.textSecondary,
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
    justifyContent: 'space-between',
  },
  textInput: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    fontSize: 16,
    color: THEME.colors.text,
    backgroundColor: THEME.colors.surface,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'right',
    marginTop: THEME.spacing.xs,
  },
  submitButton: {
    backgroundColor: THEME.colors.primary,
    margin: THEME.spacing.lg,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: THEME.spacing.xl,
  },
}); 