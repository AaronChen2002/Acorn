import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { DEV_CONFIG } from '../constants';
import { googleCalendarService } from '../services/googleCalendarService';
import { eventCategorizationService } from '../services/eventCategorizationService';
import { useCalendarStore } from '../stores/calendarStore';
import { CalendarTimeEntry } from '../types/calendar';
import { getWeekStart, getWeekEnd, getMonthStart, getMonthEnd } from '../types/calendar';

export const GoogleCalendarTest: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importedEvents, setImportedEvents] = useState<CalendarTimeEntry[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const addCalendarEntry = useCalendarStore((state) => state.addCalendarEntry);
  const viewMode = useCalendarStore((state) => state.viewMode);
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const loadTimeEntriesForDate = useCalendarStore((state) => state.loadTimeEntriesForDate);
  const loadTimeEntriesForDateRange = useCalendarStore((state) => state.loadTimeEntriesForDateRange);

  const handleConnectAndImport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setImportStatus('Connecting to Google Calendar...');
      
      // Step 1: Connect to Google Calendar
      const result = await googleCalendarService.authenticateWithGoogle();
      setIsConnected(result.isConnected);
      
      if (!result.isConnected) {
        throw new Error('Failed to connect to Google Calendar');
      }
      
      setImportStatus('Fetching calendar events...');
      
      // Step 2: Fetch calendar events
      const rawEvents = await googleCalendarService.fetchCalendarEvents(result.accessToken);
      
      setImportStatus(`Categorizing ${rawEvents.length} events with AI...`);
      
      // Step 3: Categorize events with AI (automatic, no user input needed)
      const categorizedEvents = await eventCategorizationService.categorizeEvents(rawEvents);
      
      setImportStatus('Importing events into your calendar...');
      
      // Step 4: Import events directly into calendar store
      const importPromises = categorizedEvents.map(async (event) => {
        try {
          await addCalendarEntry(event);
          return event;
        } catch (error) {
          console.error(`Failed to import event: ${event.title}`, error);
          return null;
        }
      });
      
      const importResults = await Promise.all(importPromises);
      const successfulImports = importResults.filter(Boolean) as CalendarTimeEntry[];
      
      setImportedEvents(successfulImports);
      setImportStatus(`✅ Successfully imported ${successfulImports.length} events! Check your calendar view to see them.`);
      
      // CRITICAL: Refresh the calendar view to show imported events
      await refreshCalendarView();
      
      // Show success briefly, then reset
      setTimeout(() => {
        setImportStatus(null);
      }, 5000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import calendar');
      setImportStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await googleCalendarService.disconnect();
      setIsConnected(false);
      setImportedEvents([]);
      setImportStatus(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  };

  // Refresh calendar view to show imported events
  const refreshCalendarView = async () => {
    try {
      console.log('🔄 Refreshing calendar view to show imported events...');
      
      if (viewMode === 'day') {
        await loadTimeEntriesForDate(selectedDate);
      } else if (viewMode === 'week') {
        const weekStart = getWeekStart(selectedDate);
        const weekEnd = getWeekEnd(selectedDate);
        await loadTimeEntriesForDateRange(weekStart, weekEnd);
      } else if (viewMode === 'month') {
        const monthStart = getMonthStart(selectedDate);
        const monthEnd = getMonthEnd(selectedDate);
        await loadTimeEntriesForDateRange(monthStart, monthEnd);
      }
      
      console.log('✅ Calendar view refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh calendar view:', error);
    }
  };

  const categorySummary = importedEvents.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!DEV_CONFIG.MOCK_GOOGLE_CALENDAR) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🔧 Google Calendar Integration</Text>
        <Text style={styles.subtitle}>
          Set MOCK_GOOGLE_CALENDAR to true in DEV_CONFIG to test this feature
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔧 Google Calendar Integration</Text>
      <Text style={styles.subtitle}>
        Automatic AI categorization and import
      </Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}

      {importStatus && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{importStatus}</Text>
          {isLoading && <ActivityIndicator color="#FF7043" style={{ marginLeft: 8 }} />}
        </View>
      )}

      <View style={styles.actionSection}>
        {!isConnected ? (
          <TouchableOpacity 
            style={styles.connectButton} 
            onPress={handleConnectAndImport}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>📅 Connect & Import Calendar</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View>
            <View style={styles.connectedStatus}>
              <Text style={styles.connectedText}>✅ Connected & Importing</Text>
              <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
                <Text style={styles.disconnectText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {importedEvents.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>
            📊 Imported {importedEvents.length} Events
          </Text>
          <Text style={styles.sectionSubtitle}>
            Events automatically categorized and added to your calendar
          </Text>

          {/* Category Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📈 Category Breakdown</Text>
            {Object.entries(categorySummary).map(([category, count]) => (
              <View key={category} style={styles.summaryRow}>
                <Text style={styles.summaryCategory}>{category}</Text>
                <Text style={styles.summaryCount}>{count} event{count > 1 ? 's' : ''}</Text>
              </View>
            ))}
          </View>

          {/* Recent Events Preview */}
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Recent Imports:</Text>
            {importedEvents.slice(0, 3).map((event) => (
              <View key={event.id} style={styles.eventPreview}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventCategory}>{event.category}</Text>
                </View>
                <Text style={styles.eventTime}>
                  {event.startTime.toLocaleDateString()} • {Math.round(event.duration / 60)}h
                </Text>
                {event.description && (
                  <Text style={styles.eventDescription} numberOfLines={1}>
                    {event.description}
                  </Text>
                )}
              </View>
            ))}
            
            {importedEvents.length > 3 && (
              <Text style={styles.moreEventsText}>
                +{importedEvents.length - 3} more events imported
              </Text>
            )}
          </View>

          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>🎯 What's Next?</Text>
            <Text style={styles.instructionText}>
              • Check your Time Tracking calendar to see all imported events{'\n'}
              • AI has automatically categorized events based on titles and descriptions{'\n'}
              • Events are now available for analytics and insights
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 112, 67, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: '#FF7043',
    fontSize: 14,
    fontWeight: '500',
  },
  actionSection: {
    marginBottom: 24,
  },
  connectButton: {
    backgroundColor: '#FF7043',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  connectedStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    padding: 16,
    borderRadius: 12,
  },
  connectedText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disconnectButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disconnectText: {
    color: '#fff',
    fontSize: 14,
  },
  resultsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#2d2d2d',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryCategory: {
    fontSize: 14,
    color: '#ddd',
  },
  summaryCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF7043',
  },
  previewSection: {
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  eventPreview: {
    backgroundColor: '#2d2d2d',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  eventCategory: {
    fontSize: 12,
    color: '#FF7043',
    backgroundColor: 'rgba(255, 112, 67, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eventTime: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 12,
    color: '#aaa',
    fontStyle: 'italic',
  },
  moreEventsText: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  instructionCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#ddd',
    lineHeight: 20,
  },
}); 