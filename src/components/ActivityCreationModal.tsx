import React, { useState, useEffect, useCallback } from 'react';
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
import { TagInput } from './TagInput';
import { CalendarTimeEntry, TimeSlot, ActivityCreationData, EMOTIONAL_TAGS, MOOD_RATINGS, formatTimeSlot } from '../types/calendar';
import { useTheme } from '../utils/theme';
import { aiService, ActivityCategory } from '../services/aiService';
import { useAppStore } from '../stores/appStore';

const { width: screenWidth } = Dimensions.get('window');

interface ActivityCreationModalProps {
  isVisible: boolean;
  selectedTimeSlot: TimeSlot | null;
  editingEntry: CalendarTimeEntry | null;
  onSave: (data: ActivityCreationData) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const ActivityCreationModal: React.FC<ActivityCreationModalProps> = ({
  isVisible,
  selectedTimeSlot,
  editingEntry,
  onSave,
  onCancel,
  onDelete,
}) => {
  const { theme } = useTheme();
  const testMode = useAppStore((state) => state.testMode);
  const [activity, setActivity] = useState('');
  const [moodRating, setMoodRating] = useState<number | undefined>(undefined);
  const [selectedEmotionalTags, setSelectedEmotionalTags] = useState<string[]>([]);
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI Categorization state (background only)
  const [aiCategory, setAiCategory] = useState<ActivityCategory>('General');
  const [categorizationTimeout, setCategorizationTimeout] = useState<NodeJS.Timeout | null>(null);

  const isEditing = !!editingEntry;

  // Initialize form with editing data
  useEffect(() => {
    if (editingEntry) {
      setActivity(editingEntry.activity);
      setMoodRating(editingEntry.moodRating);
      setSelectedEmotionalTags(editingEntry.emotionalTags || []);
      setReflection(editingEntry.reflection || '');
    } else {
      resetForm();
    }
  }, [editingEntry, isVisible]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (categorizationTimeout) {
        clearTimeout(categorizationTimeout);
      }
    };
  }, [categorizationTimeout]);

  const resetForm = () => {
    setActivity('');
    setMoodRating(undefined);
    setSelectedEmotionalTags([]);
    setReflection('');
    setAiCategory('General');
    if (categorizationTimeout) {
      clearTimeout(categorizationTimeout);
      setCategorizationTimeout(null);
    }
  };

  // AI Categorization function (background only)
  const categorizeActivity = useCallback(async (activityText: string) => {
    if (!activityText.trim() || activityText.trim().length < 3) {
      setAiCategory('General');
      return;
    }
    
    try {
      const result = await aiService.categorizeActivity(activityText, reflection, testMode);
      setAiCategory(result.category);
    } catch (error) {
      console.error('Failed to categorize activity:', error);
      setAiCategory('General');
    }
  }, [reflection, testMode]);

  // Debounced activity change handler
  const handleActivityChange = useCallback((text: string) => {
    setActivity(text);
    
    // Clear existing timeout
    if (categorizationTimeout) {
      clearTimeout(categorizationTimeout);
    }
    
    // Set new timeout for AI categorization
    const timeout = setTimeout(() => {
      categorizeActivity(text);
    }, 1000); // Wait 1 second after user stops typing
    
    setCategorizationTimeout(timeout);
  }, [categorizeActivity, categorizationTimeout]);

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
        category: aiCategory.toLowerCase(), // Use AI-categorized result
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    safeArea: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.lg,
    },
    header: {
      marginBottom: theme.spacing.lg,
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    timeSlot: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    optional: {
      fontSize: 14,
      fontWeight: '400',
      color: theme.colors.textSecondary,
    },
    activityInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      textAlignVertical: 'top',
    },
    moodGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    moodButton: {
      flex: 1,
      minWidth: 100,
      alignItems: 'center',
      padding: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
    },
    moodButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    moodEmoji: {
      fontSize: 24,
      marginBottom: theme.spacing.xs,
    },
    moodLabel: {
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: '600',
    },
    moodLabelSelected: {
      color: theme.colors.background,
    },
    tagsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    tagButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surface,
    },
    tagButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    tagEmoji: {
      fontSize: 16,
      marginRight: theme.spacing.xs,
    },
    tagLabel: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '500',
    },
    tagLabelSelected: {
      color: theme.colors.background,
    },
    reflectionInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      textAlignVertical: 'top',
      minHeight: 100,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    deleteButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.error,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      backgroundColor: `${theme.colors.error}20`,
    },
    deleteButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.error,
    },
    saveButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
    },
    saveButtonDisabled: {
      backgroundColor: theme.colors.textSecondary,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.background,
    },
  });

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
                onChangeText={handleActivityChange}
                placeholder="e.g., Team standup, Deep work on project X, Lunch break..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={2}
                maxLength={100}
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
                placeholderTextColor={theme.colors.textSecondary}
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