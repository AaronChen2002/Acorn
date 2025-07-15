import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../utils/theme';
import { googleAuthService, GoogleUser, isGoogleCalendarAvailable } from '../services/googleAuthService';
import { backgroundSyncService, SyncStatus, SyncResult } from '../services/backgroundSyncService';

export const GoogleCalendarIntegration: React.FC = () => {
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);

  // Check authentication status on component mount
  useEffect(() => {
    checkAvailability();
    checkAuthStatus();
    setupSyncListener();
    
    return () => {
      // Cleanup sync listener
      backgroundSyncService.removeSyncCallback(handleSyncResult);
    };
  }, []);

  // Update sync status every second
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(backgroundSyncService.getStatus());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  /**
   * Check if Google Calendar integration is available
   */
  const checkAvailability = () => {
    const available = isGoogleCalendarAvailable();
    setIsAvailable(available);
    
    if (!available) {
      console.log('⚠️ Google Calendar integration not available - missing environment variables');
    }
  };

  /**
   * Check current authentication status
   */
  const checkAuthStatus = async () => {
    try {
      const authenticated = googleAuthService.isAuthenticated();
      const currentUser = googleAuthService.getCurrentUser();
      
      console.log('🔍 Authentication check:', { authenticated, currentUser });
      
      setIsAuthenticated(authenticated);
      setUser(currentUser);
      
      if (authenticated) {
        console.log('✅ User is authenticated:', currentUser?.email);
        // Start background sync if authenticated
        backgroundSyncService.start();
      } else {
        console.log('⚠️ User is not authenticated');
        // Stop background sync if not authenticated
        backgroundSyncService.stop();
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
    }
  };

  /**
   * Set up sync result listener
   */
  const setupSyncListener = () => {
    backgroundSyncService.onSyncComplete(handleSyncResult);
  };

  /**
   * Handle sync result callback
   */
  const handleSyncResult = (result: SyncResult) => {
    setLastSyncResult(result);
    
    if (result.success && result.newEvents > 0) {
      console.log(`📅 ${result.newEvents} new events synced from Google Calendar`);
      
      // Show a success notification for new events
      setTimeout(() => {
        Alert.alert(
          'Calendar Sync Complete',
          `Successfully synced ${result.newEvents} new events from Google Calendar to your timeline!`,
          [{ text: 'OK' }]
        );
      }, 500);
    } else if (result.success && result.newEvents === 0) {
      console.log('📅 Calendar sync completed - no new events');
    } else if (!result.success) {
      console.error('❌ Calendar sync failed:', result.errors);
    }
  };

  /**
   * Handle Google Calendar authentication
   */
  const handleConnect = async () => {
    if (isAuthenticating) return;
    
    setIsAuthenticating(true);
    
    try {
      console.log('🔐 Starting Google Calendar authentication...');
      
      // Clear any leftover OAuth parameters from URL before starting new flow
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      // Clear any leftover OAuth state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('oauth_code_verifier');
      }
      
      // Small delay to ensure URL is cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await googleAuthService.authenticate();
      
      if (result.success && result.user) {
        setIsAuthenticated(true);
        setUser(result.user);
        
        // Start background sync
        backgroundSyncService.start();
        
        // Perform initial sync
        await backgroundSyncService.syncNow();
        
        Alert.alert(
          'Success!',
          `Connected to Google Calendar as ${result.user.email}. Background sync is now active.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Authentication Failed',
          result.error || 'Failed to connect to Google Calendar',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      Alert.alert(
        'Error',
        'Failed to connect to Google Calendar. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  /**
   * Handle disconnection
   */
  const handleDisconnect = async () => {
    Alert.alert(
      'Disconnect Google Calendar',
      'Are you sure you want to disconnect your Google Calendar? This will stop automatic syncing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              // Stop background sync
              backgroundSyncService.stop();
              
              // Sign out
              await googleAuthService.signOut();
              
              // Update state
              setIsAuthenticated(false);
              setUser(null);
              setSyncStatus(null);
              setLastSyncResult(null);
              
              console.log('✅ Disconnected from Google Calendar');
            } catch (error) {
              console.error('❌ Error disconnecting:', error);
              Alert.alert('Error', 'Failed to disconnect properly');
            }
          }
        }
      ]
    );
  };

  /**
   * Handle manual sync
   */
  const handleManualSync = async () => {
    if (!isAuthenticated) return;
    
    try {
      console.log('🔄 Starting manual sync...');
      const result = await backgroundSyncService.syncNow();
      
      if (result.success) {
        Alert.alert(
          'Sync Complete',
          `Synced ${result.newEvents} new events from Google Calendar`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Sync Failed',
          result.errors.join('\n') || 'Failed to sync calendar events',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Manual sync error:', error);
      Alert.alert('Error', 'Failed to sync calendar events');
    }
  };

  /**
   * Test Google Calendar API connection
   */
  const handleTestConnection = async () => {
    if (!isAuthenticated) return;
    
    try {
      console.log('🧪 Testing Google Calendar API connection...');
      
      // Test API call
      const { googleCalendarService } = await import('../services/googleCalendarService');
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      
      const events = await googleCalendarService.getEvents(startDate, endDate);
      
      Alert.alert(
        'Connection Test',
        `Successfully connected! Found ${events.length} events in the last/next 7 days`,
        [{ text: 'OK' }]
      );
      
      console.log('📅 Test events:', events);
    } catch (error) {
      console.error('❌ Connection test error:', error);
      Alert.alert('Connection Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  /**
   * Test event processing and storage
   */
  const handleTestStorage = async () => {
    if (!isAuthenticated) return;
    
    try {
      console.log('🧪 Testing event processing and storage...');
      
      // Test getting events
      const { googleCalendarService } = await import('../services/googleCalendarService');
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      
      const events = await googleCalendarService.getEvents(startDate, endDate);
      console.log('📅 Raw events from Google:', events);
      
      if (events.length > 0) {
        // Test processing first event
        const { eventCategorizationService } = await import('../services/eventCategorizationService');
        const firstEvent = events[0];
        
        console.log('🔄 Processing first event:', firstEvent);
        const processedEvent = await eventCategorizationService.processGoogleCalendarEvent(firstEvent);
        console.log('✅ Processed event:', processedEvent);
        
        // Test storing event
        const { useCalendarStore } = await import('../stores/calendarStore');
        const calendarStore = useCalendarStore.getState();
        
        await calendarStore.addCalendarEntry(processedEvent);
        console.log('💾 Event stored successfully');
        
        // Test retrieving events
        const today = new Date();
        const todayEntries = await calendarStore.loadTimeEntriesForDate(today);
        console.log('📅 Today\'s entries:', todayEntries);
        
        Alert.alert(
          'Storage Test Complete',
          `Processed and stored event: ${processedEvent.title}\nTotal entries today: ${todayEntries?.length || 0}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('No Events Found', 'No events found in the date range to test with');
      }
      
    } catch (error) {
      console.error('❌ Storage test error:', error);
      Alert.alert('Storage Test Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  /**
   * Show comprehensive debug information about OAuth configuration
   */
  const handleShowDebugInfo = () => {
    const currentUrl = window.location.href;
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const redirectUri = `${origin}${pathname}`;
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    
    console.log('🔍 COMPREHENSIVE OAUTH DEBUG:');
    console.log('================================');
    console.log('Current URL:', currentUrl);
    console.log('Origin:', origin);
    console.log('Pathname:', pathname);
    console.log('Computed Redirect URI:', redirectUri);
    console.log('Client ID:', clientId);
    console.log('================================');
    
    Alert.alert(
      'OAuth Configuration Debug',
      `Current URL: ${currentUrl}\n\nOrigin: ${origin}\nPathname: ${pathname}\n\nRedirect URI: ${redirectUri}\n\nClient ID: ${clientId}\n\nCopy this EXACT redirect URI to Google Cloud Console!`,
      [{ text: 'OK' }]
    );
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  /**
   * Get sync status text
   */
  const getSyncStatusText = (): string => {
    if (!syncStatus) return 'Not syncing';
    
    if (syncStatus.isRunning) {
      const nextSync = syncStatus.nextSync ? new Date(syncStatus.nextSync) : null;
      const timeToNext = nextSync ? Math.max(0, nextSync.getTime() - Date.now()) : 0;
      const minutesToNext = Math.ceil(timeToNext / (1000 * 60));
      
      return `Active (next sync in ${minutesToNext} min)`;
    }
    
    return 'Stopped';
  };

  // Show setup message if Google Calendar is not available
  if (!isAvailable) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Google Calendar Integration
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Optional: Connect your Google Calendar to automatically sync events
          </Text>
        </View>

        <View style={styles.setupMessage}>
          <Text style={[styles.setupTitle, { color: theme.colors.text }]}>
            ⚙️ Setup Required
          </Text>
          <Text style={[styles.setupText, { color: theme.colors.textSecondary }]}>
            To enable Google Calendar integration, you need to:
          </Text>
          <Text style={[styles.setupStep, { color: theme.colors.textSecondary }]}>
            1. Create a .env.local file in your project root
          </Text>
          <Text style={[styles.setupStep, { color: theme.colors.textSecondary }]}>
            2. Add your Google OAuth credentials
          </Text>
          <Text style={[styles.setupStep, { color: theme.colors.textSecondary }]}>
            3. Restart the development server
          </Text>
          <Text style={[styles.setupNote, { color: theme.colors.primary }]}>
            💡 See GOOGLE_OAUTH_SETUP.md for detailed instructions
          </Text>
          <Text style={[styles.skipNote, { color: theme.colors.textSecondary }]}>
            You can skip this step and use the app without Google Calendar integration.
          </Text>
        </View>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Google Calendar Integration
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Connect your Google Calendar to automatically sync events
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.connectButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleConnect}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? (
            <ActivityIndicator color={theme.colors.background} />
          ) : (
            <Text style={[styles.connectButtonText, { color: theme.colors.background }]}>
              Connect Google Calendar
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.debugButton, { backgroundColor: theme.colors.secondary, marginTop: 16 }]}
          onPress={handleShowDebugInfo}
        >
          <Text style={[styles.debugButtonText, { color: theme.colors.background }]}>
            Show OAuth Config
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Google Calendar
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Connected as {user?.email}
        </Text>
      </View>

      <View style={styles.status}>
        <View style={styles.statusRow}>
          <Text style={[styles.statusLabel, { color: theme.colors.text }]}>
            Sync Status:
          </Text>
          <Text style={[styles.statusValue, { color: theme.colors.primary }]}>
            {getSyncStatusText()}
          </Text>
        </View>

        {syncStatus?.lastSync && (
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: theme.colors.text }]}>
              Last Sync:
            </Text>
            <Text style={[styles.statusValue, { color: theme.colors.textSecondary }]}>
              {formatTimestamp(syncStatus.lastSync)}
            </Text>
          </View>
        )}

        {syncStatus && (
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: theme.colors.text }]}>
              Total Synced:
            </Text>
            <Text style={[styles.statusValue, { color: theme.colors.textSecondary }]}>
              {syncStatus.totalSynced} events
            </Text>
          </View>
        )}

        {lastSyncResult && (
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: theme.colors.text }]}>
              Last Result:
            </Text>
            <Text style={[styles.statusValue, { 
              color: lastSyncResult.success ? theme.colors.primary : theme.colors.error 
            }]}>
              {lastSyncResult.success 
                ? `${lastSyncResult.newEvents} new events` 
                : 'Failed'
              }
            </Text>
          </View>
        )}
      </View>

      <View style={styles.debug}>
        <Text style={[styles.debugTitle, { color: theme.colors.textSecondary }]}>
          Debug Info
        </Text>
        <Text style={[styles.debugText, { color: theme.colors.textSecondary }]}>
          Auth: {isAuthenticated ? 'Yes' : 'No'}
        </Text>
        <Text style={[styles.debugText, { color: theme.colors.textSecondary }]}>
          User: {user?.email || 'None'}
        </Text>
        <Text style={[styles.debugText, { color: theme.colors.textSecondary }]}>
          Sync Running: {syncStatus?.isRunning ? 'Yes' : 'No'}
        </Text>
        <Text style={[styles.debugText, { color: theme.colors.textSecondary }]}>
          Current Time: {new Date().toLocaleTimeString()}
        </Text>
        <TouchableOpacity
          style={[styles.debugButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleShowDebugInfo}
        >
          <Text style={[styles.debugButtonText, { color: theme.colors.background }]}>
            Show OAuth Config
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleManualSync}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.background }]}>
              Sync Now
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
            onPress={handleTestConnection}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.background }]}>
              Test API
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
            onPress={handleTestStorage}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.background }]}>
              Test Storage
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.disconnectButton, { borderColor: theme.colors.error }]}
            onPress={handleDisconnect}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
              Disconnect
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },

  connectButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
  },
  actions: {
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disconnectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  debug: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
     debugText: {
     fontSize: 13,
     lineHeight: 18,
   },
     debugButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  debugButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  setupMessage: {
    padding: 16,
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  setupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  setupText: {
    fontSize: 14,
    marginBottom: 8,
  },
  setupStep: {
    fontSize: 14,
    marginBottom: 4,
    paddingLeft: 8,
  },
  setupNote: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
    fontWeight: '500',
  },
  skipNote: {
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
}); 