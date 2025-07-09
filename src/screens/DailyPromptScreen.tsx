import React, { useState, useEffect } from 'react';
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
import { TagInput } from '../components/TagInput';
import { useAppStore } from '../stores/appStore';
import { THEME, DAILY_PROMPTS, REFLECTION_TAGS } from '../constants';

interface DailyPromptScreenProps {
  onComplete?: () => void;
}

export const DailyPromptScreen: React.FC<DailyPromptScreenProps> = ({
  onComplete,
}) => {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addReflection = useAppStore((state) => state.addReflection);

  // Set a random prompt on mount
  useEffect(() => {
    const randomPrompt = DAILY_PROMPTS[Math.floor(Math.random() * DAILY_PROMPTS.length)];
    setCurrentPrompt(randomPrompt);
  }, []);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert(
        'Please add your reflection',
        'Take a moment to thoughtfully respond to today\'s prompt.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const reflectionData = {
        date: new Date(),
        type: 'daily_prompt' as const,
        content: content.trim(),
        tags,
      };

      // Add to store
      addReflection(reflectionData);

      // Save to database (if available)
      if (Platform.OS !== 'web') {
        try {
          const { databaseService } = require('../services/database');
          await databaseService.saveReflection({
            ...reflectionData,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            created_at: new Date(),
          });
        } catch (dbError) {
          console.warn('Database save failed:', dbError);
        }
      }

      Alert.alert(
        'Reflection saved!',
        Platform.OS === 'web' 
          ? 'Your daily reflection has been recorded (stored locally for this session).'
          : 'Your daily reflection has been saved.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setContent('');
              setTags([]);
              // Set new random prompt
              const randomPrompt = DAILY_PROMPTS[Math.floor(Math.random() * DAILY_PROMPTS.length)];
              setCurrentPrompt(randomPrompt);
              
              if (onComplete) {
                onComplete();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving reflection:', error);
      Alert.alert(
        'Error',
        'There was a problem saving your reflection. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🤔</Text>
        <Text style={styles.title}>Daily Reflection</Text>
        <Text style={styles.subtitle}>
          Explore your thoughts, feelings, and insights with today's thoughtful prompt
        </Text>
      </View>

      <View style={styles.promptSection}>
        <Text style={styles.promptLabel}>Today's Prompt</Text>
        <View style={styles.promptContainer}>
          <Text style={styles.promptText}>{currentPrompt}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Reflection</Text>
        <Text style={styles.reflectionGuide}>
          Take your time to explore this question deeply. Consider different perspectives and be honest with yourself.
        </Text>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={8}
          placeholder="Write your thoughts and reflections here..."
          placeholderTextColor={THEME.colors.textSecondary}
          value={content}
          onChangeText={setContent}
          maxLength={2000}
          textAlignVertical="top"
        />
        <Text style={styles.characterCount}>
          {content.length}/2000 characters
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Categories <Text style={styles.optional}>(optional)</Text>
        </Text>
        <Text style={styles.tagDescription}>
          Add relevant categories to help track patterns and themes in your reflections over time.
        </Text>
        <TagInput
          tags={tags}
          suggestions={REFLECTION_TAGS}
          onTagsChange={setTags}
          placeholder="Add categories..."
        />
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
          {isSubmitting ? 'Saving...' : 'Save Reflection'}
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
  emoji: {
    fontSize: 48,
    marginBottom: THEME.spacing.sm,
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
    lineHeight: 22,
  },
  promptSection: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
  },
  promptLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.sm,
  },
  promptContainer: {
    backgroundColor: THEME.colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.primary,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
  },
  promptText: {
    fontSize: 16,
    color: THEME.colors.text,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.sm,
  },
  optional: {
    fontSize: 14,
    fontWeight: '400',
    color: THEME.colors.textSecondary,
  },
  reflectionGuide: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.sm,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  textInput: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    fontSize: 16,
    color: THEME.colors.text,
    backgroundColor: THEME.colors.background,
    minHeight: 160,
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: THEME.spacing.xs,
  },
  tagDescription: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.sm,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: THEME.colors.primary,
    marginHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    marginTop: THEME.spacing.md,
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