import React from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { CheckInScreen } from './src/screens/CheckInScreen';
import { THEME } from './src/constants';
import { useAppStore } from './src/stores/appStore';

export default function App() {
  const theme = useAppStore((state) => state.theme);

  return (
    <>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={THEME.colors.background} 
      />
      <CheckInScreen />
    </>
  );
}
