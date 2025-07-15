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
import InsightsScreen from './src/screens/InsightsScreen';
import { TopNavigation } from './src/components/TopNavigation';
import { SideMenu } from './src/components/SideMenu';
import { MorningCheckInModal } from './src/components/MorningCheckInModal';
import { CheckInReviewPanel } from './src/components/CheckInReviewPanel';
import { MorningCheckInData } from './src/types';
import { useTheme } from './src/utils/theme';
import { backgroundSyncService } from './src/services/backgroundSyncService';
import { googleAuthService, isGoogleCalendarAvailable } from './src/services/googleAuthService';

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
  const { theme, isDark } = useTheme();
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [showCheckInReview, setShowCheckInReview] = useState(false);
  const [showMorningModalManually, setShowMorningModalManually] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<string>('timetracking');
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
  
  // Subscribe to reactive modal visibility
  const shouldShowModal = useAppStore((state) => {
    // If manually triggered from menu, show it
    if (showMorningModalManually) {
      console.log('Modal shown: Manually triggered from menu');
      return true;
    }
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    const hour = now.getHours();
    
    // Don't show for first-time users (unless manually triggered)
    if (state.isFirstTimeUser) {
      console.log('Modal hidden: First-time user');
      return false;
    }
    
    // Don't show if already completed today (unless manually triggered)
    if (state.morningCheckIn.isCompleted && state.morningCheckIn.data?.date === today) {
      console.log('Modal hidden: Already completed today');
      return false;
    }
    
    // Don't show if it's before 5 AM (unless manually triggered)
    if (hour < 5) {
      console.log('Modal hidden: Before 5 AM');
      return false;
    }
    
    // IMPORTANT: Don't show if manually hidden (e.g., "Maybe Later" was clicked)
    if (!state.morningCheckIn.shouldShowModal) {
      console.log('Modal hidden: Manually hidden (Maybe Later clicked)');
      return false;
    }
    
    // Show if it's a new day and after 5 AM
    const lastDate = state.morningCheckIn.data?.date || null;
    const shouldShow = lastDate !== today;
    console.log('Modal visibility decision:', {
      shouldShow,
      today,
      lastDate,
      isCompleted: state.morningCheckIn.isCompleted,
      isFirstTimeUser: state.isFirstTimeUser,
      hour,
      manuallyTriggered: showMorningModalManually
    });
    return shouldShow;
  });

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
      
      // Initialize Google Calendar integration
      await initializeGoogleCalendarIntegration();
      
      // Add a small delay to show the beautiful loading screen
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsInitialized(true);
    } catch (error) {
      console.error('App initialization error:', error);
      setInitError('Failed to initialize app. Please restart the application.');
      setIsInitialized(true);
    }
  };

  /**
   * Initialize Google Calendar integration on app startup
   */
  const initializeGoogleCalendarIntegration = async () => {
    try {
      console.log('🚀 Checking Google Calendar integration availability...');
      
      // Check if Google Calendar integration is available
      if (!isGoogleCalendarAvailable()) {
        console.log('⚠️ Google Calendar integration not available - missing environment variables');
        console.log('💡 The app will work without Google Calendar integration');
        return;
      }
      
      console.log('✅ Google Calendar integration is available');
      
      // First, check if we're coming back from OAuth redirect
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        
        // Handle OAuth errors first
        if (error) {
          console.error('❌ OAuth error in URL:', error);
          // Clean up URL and continue normal initialization
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          return; // Don't process further OAuth logic
        }
        
        // Only process OAuth callback if we have both code and state
        if (code && state) {
          console.log('🔄 Detected OAuth callback, validating...');
          
          // Check if we have a valid stored code verifier (indicates intentional OAuth flow)
          const hasValidOAuthState = localStorage.getItem('oauth_code_verifier');
          
          if (!hasValidOAuthState) {
            console.warn('⚠️ OAuth callback detected but no valid state found - likely stale callback');
            console.log('🧹 Cleaning up stale OAuth callback and continuing normal initialization');
            
            // Clean up stale callback
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            return; // Continue with normal initialization
          }
          
          // We have a valid OAuth callback, process it
          console.log('✅ Valid OAuth callback detected, processing...');
          
          const result = await googleAuthService.authenticate();
          
          if (result.success) {
            console.log('✅ OAuth callback processed successfully:', result.user?.email);
            
            // Start background sync immediately
            backgroundSyncService.start();
            
            // Perform initial sync with shorter delay
            setTimeout(() => {
              console.log('🔄 Performing initial sync after OAuth...');
              backgroundSyncService.syncNow();
            }, 1000);
            
            // Force a state update to refresh the UI
            setTimeout(() => {
              console.log('🔄 Forcing UI refresh after OAuth...');
              setIsInitialized(false);
              setTimeout(() => setIsInitialized(true), 100);
            }, 500);
            
            return; // Exit early as we've handled the OAuth callback
          } else {
            console.error('❌ OAuth callback failed:', result.error);
            // Clean up failed callback
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }
      }
      
      // Check if user is already authenticated (from stored tokens)
      const isAuthenticated = googleAuthService.isAuthenticated();
      
      if (isAuthenticated) {
        const user = googleAuthService.getCurrentUser();
        console.log('✅ User already authenticated:', user?.email);
        
        // Start background sync if user is authenticated
        backgroundSyncService.start();
        
        // Perform initial sync to catch up with any changes
        setTimeout(() => {
          console.log('🔄 Performing initial sync...');
          backgroundSyncService.syncNow();
        }, 2000); // Slightly shorter delay
      } else {
        console.log('⚠️ User not authenticated, sync will start after authentication');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Google Calendar integration:', error);
    }
  };

  const handleMorningCheckInComplete = async (data: Omit<MorningCheckInData, 'id' | 'completedAt'>) => {
    try {
      console.log('Completing morning check-in...', data);
      await completeMorningCheckIn(data);
      console.log('Morning check-in completed successfully');
      setShowMorningModalManually(false); // Reset manual flag
    } catch (error) {
      console.error('Error completing morning check-in:', error);
    }
  };

  const handleMorningCheckInCancel = () => {
    resetMorningCheckIn();
    setShowMorningModalManually(false); // Reset manual flag
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
      // Show the morning check-in modal directly
      resetMorningCheckIn();
      setShowMorningModalManually(true);
      setCurrentScreen('timetracking'); // Keep current screen as timetracking
    } else if (screen === 'insights') {
      setCurrentScreen('insights');
      setShowCheckInReview(false);
    } else if (screen === 'timetracking') {
      setCurrentScreen('timetracking');
      setShowCheckInReview(false);
    }
    setIsSideMenuOpen(false);
  };

  const handleCloseCheckInReview = () => {
    setShowCheckInReview(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
      paddingHorizontal: theme.spacing.xl,
    },
    loadingIcon: {
      marginBottom: theme.spacing.xl,
    },
    loadingEmoji: {
      fontSize: 64,
      textAlign: 'center',
    },
    loadingTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: MORNING_COLORS.accent,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    loadingSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      lineHeight: 22,
    },
    loadingSpinner: {
      marginTop: theme.spacing.lg,
    },
    errorContainer: {
      flex: 1,
      backgroundColor: MORNING_COLORS.cloudWhite,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContent: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    errorEmoji: {
      fontSize: 48,
      marginBottom: theme.spacing.lg,
    },
    errorTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.error,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    errorMessage: {
      fontSize: 16,
      color: theme.colors.textSecondary,
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
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      
             <SafeAreaView style={styles.safeArea}>
        <TopNavigation 
          currentScreen={currentScreen}
          onScreenChange={handleMenuToggle}
        />
        
        <View style={styles.mainContent}>
          {showCheckInReview && morningCheckIn.data ? (
            <CheckInReviewPanel
              isVisible={showCheckInReview}
              onClose={handleCloseCheckInReview}
              checkInData={morningCheckIn.data}
            />
          ) : currentScreen === 'insights' ? (
            <InsightsScreen />
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
        isVisible={shouldShowModal}
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
    backgroundColor: '#ffffff', // Will be overridden by theme
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
    paddingHorizontal: 32,
  },
  loadingIcon: {
    marginBottom: 32,
  },
  loadingEmoji: {
    fontSize: 64,
    textAlign: 'center',
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: MORNING_COLORS.accent,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  loadingSpinner: {
    marginTop: 24,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: MORNING_COLORS.cloudWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#64748b',
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