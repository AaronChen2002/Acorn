import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { TimePicker } from '../components/TimePicker';
import { CategoryDropdown } from '../components/CategoryDropdown';
import { useAppStore } from '../stores/appStore';
import { generateId } from '../stores/appStore';
import { databaseService } from '../utils/database';
import { THEME, ACTIVITY_CATEGORIES } from '../constants';

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export const TimeTrackingScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activity, setActivity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [howDidItGo, setHowDidItGo] = useState('');
  const [howDidYouFeel, setHowDidYouFeel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTimeEntry = useAppStore((state) => state.addTimeEntry);

  const handleSubmit = async () => {
    if (!activity.trim()) {
      Alert.alert('Missing Activity', 'Please enter an activity name.');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Missing Category', 'Please select a category.');
      return;
    }

    if (startTime >= endTime) {
      Alert.alert('Invalid Time', 'End time must be after start time.');
      return;
    }

    setIsSubmitting(true);

    try {
      const timeEntryData = {
        date: selectedDate,
        activity: activity.trim(),
        category: selectedCategory,
        start_time: startTime,
        end_time: endTime,
        howDidItGo: howDidItGo.trim(),
        howDidYouFeel: howDidYouFeel.trim(),
        // Keep tags as empty array for backward compatibility
        tags: [],
      };

      // Add to local state
      addTimeEntry(timeEntryData);

      // Save to database (only on native platforms)
      if (databaseService) {
        try {
          await databaseService.saveTimeEntry({
            ...timeEntryData,
            id: generateId(),
            created_at: new Date(),
          });
        } catch (dbError) {
          console.warn('Database save failed:', dbError);
        }
      }

      Alert.alert(
        'Time Entry Saved!',
        Platform.OS === 'web' 
          ? 'Your time entry has been recorded (stored locally for this session).'
          : 'Your time entry has been recorded.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setActivity('');
              setSelectedCategory('');
              setHowDidItGo('');
              setHowDidYouFeel('');
              // Keep date and times as they might be relevant for next entry
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving time entry:', error);
      Alert.alert(
        'Error',
        'There was a problem saving your time entry. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Track Your Time</Text>
        <Text style={styles.subtitle}>
          Record what you're working on and how it went
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity</Text>
        <TextInput
          style={styles.textInput}
          placeholder="What did you work on?"
          placeholderTextColor={THEME.colors.textSecondary}
          value={activity}
          onChangeText={setActivity}
          maxLength={200}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time</Text>
        <View style={styles.timeRow}>
          <View style={styles.timePickerContainer}>
            <TimePicker
              label="Start"
              value={startTime}
              onTimeChange={setStartTime}
            />
          </View>
          <View style={styles.timePickerContainer}>
            <TimePicker
              label="End"
              value={endTime}
              onTimeChange={setEndTime}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <CategoryDropdown
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How did it go?</Text>
        <TextInput
          style={styles.multilineTextInput}
          multiline
          numberOfLines={3}
          placeholder="Describe how the activity went... Was it productive? Challenging? Smooth? Any obstacles or wins?"
          placeholderTextColor={THEME.colors.textSecondary}
          value={howDidItGo}
          onChangeText={setHowDidItGo}
          maxLength={300}
          textAlignVertical="top"
        />
        <Text style={styles.characterCount}>
          {howDidItGo.length}/300 characters
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How did you feel?</Text>
        <TextInput
          style={styles.multilineTextInput}
          multiline
          numberOfLines={3}
          placeholder="Share how you felt during this activity... Focused? Stressed? Energized? Bored? What was your emotional state?"
          placeholderTextColor={THEME.colors.textSecondary}
          value={howDidYouFeel}
          onChangeText={setHowDidYouFeel}
          maxLength={300}
          textAlignVertical="top"
        />
        <Text style={styles.characterCount}>
          {howDidYouFeel.length}/300 characters
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
          {isSubmitting ? 'Saving...' : 'Save Time Entry'}
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
  textInput: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    fontSize: 16,
    color: THEME.colors.text,
    backgroundColor: THEME.colors.background,
  },
  multilineTextInput: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    fontSize: 16,
    color: THEME.colors.text,
    backgroundColor: THEME.colors.background,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: THEME.spacing.md,
  },
  timePickerContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.xs,
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