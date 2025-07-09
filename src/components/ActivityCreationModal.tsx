import React, { useState, useEffect } from 'react';
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
import { CategorySelector } from './CategorySelector';
import { TagInput } from './TagInput';
import { CalendarTimeEntry, TimeSlot, ActivityCreationData, EMOTIONAL_TAGS, MOOD_RATINGS, formatTimeSlot } from '../types/calendar';
import { THEME } from '../constants';

const { width: screenWidth } = Dimensions.get('window');

interface ActivityCreationModalProps {
  isVisible: boolean;
  selectedTimeSlot: TimeSlot | null;
  editingEntry: CalendarTimeEntry | null;
  onSave: (data: ActivityCreationData) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

// Warm colors for the modal
const MODAL_COLORS = {
  primary: '#6366f1',
  primaryLight: '#a5b4fc',
  success: '#10b981',
  warning: '#f59e0b',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
};

export const ActivityCreationModal: React.FC<ActivityCreationModalProps> = ({
  isVisible,
  selectedTimeSlot,
  editingEntry,
  onSave,
  onCancel,
  onDelete,
}) => {
  const [activity, setActivity] = useState('');
  const [category, setCategory] = useState('deep-work');
  const [moodRating, setMoodRating] = useState<number | undefined>(undefined);
  const [selectedEmotionalTags, setSelectedEmotionalTags] = useState<string[]>([]);
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!editingEntry;

  // Initialize form with editing data
  useEffect(() => {
    if (editingEntry) {
      setActivity(editingEntry.activity);
      setCategory(editingEntry.category);
      setMoodRating(editingEntry.moodRating);
      setSelectedEmotionalTags(editingEntry.emotionalTags || []);
      setReflection(editingEntry.reflection || '');
    } else {
      resetForm();
    }
  }, [editingEntry, isVisible]);

  const resetForm = () => {
    setActivity('');
    setCategory('deep-work');
    setMoodRating(undefined);
    setSelectedEmotionalTags([]);
    setReflection('');
  };

  const validateForm = (): boolean => {
    if (activity.trim().length < 2) {
      Alert.alert(
        'Activity Required',
        'Please enter a descriptive activity name (at least 2 characters).',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (!selectedTimeSlot && !editingEntry) {
      Alert.alert(
        'Time Slot Required',
        'Please select a time slot for your activity.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const activityData: ActivityCreationData = {
        activity: activity.trim(),
        category,
        moodRating,
        emotionalTags: selectedEmotionalTags,
        reflection: reflection.trim() || undefined,
      };

      onSave(activityData);
      resetForm();
    } catch (error) {
      console.error('Error saving activity:', error);
      Alert.alert(
        'Error',
        'There was a problem saving your activity. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!isEditing || !onDelete) return;

    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: onDelete 
        },
      ]
    );
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const toggleEmotionalTag = (tagKey: string) => {
    setSelectedEmotionalTags(prev =>
      prev.includes(tagKey)
        ? prev.filter(tag => tag !== tagKey)
        : [...prev, tagKey]
    );
  };

  const getMoodRatingDisplay = (rating: number) => {
    const moodData = MOOD_RATINGS.find(m => m.value === rating);
    return moodData ? `${moodData.emoji} ${moodData.label}` : '';
  };

  const getTimeSlotDisplay = () => {
    if (editingEntry) {
      const startTime = editingEntry.startTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const endTime = editingEntry.endTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      return `${startTime} - ${endTime}`;
    }
    
    if (selectedTimeSlot) {
      return formatTimeSlot(selectedTimeSlot);
    }
    
    return 'No time selected';
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
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {isEditing ? 'Edit Activity' : 'New Activity'}
              </Text>
              <Text style={styles.timeSlot}>
                📅 {getTimeSlotDisplay()}
              </Text>
            </View>

            {/* Activity Name */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What are you working on?</Text>
              <TextInput
                style={styles.activityInput}
                value={activity}
                onChangeText={setActivity}
                placeholder="e.g., Team standup, Deep work on project X, Lunch break..."
                placeholderTextColor={MODAL_COLORS.textSecondary}
                multiline
                numberOfLines={2}
                maxLength={100}
              />
            </View>

            {/* Category Selection */}
            <View style={styles.section}>
              <CategorySelector
                selectedCategory={category}
                onCategorySelect={setCategory}
                label="Activity Category"
              />
            </View>

            {/* Mood Rating */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                How did it go? 
                <Text style={styles.optional}> (optional)</Text>
              </Text>
              <View style={styles.moodGrid}>
                {MOOD_RATINGS.map((mood) => (
                  <TouchableOpacity
                    key={mood.value}
                    style={[
                      styles.moodButton,
                      moodRating === mood.value && styles.moodButtonSelected,
                    ]}
                    onPress={() => setMoodRating(mood.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={[
                      styles.moodLabel,
                      moodRating === mood.value && styles.moodLabelSelected,
                    ]}>
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Emotional Tags */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                How did you feel? 
                <Text style={styles.optional}> (select all that apply)</Text>
              </Text>
              <View style={styles.tagsGrid}>
                {EMOTIONAL_TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag.key}
                    style={[
                      styles.tagButton,
                      selectedEmotionalTags.includes(tag.key) && styles.tagButtonSelected,
                    ]}
                    onPress={() => toggleEmotionalTag(tag.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.tagEmoji}>{tag.emoji}</Text>
                    <Text style={[
                      styles.tagLabel,
                      selectedEmotionalTags.includes(tag.key) && styles.tagLabelSelected,
                    ]}>
                      {tag.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Reflection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Quick reflection 
                <Text style={styles.optional}> (optional)</Text>
              </Text>
              <TextInput
                style={styles.reflectionInput}
                value={reflection}
                onChangeText={setReflection}
                placeholder="Any thoughts about this activity? What went well? What could be improved?"
                placeholderTextColor={MODAL_COLORS.textSecondary}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              {isEditing && onDelete && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}
                  disabled={isSubmitting}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSubmitting}
              >
                <Text style={styles.saveButtonText}>
                  {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODAL_COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
  },
  header: {
    marginBottom: THEME.spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: MODAL_COLORS.text,
    marginBottom: THEME.spacing.xs,
  },
  timeSlot: {
    fontSize: 16,
    color: MODAL_COLORS.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: THEME.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MODAL_COLORS.text,
    marginBottom: THEME.spacing.sm,
  },
  optional: {
    fontSize: 14,
    fontWeight: '400',
    color: MODAL_COLORS.textSecondary,
  },
  activityInput: {
    borderWidth: 1,
    borderColor: MODAL_COLORS.border,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    fontSize: 16,
    color: MODAL_COLORS.text,
    backgroundColor: MODAL_COLORS.background,
    textAlignVertical: 'top',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
  },
  moodButton: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    padding: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: MODAL_COLORS.border,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: MODAL_COLORS.surface,
  },
  moodButtonSelected: {
    backgroundColor: MODAL_COLORS.primary,
    borderColor: MODAL_COLORS.primary,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: THEME.spacing.xs,
  },
  moodLabel: {
    fontSize: 12,
    color: MODAL_COLORS.text,
    fontWeight: '600',
  },
  moodLabelSelected: {
    color: 'white',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: MODAL_COLORS.border,
    borderRadius: THEME.borderRadius.lg,
    backgroundColor: MODAL_COLORS.surface,
  },
  tagButtonSelected: {
    backgroundColor: MODAL_COLORS.primary,
    borderColor: MODAL_COLORS.primary,
  },
  tagEmoji: {
    fontSize: 16,
    marginRight: THEME.spacing.xs,
  },
  tagLabel: {
    fontSize: 14,
    color: MODAL_COLORS.text,
    fontWeight: '500',
  },
  tagLabelSelected: {
    color: 'white',
  },
  reflectionInput: {
    borderWidth: 1,
    borderColor: MODAL_COLORS.border,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    fontSize: 16,
    color: MODAL_COLORS.text,
    backgroundColor: MODAL_COLORS.background,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: THEME.spacing.lg,
    gap: THEME.spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: THEME.spacing.md,
    borderWidth: 1,
    borderColor: MODAL_COLORS.border,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    backgroundColor: MODAL_COLORS.surface,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: MODAL_COLORS.text,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    backgroundColor: '#fef2f2',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  saveButton: {
    flex: 1,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    backgroundColor: MODAL_COLORS.primary,
  },
  saveButtonDisabled: {
    backgroundColor: MODAL_COLORS.textSecondary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
}); 