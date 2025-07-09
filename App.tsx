import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { CheckInScreen } from './src/screens/CheckInScreen';
import { DailyPromptScreen } from './src/screens/DailyPromptScreen';
import { TimeTrackingScreen } from './src/screens/TimeTrackingScreen';
import { TopNavigation } from './src/components/TopNavigation';
import { MorningCheckInModal } from './src/components/MorningCheckInModal';
import { useAppStore } from './src/stores/appStore';
import { MorningCheckInData } from './src/types';
import { THEME } from './src/constants';

type ScreenType = 'checkin' | 'reflection' | 'timetracking';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('checkin');
  const [isAppReady, setIsAppReady] = useState(false);

  // Morning Check-in state from store
  const morningCheckIn = useAppStore((state) => state.morningCheckIn);
  const shouldShowMorningModal = useAppStore((state) => state.shouldShowMorningModal);
  const getCurrentPrompt = useAppStore((state) => state.getCurrentPrompt);
  const setModalVisibility = useAppStore((state) => state.setModalVisibility);
  const resetMorningCheckIn = useAppStore((state) => state.resetMorningCheckIn);

  // Initialize app and check for morning modal
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if we should show the morning modal
        const shouldShow = shouldShowMorningModal();
        if (shouldShow) {
          setModalVisibility(true);
        }
        
        setIsAppReady(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsAppReady(true);
      }
    };

    initializeApp();
  }, [shouldShowMorningModal, setModalVisibility]);

  // Handle daily reset at midnight
  useEffect(() => {
    const checkForNewDay = () => {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Reset at midnight (00:00) for new day
      if (currentHour === 0) {
        resetMorningCheckIn();
      }
    };

    // Check immediately and then every hour
    checkForNewDay();
    const interval = setInterval(checkForNewDay, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [resetMorningCheckIn]);

  const handleMorningCheckInComplete = (data: Omit<MorningCheckInData, 'id' | 'completedAt'>) => {
    // Morning check-in completed successfully
    console.log('Morning check-in completed:', data);
    // The store is already updated by the modal component
    
    // Hide the modal
    setModalVisibility(false);
  };

  const handleMorningCheckInCancel = () => {
    // User cancelled the morning check-in
    console.log('Morning check-in cancelled');
    
    // Hide the modal
    setModalVisibility(false);
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

  // Don't render anything until app is ready
  if (!isAppReady) {
    return <View style={styles.container} />;
  }

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
}); 