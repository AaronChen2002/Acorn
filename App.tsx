import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import { CheckInScreen } from './src/screens/CheckInScreen';
import { DailyPromptScreen } from './src/screens/DailyPromptScreen';
import { TimeTrackingScreen } from './src/screens/TimeTrackingScreen';
import { TopNavigation } from './src/components/TopNavigation';
import { MorningCheckInModal } from './src/components/MorningCheckInModal';
import { useAppStore } from './src/stores/appStore';
import { MorningCheckInData } from './src/types';
import { THEME } from './src/constants';

type ScreenType = 'checkin' | 'reflection' | 'timetracking';

// App initialization states
type AppState = 'loading' | 'ready' | 'error';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('checkin');
  const [appState, setAppState] = useState<AppState>('loading');
  const [initializationError, setInitializationError] = useState<string | null>(null);

  // Morning Check-in state from store
  const morningCheckIn = useAppStore((state) => state.morningCheckIn);
  const getCurrentPrompt = useAppStore((state) => state.getCurrentPrompt);
  const setModalVisibility = useAppStore((state) => state.setModalVisibility);
  const initializeMorningCheckIn = useAppStore((state) => state.initializeMorningCheckIn);
  const checkForNewDay = useAppStore((state) => state.checkForNewDay);
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);

  // Initialize app and handle morning check-in logic
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setAppState('loading');
        setLoading(true);
        setError(null);

        // Simulate network/database initialization delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Initialize morning check-in logic
        const shouldShowModal = await initializeMorningCheckIn();
        
        console.log('App initialized:', {
          shouldShowModal,
          currentTime: new Date().toLocaleString(),
          morningCheckInState: morningCheckIn,
        });

        setAppState('ready');
        setLoading(false);
        setInitializationError(null);

      } catch (error) {
        console.error('Error initializing app:', error);
        setInitializationError(error instanceof Error ? error.message : 'Unknown error occurred');
        setAppState('error');
        setLoading(false);
        setError('Failed to initialize app');
      }
    };

    initializeApp();
  }, []); // Run only on mount

  // Handle periodic checks for new day transitions
  useEffect(() => {
    // Check for new day every 5 minutes
    const checkInterval = setInterval(() => {
      try {
        checkForNewDay();
      } catch (error) {
        console.error('Error checking for new day:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(checkInterval);
  }, [checkForNewDay]);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    // When app comes to foreground, check for new day
    const handleAppStateChange = () => {
      try {
        checkForNewDay();
      } catch (error) {
        console.error('Error handling app state change:', error);
      }
    };

    // Add event listener for app state changes (React Native specific)
    // This is a placeholder - in a real app you'd use AppState from react-native
    // AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      // AppState.removeEventListener('change', handleAppStateChange);
    };
  }, [checkForNewDay]);

  const handleMorningCheckInComplete = (data: Omit<MorningCheckInData, 'id' | 'completedAt'>) => {
    // Morning check-in completed successfully
    console.log('Morning check-in completed:', {
      date: data.date,
      energyLevel: data.energyLevel,
      positivityLevel: data.positivityLevel,
      emotionsCount: data.emotions.length,
      hasReflection: !!data.reflectionResponse,
      hasNotes: !!data.notes,
    });
    
    // Hide the modal
    setModalVisibility(false);
  };

  const handleMorningCheckInCancel = () => {
    // User cancelled the morning check-in
    console.log('Morning check-in cancelled at:', new Date().toLocaleString());
    
    // Show a gentle reminder about the benefits
    Alert.alert(
      'Morning Check-in Skipped',
      'Your morning reflection helps set a positive tone for the day. You can always access it later if you change your mind.',
      [
        { 
          text: 'OK', 
          onPress: () => setModalVisibility(false) 
        }
      ]
    );
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'checkin':
        return <CheckInScreen />;
      case 'reflection':
        return <DailyPromptScreen />;
      case 'timetracking':
        return <TimeTrackingScreen />;
      default:
        return <CheckInScreen />;
    }
  };

  // Loading state
  if (appState === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Initializing Acorn...</Text>
        <Text style={styles.loadingSubtext}>Setting up your morning routine</Text>
      </View>
    );
  }

  // Error state
  if (appState === 'error') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Unable to Start Acorn</Text>
        <Text style={styles.errorMessage}>
          {initializationError || 'An unexpected error occurred'}
        </Text>
        <Text style={styles.errorSubtext}>
          Please try restarting the app. If the problem persists, check your connection.
        </Text>
      </View>
    );
  }

  // Main app interface
  return (
    <View style={styles.container}>
      <TopNavigation 
        currentScreen={currentScreen} 
        onScreenChange={setCurrentScreen} 
      />
      <View style={styles.content}>
        {renderCurrentScreen()}
      </View>
      
      {/* Morning Check-in Modal */}
      <MorningCheckInModal
        isVisible={morningCheckIn.shouldShowModal}
        onComplete={handleMorningCheckInComplete}
        onCancel={handleMorningCheckInCancel}
        currentPrompt={getCurrentPrompt()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.lg,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
    color: THEME.colors.text,
    marginTop: THEME.spacing.lg,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    marginTop: THEME.spacing.sm,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.lg,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.colors.error,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
  errorMessage: {
    fontSize: 16,
    color: THEME.colors.text,
    textAlign: 'center',
    marginBottom: THEME.spacing.sm,
  },
  errorSubtext: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 