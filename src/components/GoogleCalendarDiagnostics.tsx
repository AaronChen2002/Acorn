import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../utils/theme';
import { googleAuthService, isGoogleCalendarAvailable } from '../services/googleAuthService';
import { backgroundSyncService } from '../services/backgroundSyncService';

interface DiagnosticInfo {
  isAvailable: boolean;
  isAuthenticated: boolean;
  hasTokens: boolean;
  hasUser: boolean;
  tokenExpiry: string | null;
  lastSync: string | null;
  localStorageData: any;
  syncStatus: any;
}

export const GoogleCalendarDiagnostics: React.FC = () => {
  const { theme } = useTheme();
  const [diagnosticInfo, setDiagnosticInfo] = useState<DiagnosticInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setIsLoading(true);
    
    try {
      const info: DiagnosticInfo = {
        isAvailable: isGoogleCalendarAvailable(),
        isAuthenticated: googleAuthService.isAuthenticated(),
        hasTokens: false,
        hasUser: false,
        tokenExpiry: null,
        lastSync: null,
        localStorageData: {},
        syncStatus: null,
      };

      // Check localStorage for tokens and user data
      if (typeof window !== 'undefined') {
        const tokensJson = localStorage.getItem('google_tokens');
        const userJson = localStorage.getItem('google_user');
        const lastSyncJson = localStorage.getItem('last_sync_timestamp');
        
        info.localStorageData = {
          hasTokens: !!tokensJson,
          hasUser: !!userJson,
          hasLastSync: !!lastSyncJson,
          tokensData: tokensJson ? JSON.parse(tokensJson) : null,
          userData: userJson ? JSON.parse(userJson) : null,
          lastSyncData: lastSyncJson ? parseInt(lastSyncJson) : null,
        };

        if (tokensJson) {
          const tokens = JSON.parse(tokensJson);
          info.hasTokens = true;
          info.tokenExpiry = new Date(tokens.expires_at).toLocaleString();
        }

        if (userJson) {
          info.hasUser = true;
        }

        if (lastSyncJson) {
          const lastSync = parseInt(lastSyncJson);
          info.lastSync = new Date(lastSync).toLocaleString();
        }
      }

      // Get sync status
      info.syncStatus = backgroundSyncService.getStatus();

      setDiagnosticInfo(info);
    } catch (error) {
      console.error('Diagnostic error:', error);
      Alert.alert('Error', 'Failed to run diagnostics');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllData = async () => {
    // For web, use confirm instead of Alert.alert
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(
        'This will clear all stored Google Calendar data and require re-authentication. Continue?'
      );
      
      if (!confirmed) return;
    } else {
      Alert.alert(
        'Clear All Data',
        'This will clear all stored Google Calendar data and require re-authentication. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear',
            style: 'destructive',
            onPress: async () => {
              await performClearData();
            }
          }
        ]
      );
      return;
    }

    await performClearData();
  };

  const performClearData = async () => {
    try {
      console.log('🧹 Clearing all Google Calendar data...');
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('google_tokens');
        localStorage.removeItem('google_user');
        localStorage.removeItem('last_sync_timestamp');
        localStorage.removeItem('oauth_code_verifier');
        console.log('✅ localStorage cleared');
      }

      // Stop background sync
      backgroundSyncService.stop();
      console.log('✅ Background sync stopped');

      // Clear service state
      await googleAuthService.signOut();
      console.log('✅ Service state cleared');

      // Show success message
      if (typeof window !== 'undefined') {
        window.alert('All data cleared successfully! Please re-authenticate.');
      } else {
        Alert.alert('Success', 'All data cleared. Please re-authenticate.');
      }
      
      // Refresh diagnostics
      runDiagnostics();
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      const errorMsg = 'Failed to clear data: ' + (error instanceof Error ? error.message : 'Unknown error');
      
      if (typeof window !== 'undefined') {
        window.alert(errorMsg);
      } else {
        Alert.alert('Error', errorMsg);
      }
    }
  };

  const testTokenRefresh = async () => {
    try {
      const result = await googleAuthService.refreshTokens();
      Alert.alert(
        'Token Refresh Test',
        result ? 'Token refresh successful!' : 'Token refresh failed. Check console for details.'
      );
      runDiagnostics();
    } catch (error) {
      console.error('Token refresh test error:', error);
      Alert.alert('Error', 'Token refresh test failed');
    }
  };

  const testManualSync = async () => {
    try {
      const result = await backgroundSyncService.syncNow();
      Alert.alert(
        'Manual Sync Test',
        `Sync completed: ${result.success ? 'Success' : 'Failed'}\nNew events: ${result.newEvents}\nErrors: ${result.errors.length}`
      );
      runDiagnostics();
    } catch (error) {
      console.error('Manual sync test error:', error);
      Alert.alert('Error', 'Manual sync test failed');
    }
  };

  if (!diagnosticInfo) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Loading diagnostics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Google Calendar Diagnostics</Text>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Configuration</Text>
        <Text style={[styles.info, { color: theme.colors.text }]}>
          Integration Available: {diagnosticInfo.isAvailable ? '✅ Yes' : '❌ No'}
        </Text>
        <Text style={[styles.info, { color: theme.colors.text }]}>
          Authenticated: {diagnosticInfo.isAuthenticated ? '✅ Yes' : '❌ No'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Authentication State</Text>
        <Text style={[styles.info, { color: theme.colors.text }]}>
          Has Tokens: {diagnosticInfo.hasTokens ? '✅ Yes' : '❌ No'}
        </Text>
        <Text style={[styles.info, { color: theme.colors.text }]}>
          Has User: {diagnosticInfo.hasUser ? '✅ Yes' : '❌ No'}
        </Text>
        {diagnosticInfo.tokenExpiry && (
          <Text style={[styles.info, { color: theme.colors.text }]}>
            Token Expires: {diagnosticInfo.tokenExpiry}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sync Status</Text>
        <Text style={[styles.info, { color: theme.colors.text }]}>
          Background Sync: {diagnosticInfo.syncStatus?.isRunning ? '✅ Running' : '❌ Stopped'}
        </Text>
        {diagnosticInfo.lastSync && (
          <Text style={[styles.info, { color: theme.colors.text }]}>
            Last Sync: {diagnosticInfo.lastSync}
          </Text>
        )}
        <Text style={[styles.info, { color: theme.colors.text }]}>
          Total Synced: {diagnosticInfo.syncStatus?.totalSynced || 0}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Local Storage</Text>
        <Text style={[styles.info, { color: theme.colors.text }]}>
          Tokens Stored: {diagnosticInfo.localStorageData.hasTokens ? '✅ Yes' : '❌ No'}
        </Text>
        <Text style={[styles.info, { color: theme.colors.text }]}>
          User Stored: {diagnosticInfo.localStorageData.hasUser ? '✅ Yes' : '❌ No'}
        </Text>
        <Text style={[styles.info, { color: theme.colors.text }]}>
          Last Sync Stored: {diagnosticInfo.localStorageData.hasLastSync ? '✅ Yes' : '❌ No'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={runDiagnostics}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Running...' : 'Refresh Diagnostics'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.secondary }]}
          onPress={testTokenRefresh}
        >
          <Text style={styles.buttonText}>Test Token Refresh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.secondary }]}
          onPress={testManualSync}
        >
          <Text style={styles.buttonText}>Test Manual Sync</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#ff4444' }]}
          onPress={clearAllData}
        >
          <Text style={styles.buttonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recommendations</Text>
        {!diagnosticInfo.isAvailable && (
          <Text style={[styles.recommendation, { color: '#ff9800' }]}>
            • Add Google OAuth credentials to .env.local file
          </Text>
        )}
        {diagnosticInfo.isAvailable && !diagnosticInfo.isAuthenticated && (
          <Text style={[styles.recommendation, { color: '#ff9800' }]}>
            • Re-authenticate with Google Calendar
          </Text>
        )}
        {diagnosticInfo.isAuthenticated && !diagnosticInfo.syncStatus?.isRunning && (
          <Text style={[styles.recommendation, { color: '#ff9800' }]}>
            • Background sync is not running - try manual sync
          </Text>
        )}
        {diagnosticInfo.tokenExpiry && new Date(diagnosticInfo.tokenExpiry) < new Date() && (
          <Text style={[styles.recommendation, { color: '#f44336' }]}>
            • Tokens have expired - re-authentication required
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  info: {
    fontSize: 14,
    marginBottom: 8,
  },
  recommendation: {
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 