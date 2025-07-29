import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { authService, AcornUser } from '../services/authService';
import { cloudDatabaseService } from '../services/cloudDatabase';
import { isFirebaseAvailable } from '../services/firebase';
import { googleAuthService } from '../services/googleAuthService';
import { webDatabaseService } from '../services/webDatabase';
import { useTheme } from '../utils/theme';

export const AuthenticationPanel: React.FC = () => {
  const { theme } = useTheme();
  const [user, setUser] = useState<AcornUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    syncing: boolean;
    lastSync: Date | null;
    error: string | null;
  }>({
    syncing: false,
    lastSync: null,
    error: null
  });

  // Debug render
  console.log('🔐 AuthenticationPanel: Rendering');
  console.log('  User state:', user ? user.email : 'null');
  console.log('  Loading state:', loading);
  console.log('  Sync status:', syncStatus);

  useEffect(() => {
    console.log('🔐 AuthenticationPanel: Setting up auth state listener');
    
    // Listen for auth state changes
    const unsubscribe = authService.onAuthStateChanged((user) => {
      console.log('🔐 AuthenticationPanel: Auth state changed');
      console.log('  User:', user ? user.email : 'null');
      console.log('  Setting user state to:', user ? user.email : 'null');
      setUser(user);
    });

    // Also check current user on mount
    const currentUser = authService.getCurrentUser();
    console.log('🔐 AuthenticationPanel: Checking current user on mount');
    console.log('  Current user:', currentUser ? currentUser.email : 'null');
    if (currentUser) {
      console.log('🔐 AuthenticationPanel: Setting user from current user');
      setUser(currentUser);
    }

    return unsubscribe;
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const result = await authService.signIn();
      if (result.success) {
        Alert.alert('Success', `Welcome ${result.user?.name}!`);
        // Trigger initial sync
        handleSyncData();
      } else {
        Alert.alert('Authentication Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setSyncStatus({ syncing: false, lastSync: null, error: null });
      Alert.alert('Signed Out', 'You have been signed out successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCalendarData = async () => {
    setLoading(true);
    try {
      // First, let's see what's currently stored
      const currentEvents = await webDatabaseService.getCalendarTimeEntries();
      console.log('📅 Current calendar events:', currentEvents);
      
      // Count all-day events (events with duration >= 1440 minutes = 24 hours)
      const allDayEvents = currentEvents.filter(event => event.duration >= 1440);
      console.log('📅 All-day events found:', allDayEvents.length);
      allDayEvents.forEach(event => {
        console.log(`  - ${event.title} (${event.duration} minutes)`);
      });
      
      await webDatabaseService.clearCalendarData();
      Alert.alert(
        'Calendar Cleared', 
        `Cleared ${currentEvents.length} events (${allDayEvents.length} were all-day events).\n\nSync again to test the new all-day event filter.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to clear calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncData = async () => {
    setLoading(true);
    setSyncStatus(prev => ({ ...prev, syncing: true, error: null }));
    
    try {
      console.log('🔄 Starting manual Google Calendar sync...');
      
      // Import and trigger background sync service
      const { backgroundSyncService } = await import('../services/backgroundSyncService');
      
      // Perform a manual sync
      const result = await backgroundSyncService.syncNow();
      
      console.log('📊 Sync result:', result);
      
      setSyncStatus({
        syncing: false,
        lastSync: new Date(),
        error: result.errors.length > 0 ? result.errors.join(', ') : null
      });
      
      if (result.success) {
        Alert.alert(
          'Sync Complete', 
          `Synced ${result.newEvents} new events, ${result.updatedEvents} updated events.\n\nCheck the console for all-day event skip logs.`
        );
      } else {
        Alert.alert('Sync Failed', result.errors.join('\n'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      console.error('❌ Manual sync error:', error);
      setSyncStatus({
        syncing: false,
        lastSync: null,
        error: errorMessage
      });
      Alert.alert('Sync Error', errorMessage);
    }
  };

  const styles = StyleSheet.create({
    container: {
      padding: theme.spacing?.lg || 16,
      backgroundColor: theme.colors?.surface || '#f5f5f5',
      borderRadius: theme.borderRadius?.lg || 8,
      margin: theme.spacing?.md || 12,
    },
    title: {
      fontSize: theme.fontSize?.lg || 18,
      fontWeight: 'bold',
      color: theme.colors?.text || '#333',
      marginBottom: theme.spacing?.md || 12,
    },
    userInfo: {
      marginBottom: theme.spacing?.md || 12,
    },
    userText: {
      fontSize: theme.fontSize?.md || 16,
      color: theme.colors?.text || '#333',
      marginBottom: theme.spacing?.xs || 8,
    },
    button: {
      backgroundColor: theme.colors?.primary || '#007AFF',
      padding: theme.spacing?.md || 12,
      borderRadius: theme.borderRadius?.md || 6,
      alignItems: 'center',
      marginVertical: theme.spacing?.xs || 8,
    },
    buttonSecondary: {
      backgroundColor: theme.colors?.secondary || '#FF9500',
    },
    buttonDisabled: {
      backgroundColor: theme.colors?.border || '#ccc',
    },
    buttonText: {
      color: 'white',
      fontSize: theme.fontSize?.md || 16,
      fontWeight: '600',
    },
    syncStatus: {
      marginTop: theme.spacing?.md || 12,
      padding: theme.spacing?.sm || 8,
      backgroundColor: theme.colors?.background || '#f8f8f8',
      borderRadius: theme.borderRadius?.sm || 4,
    },
    syncText: {
      fontSize: theme.fontSize?.sm || 14,
      color: theme.colors?.textSecondary || '#666',
    },
    errorText: {
      fontSize: theme.fontSize?.sm || 14,
      color: theme.colors?.error || '#FF3B30',
    },
    warningContainer: {
      backgroundColor: '#FFF3CD',
      padding: theme.spacing?.md || 12,
      borderRadius: theme.borderRadius?.md || 6,
      marginBottom: theme.spacing?.md || 12,
      borderWidth: 1,
      borderColor: '#FFECB5',
    },
    warningText: {
      color: '#856404',
      fontSize: theme.fontSize?.sm || 14,
      textAlign: 'center',
    },
    connectedStatus: {
      borderWidth: 1,
      borderColor: theme.colors?.success || '#10b981',
      backgroundColor: `${theme.colors?.success || '#10b981'}10`,
      borderRadius: theme.borderRadius?.md || 6,
    },
    statusText: {
      color: theme.colors?.success || '#10b981',
      fontWeight: '600',
      marginBottom: theme.spacing?.sm || 8,
    },
  });

  // Show warning if Firebase is not configured
  if (!isFirebaseAvailable()) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Google Account & Calendar</Text>
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            Cloud authentication not configured{'\n'}
            Add Firebase credentials to .env.local to enable user accounts and data sync
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Google Account & Calendar</Text>
      
      {user ? (
        <View>
          <View style={[styles.userInfo, styles.connectedStatus]}>
            <Text style={[styles.userText, styles.statusText]}>
              Connected and syncing
            </Text>
            <Text style={styles.userText}>Signed in as: {user.name}</Text>
            <Text style={styles.userText}>Email: {user.email}</Text>
            <Text style={styles.userText}>
              Cloud sync: Active
            </Text>
            <Text style={styles.userText}>
              Google Calendar: Connected
            </Text>
            <Text style={styles.userText}>
              Last login: {user.lastLoginAt.toLocaleDateString()}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleSyncData}
            disabled={syncStatus.syncing || !cloudDatabaseService.isAvailable()}
          >
            {syncStatus.syncing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Sync Data to Cloud</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.error }]}
            onPress={handleSignOut}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Sign Out</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.warning }]}
            onPress={handleClearCalendarData}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Clear Calendar Data</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.info || '#3b82f6' }]}
            onPress={handleSyncData}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Manual Sync (Test Filter)</Text>
            )}
          </TouchableOpacity>

          {/* Sync Status */}
          <View style={styles.syncStatus}>
            <Text style={styles.syncText}>
              Sync Status: {syncStatus.syncing ? 'Syncing...' : 'Ready'}
            </Text>
            {syncStatus.lastSync && (
              <Text style={styles.syncText}>
                Last sync: {syncStatus.lastSync.toLocaleString()}
              </Text>
            )}
            {syncStatus.error && (
              <Text style={styles.errorText}>
                Error: {syncStatus.error}
              </Text>
            )}
          </View>
        </View>
      ) : (
        <View>
          <Text style={styles.userText}>
            Sign in to enable cloud sync and calendar integration.
          </Text>
          
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Sign In with Google</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.warning }]}
            onPress={handleClearCalendarData}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Clear Calendar Data</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}; 