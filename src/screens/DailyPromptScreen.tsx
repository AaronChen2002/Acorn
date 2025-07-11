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
import { TagInput } from '../components/TagInput';
import { useAppStore } from '../stores/appStore';
import { generateId } from '../stores/appStore';
import { databaseService } from '../utils/database';
import { THEME, DAILY_PROMPTS, REFLECTION_TAGS } from '../constants';

export const DailyPromptScreen: React.FC = () => {
  const [response, setResponse] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addReflection = useAppStore((state) => state.addReflection);

  // Get today's prompt (for now, we'll cycle through randomly)
  const todaysPrompt = DAILY_PROMPTS[Math.floor(Math.random() * DAILY_PROMPTS.length)];

  const handleSubmit = async () => {
    if (!response.trim()) {
      Alert.alert('Response Required', 'Please provide a response to the prompt.');
      return;
    }

    setIsSubmitting(true);

    try {
      const reflectionData = {
        date: new Date(),
        type: 'daily_prompt' as const,
        content: response.trim(),
        tags,
      };

      // Add to local state
      addReflection(reflectionData);

      // Save to database (only on native platforms)
      if (databaseService) {
        try {
          await databaseService.saveReflection({
            ...reflectionData,
            id: generateId(),
            created_at: new Date(),
          });
        } catch (dbError) {
          console.warn('Database save failed:', dbError);
        }
      }

      Alert.alert(
        'Reflection Saved!',
        Platform.OS === 'web' 
          ? 'Your daily reflection has been recorded (stored locally for this session).'
          : 'Your daily reflection has been recorded.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setResponse('');
              setTags([]);
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
        <Text style={styles.title}>Daily Reflection</Text>
        <Text style={styles.subtitle}>
          Take a moment to reflect on your day
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Prompt</Text>
        <View style={styles.promptContainer}>
          <Text style={styles.promptText}>{todaysPrompt}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Response</Text>
        <TextInput
          style={styles.responseInput}
          multiline
          numberOfLines={8}
          placeholder="Share your thoughts and reflections..."
          placeholderTextColor={THEME.colors.textSecondary}
          value={response}
          onChangeText={setResponse}
          maxLength={1000}
          textAlignVertical="top"
        />
        <Text style={styles.characterCount}>
          {response.length}/1000 characters
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Tags <Text style={styles.optional}>(optional)</Text>
        </Text>
        <TagInput
          tags={tags}
          suggestions={REFLECTION_TAGS}
          onTagsChange={setTags}
          placeholder="Add tags to categorize this reflection..."
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
    fontSize: 18,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
  },
  promptContainer: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.primary,
  },
  promptText: {
    fontSize: 16,
    color: THEME.colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  responseInput: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    fontSize: 16,
    color: THEME.colors.text,
    backgroundColor: THEME.colors.background,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'right',
    marginTop: THEME.spacing.xs,
  },
  optional: {
    fontSize: 14,
    fontWeight: 'normal',
    color: THEME.colors.textSecondary,
  },
  submitButton: {
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
  submitButtonDisabled: {
    backgroundColor: THEME.colors.textSecondary,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: THEME.spacing.lg,
  },
}); 