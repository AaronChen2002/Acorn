import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ActivityIndicator, 
  Text,
  Animated,
  Dimensions,
} from 'react-native';
import { useAppStore } from './src/stores/appStore';
import { TimeTrackingScreen } from './src/screens/TimeTrackingScreen';
import { TopNavigation } from './src/components/TopNavigation';
import { SideMenu } from './src/components/SideMenu';
import { MorningCheckInModal } from './src/components/MorningCheckInModal';
import { CheckInReviewPanel } from './src/components/CheckInReviewPanel';
import { MorningCheckInData } from './src/types';
import { THEME } from './src/constants';

const { width: screenWidth } = Dimensions.get('window');

// Warm morning colors for loading state
const MORNING_COLORS = {
  sunrise: '#FF8A65',
  sunriseLight: '#FFCCBC',
  goldenHour: '#FFB74D',
  cloudWhite: '#F8F9FA',
  accent: '#FF7043',
};

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [showCheckInReview, setShowCheckInReview] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-screenWidth));

  const {
    shouldShowMorningModal,
    resetMorningCheckIn,
    getCurrentPrompt,
    initializeMorningCheckIn,
    morningCheckIn,
    completeMorningCheckIn,
  } = useAppStore();

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    // Animate fade in when app is initialized
    if (isInitialized && !initError) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [isInitialized, initError, fadeAnim]);

  useEffect(() => {
    // Animate side menu
    Animated.timing(slideAnim, {
      toValue: isSideMenuOpen ? 0 : -screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSideMenuOpen, slideAnim]);

  const initializeApp = async () => {
    try {
      setInitError(null);
      await initializeMorningCheckIn();
      
      // Add a small delay to show the beautiful loading screen
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsInitialized(true);
    } catch (error) {
      console.error('App initialization error:', error);
      setInitError('Failed to initialize app. Please restart the application.');
      setIsInitialized(true);
    }
  };

  const handleMorningCheckInComplete = async (data: Omit<MorningCheckInData, 'id' | 'completedAt'>) => {
    try {
      await completeMorningCheckIn(data);
      // Close the modal - shouldShowMorningModal will automatically return false
    } catch (error) {
      console.error('Error completing morning check-in:', error);
    }
  };

  const handleMorningCheckInCancel = () => {
    resetMorningCheckIn();
  };

  const handleMenuToggle = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
  };

  const handleCloseSideMenu = () => {
    setIsSideMenuOpen(false);
  };

  const handleShowCheckInReview = () => {
    setShowCheckInReview(true);
    setIsSideMenuOpen(false);
  };

  const handleNavigate = (screen: string) => {
    if (screen === 'morning') {
      handleShowCheckInReview();
    }
    // Add other navigation logic here if needed
    setIsSideMenuOpen(false);
  };

  const handleCloseCheckInReview = () => {
    setShowCheckInReview(false);
  };

  // Loading screen
  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={MORNING_COLORS.cloudWhite} />
        <View style={styles.loadingContent}>
          <Animated.View 
            style={[
              styles.loadingIcon,
              { 
                transform: [{ 
                  rotate: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }]
              }
            ]}
          >
            <Text style={styles.loadingEmoji}>🌅</Text>
          </Animated.View>
          <Text style={styles.loadingTitle}>Good morning!</Text>
          <Text style={styles.loadingSubtitle}>Starting your day with intention</Text>
          <ActivityIndicator 
            size="large" 
            color={MORNING_COLORS.accent} 
            style={styles.loadingSpinner}
          />
        </View>
      </View>
    );
  }

  // Error screen
  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={MORNING_COLORS.cloudWhite} />
        <View style={styles.errorContent}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{initError}</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />
      
             <SafeAreaView style={styles.safeArea}>
        <TopNavigation 
          currentScreen="timetracking"
          onScreenChange={handleMenuToggle}
        />
        
        <View style={styles.mainContent}>
          {showCheckInReview && morningCheckIn.data ? (
            <CheckInReviewPanel
              isVisible={showCheckInReview}
              onClose={handleCloseCheckInReview}
              checkInData={morningCheckIn.data}
            />
          ) : (
            <TimeTrackingScreen />
          )}
        </View>
      </SafeAreaView>

      {/* Side Menu Overlay */}
      {isSideMenuOpen && (
        <Animated.View 
          style={[
            styles.sideMenuOverlay,
            { 
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5]
              })
            }
          ]}
        >
          <View style={styles.sideMenuTouchable} onTouchStart={handleCloseSideMenu} />
        </Animated.View>
      )}

      {/* Side Menu */}
             <Animated.View 
        style={[
          styles.sideMenuContainer,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        <SideMenu
          isVisible={isSideMenuOpen}
          onClose={handleCloseSideMenu}
          onNavigate={handleNavigate}
        />
      </Animated.View>

      {/* Morning Check-in Modal */}
      <MorningCheckInModal
        isVisible={shouldShowMorningModal()}
        onComplete={handleMorningCheckInComplete}
        onCancel={handleMorningCheckInCancel}
        currentPrompt={getCurrentPrompt()}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: MORNING_COLORS.cloudWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.xl,
  },
  loadingIcon: {
    marginBottom: THEME.spacing.xl,
  },
  loadingEmoji: {
    fontSize: 64,
    textAlign: 'center',
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: MORNING_COLORS.accent,
    marginBottom: THEME.spacing.sm,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.xl,
    lineHeight: 22,
  },
  loadingSpinner: {
    marginTop: THEME.spacing.lg,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: MORNING_COLORS.cloudWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContent: {
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.xl,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: THEME.spacing.lg,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.colors.error,
    marginBottom: THEME.spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  sideMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 999,
  },
  sideMenuTouchable: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  sideMenuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: screenWidth * 0.8,
    zIndex: 1000,
  },
}); 