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
import { LinearGradient } from 'expo-linear-gradient';
import { MoodSlider } from './MoodSlider';
import { EmotionButton } from './EmotionButton';
import { useAppStore } from '../stores/appStore';
import { MorningCheckInData } from '../types';
import { EMOTIONS } from '../constants';
import { useTheme } from '../utils/theme';

interface MorningCheckInModalProps {
  isVisible: boolean;
  onComplete: (data: Omit<MorningCheckInData, 'id' | 'completedAt'>) => void;
  onCancel: () => void;
  currentPrompt: string;
}

const { width: screenWidth } = Dimensions.get('window');

export const MorningCheckInModal: React.FC<MorningCheckInModalProps> = ({
  isVisible,
  onComplete,
  onCancel,
  currentPrompt,
}) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [positivityLevel, setPositivityLevel] = useState(3);
  const [focusLevel, setFocusLevel] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [yesterdayCompletion, setYesterdayCompletion] = useState(3);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [reflectionResponse, setReflectionResponse] = useState('');
  const [mainGoal, setMainGoal] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 9;

  const completeMorningCheckIn = useAppStore((state) => state.completeMorningCheckIn);

  const toggleEmotion = (emotionKey: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotionKey)
        ? prev.filter((e) => e !== emotionKey)
        : [...prev, emotionKey]
    );
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 5: // Emotions step
        if (selectedEmotions.length === 0) {
          Alert.alert(
            'Select Your Emotions',
            'Please choose at least one emotion that describes how you feel this morning.',
            [{ text: 'OK' }]
          );
          return false;
        }
        break;
      case 6: // Main goal step
        if (mainGoal.trim().length === 0) {
          Alert.alert(
            'Set Your Main Goal',
            'Please share what your main goal or intention is for today.',
            [{ text: 'OK' }]
          );
          return false;
        }
        break;
      case 7: // Reflection step
        if (reflectionResponse.trim().length < 10) {
          Alert.alert(
            'Add Your Reflection',
            'Please share at least a few words about your reflection (minimum 10 characters).',
            [{ text: 'OK' }]
          );
          return false;
        }
        break;
      default:
        return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      const checkInData: Omit<MorningCheckInData, 'id' | 'completedAt'> = {
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        energyLevel,
        positivityLevel,
        focusLevel,
        sleepQuality,
        yesterdayCompletion,
        emotions: selectedEmotions,
        reflectionPrompt: currentPrompt,
        reflectionResponse: reflectionResponse.trim(),
        mainGoal: mainGoal.trim(),
        notes: notes.trim() || undefined,
      };

      // Update store
      completeMorningCheckIn(checkInData);

      // Call parent completion handler
      onComplete(checkInData);

      // Reset form for next time
      setCurrentStep(0);
      setEnergyLevel(3);
      setPositivityLevel(3);
      setFocusLevel(3);
      setSleepQuality(3);
      setYesterdayCompletion(3);
      setSelectedEmotions([]);
      setReflectionResponse('');
      setMainGoal('');
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
    setCurrentStep(0);
    onCancel();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>How did you sleep?</Text>
            <View style={styles.stepContent}>
              <MoodSlider
                label="Sleep Quality"
                value={sleepQuality}
                onValueChange={setSleepQuality}
              />
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Looking back at yesterday...</Text>
            <View style={styles.stepContent}>
              <MoodSlider
                label="Did you complete what you wanted?"
                value={yesterdayCompletion}
                onValueChange={setYesterdayCompletion}
              />
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>How's your energy?</Text>
            <View style={styles.stepContent}>
              <MoodSlider
                label="Energy Level"
                value={energyLevel}
                onValueChange={setEnergyLevel}
              />
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>How positive are you feeling?</Text>
            <View style={styles.stepContent}>
              <MoodSlider
                label="Positivity Level"
                value={positivityLevel}
                onValueChange={setPositivityLevel}
              />
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>How focused do you feel?</Text>
            <View style={styles.stepContent}>
              <MoodSlider
                label="Focus Level"
                value={focusLevel}
                onValueChange={setFocusLevel}
              />
            </View>
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What emotions are present?</Text>
            <Text style={styles.stepSubtitle}>Select all that apply</Text>
            <View style={styles.stepContent}>
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
          </View>
        );
      case 6:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's your main goal for today?</Text>
            <View style={styles.stepContent}>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={3}
                placeholder="What do you want to focus on and accomplish today?"
                placeholderTextColor={theme.colors.textSecondary}
                value={mainGoal}
                onChangeText={setMainGoal}
                maxLength={200}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>
                {mainGoal.length}/200 characters
              </Text>
            </View>
          </View>
        );
      case 7:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Morning Reflection</Text>
            <View style={styles.promptContainer}>
              <Text style={styles.promptText}>"{currentPrompt}"</Text>
            </View>
            <View style={styles.stepContent}>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={5}
                placeholder="Share your thoughts and feelings about this prompt..."
                placeholderTextColor={theme.colors.textSecondary}
                value={reflectionResponse}
                onChangeText={setReflectionResponse}
                maxLength={1000}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>
                {reflectionResponse.length}/1000 characters
              </Text>
            </View>
          </View>
        );
      case 8:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Additional Notes</Text>
            <Text style={styles.stepSubtitle}>Optional - anything else on your mind?</Text>
            <View style={styles.stepContent}>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={3}
                placeholder="Any other thoughts or observations?"
                placeholderTextColor={theme.colors.textSecondary}
                value={notes}
                onChangeText={setNotes}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>
                {notes.length}/500 characters
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    backgroundGradient: {
      flex: 1,
      backgroundColor: '#1e293b',
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
      position: 'relative',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.xl,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
      overflow: 'hidden',
    },
    headerBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#FF6B35',
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerOverlay1: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '60%',
      backgroundColor: '#FF8E53',
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerOverlay2: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '35%',
      backgroundColor: '#FFB347',
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerOverlay3: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '15%',
      backgroundColor: '#FFD700',
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      opacity: 0.8,
    },
    headerContent: {
      alignItems: 'center',
      paddingTop: theme.spacing.lg,
      position: 'relative',
      zIndex: 10,
    },
    headerGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },

    greeting: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    subtitle: {
      fontSize: 18,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      fontWeight: '500',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    section: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      letterSpacing: -0.5,
    },
    sectionSubtext: {
      fontSize: 16,
      fontWeight: '400',
      color: theme.colors.textSecondary,
    },
    moodContainer: {
      backgroundColor: 'rgba(30, 41, 59, 0.8)',
      borderRadius: 16,
      padding: theme.spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    moodSpacing: {
      height: theme.spacing.md,
    },
    emotionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      backgroundColor: 'rgba(30, 41, 59, 0.8)',
      borderRadius: 16,
      padding: theme.spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    promptContainer: {
      backgroundColor: 'rgba(100, 116, 139, 0.15)',
      borderRadius: 16,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderLeftWidth: 4,
      borderLeftColor: '#64748b',
      borderWidth: 1,
      borderColor: 'rgba(100, 116, 139, 0.3)',
    },
    promptText: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 24,
      fontStyle: 'italic',
      fontWeight: '500',
    },
    reflectionInput: {
      backgroundColor: 'rgba(30, 41, 59, 0.8)',
      borderRadius: 16,
      padding: theme.spacing.lg,
      fontSize: 16,
      color: theme.colors.text,
      textAlignVertical: 'top',
      minHeight: 120,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      lineHeight: 22,
    },
    notesInput: {
      backgroundColor: 'rgba(30, 41, 59, 0.8)',
      borderRadius: 16,
      padding: theme.spacing.lg,
      fontSize: 16,
      color: theme.colors.text,
      textAlignVertical: 'top',
      minHeight: 80,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      lineHeight: 22,
    },
    characterCount: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'right',
      marginTop: theme.spacing.xs,
      fontWeight: '500',
    },
    actionContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.colors.textSecondary,
      borderRadius: 16,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    completeButton: {
      flex: 2,
      backgroundColor: '#FF6B35',
      borderRadius: 16,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      shadowColor: '#FF6B35',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    completeButtonDisabled: {
      backgroundColor: theme.colors.textSecondary,
      shadowOpacity: 0,
      elevation: 0,
    },
    completeButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.background,
      letterSpacing: 0.5,
    },
    bottomSpacing: {
      height: theme.spacing.xl,
    },
    // New step-by-step styles
    progressContainer: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.background,
    },
    progressBar: {
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      marginBottom: theme.spacing.sm,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
    },
    progressText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
    },
    stepContainer: {
      flex: 1,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      justifyContent: 'center',
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
      letterSpacing: -0.5,
    },
    stepSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
      fontWeight: '400',
    },
    stepContent: {
      flex: 1,
      justifyContent: 'center',
      maxHeight: 400,
    },
    textInput: {
      backgroundColor: 'rgba(30, 41, 59, 0.8)',
      borderRadius: 16,
      padding: theme.spacing.lg,
      fontSize: 16,
      color: theme.colors.text,
      textAlignVertical: 'top',
      minHeight: 120,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      lineHeight: 22,
    },
    navigationContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    backButton: {
      flex: 1,
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.colors.textSecondary,
      borderRadius: 16,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    nextButton: {
      flex: 2,
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    nextButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.background,
      letterSpacing: 0.5,
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
        <View style={styles.backgroundGradient}>
          <SafeAreaView style={styles.safeArea}>
            {/* Header with warm sunrise gradient */}
            <View style={styles.header}>
              <LinearGradient
                colors={['#FF6B35', '#FF8E53', '#FFB347', '#1e293b']}
                locations={[0, 0.4, 0.7, 1]}
                style={styles.headerGradient}
              />
              <View style={styles.headerContent}>
                <Text style={styles.greeting}>Good morning! 🌅</Text>
                <Text style={styles.subtitle}>Take a moment to check in with yourself</Text>
              </View>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${((currentStep + 1) / totalSteps) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {currentStep + 1} of {totalSteps}
              </Text>
            </View>

            {/* Current Step Content */}
            {renderCurrentStep()}

            {/* Navigation Buttons */}
            <View style={styles.navigationContainer}>
              {currentStep > 0 ? (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handlePrevious}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleCancel}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backButtonText}>Maybe Later</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === totalSteps - 1 
                    ? (isSubmitting ? 'Saving...' : 'Complete') 
                    : 'Next'
                  }
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}; 