import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { CheckInScreen } from './src/screens/CheckInScreen';
import { DailyPromptScreen } from './src/screens/DailyPromptScreen';
import { TimeTrackingScreen } from './src/screens/TimeTrackingScreen';
import { TopNavigation } from './src/components/TopNavigation';
import { THEME } from './src/constants';

type ScreenType = 'checkin' | 'reflection' | 'timetracking';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('checkin');

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

  return (
    <View style={styles.container}>
      <TopNavigation 
        currentScreen={currentScreen} 
        onScreenChange={setCurrentScreen} 
      />
      <View style={styles.content}>
        {renderCurrentScreen()}
      </View>
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