import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CheckInScreen } from './src/screens/CheckInScreen';
import { THEME } from './src/constants';

export default function App() {
  return (
    <View style={styles.container}>
      <CheckInScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
}); 