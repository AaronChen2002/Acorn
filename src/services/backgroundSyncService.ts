import { Platform } from 'react-native';
import { googleAuthService } from './googleAuthService';
import { googleCalendarService } from './googleCalendarService';
import { eventCategorizationService } from './eventCategorizationService';
import { CalendarTimeEntry } from '../types/calendar';
import { useCalendarStore } from '../stores/calendarStore';

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
const STORAGE_KEY = 'last_sync_timestamp';

export interface SyncResult {
  success: boolean;
  newEvents: number;
  updatedEvents: number;
  errors: string[];
  timestamp: number;
}

export interface SyncStatus {
  isRunning: boolean;
  lastSync: number | null;
  nextSync: number | null;
  totalSynced: number;
  lastResult: SyncResult | null;
}

class BackgroundSyncService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private lastSyncTimestamp: number | null = null;
  private totalSynced = 0;
  private lastResult: SyncResult | null = null;
  private syncCallbacks: Array<(result: SyncResult) => void> = [];

  constructor() {
    this.loadLastSyncTimestamp();
  }

  /**
   * Start background sync
   */
  start(): void {
    if (this.isRunning) {
      console.log('⚠️ Background sync already running');
      return;
    }

    console.log('🔄 Starting background sync service...');
    this.isRunning = true;

    // Run initial sync
    this.performSync();

    // Set up periodic sync
    this.intervalId = setInterval(() => {
      this.performSync();
    }, SYNC_INTERVAL);

    console.log('✅ Background sync started (every 5 minutes)');
  }

  /**
   * Stop background sync
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('⚠️ Background sync not running');
      return;
    }

    console.log('⏹️ Stopping background sync service...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('✅ Background sync stopped');
  }

  /**
   * Perform manual sync
   */
  async syncNow(): Promise<SyncResult> {
    console.log('🔄 Performing manual sync...');
    return await this.performSync();
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return {
      isRunning: this.isRunning,
      lastSync: this.lastSyncTimestamp,
      nextSync: this.isRunning ? Date.now() + SYNC_INTERVAL : null,
      totalSynced: this.totalSynced,
      lastResult: this.lastResult,
    };
  }

  /**
   * Add callback for sync results
   */
  onSyncComplete(callback: (result: SyncResult) => void): void {
    this.syncCallbacks.push(callback);
  }

  /**
   * Remove sync callback
   */
  removeSyncCallback(callback: (result: SyncResult) => void): void {
    this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Perform the actual sync operation
   */
  private async performSync(): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: false,
      newEvents: 0,
      updatedEvents: 0,
      errors: [],
      timestamp: startTime,
    };

    try {
      // Check if user is authenticated
      if (!googleAuthService.isAuthenticated()) {
        console.log('⚠️ User not authenticated, skipping sync');
        result.errors.push('User not authenticated');
        return result;
      }

      console.log('🔄 Starting calendar sync...');

      // Get the time range for sync
      const { startDate, endDate } = this.getSyncTimeRange();
      
      console.log(`📅 Syncing events from ${startDate.toISOString()} to ${endDate.toISOString()}`);

      // Fetch events from Google Calendar
      const events = await googleCalendarService.getEvents(startDate, endDate);
      
      if (events.length === 0) {
        console.log('📭 No new events found');
        result.success = true;
        this.updateLastSyncTimestamp(startTime);
        return result;
      }

      console.log(`📅 Found ${events.length} events to process`);

      // Process each event
      const processedEvents: CalendarTimeEntry[] = [];
      let skippedCount = 0;
      
      for (const event of events) {
        try {
          const processedEvent = await eventCategorizationService.transformCalendarEvent(event);
          if (processedEvent) {
            processedEvents.push(processedEvent);
            result.newEvents++;
          } else {
            skippedCount++;
          }
        } catch (error) {
          console.error('❌ Failed to process event:', event.summary, error);
          result.errors.push(`Failed to process event: ${event.summary}`);
        }
      }

      console.log(`📅 Processed ${processedEvents.length} events (skipped ${skippedCount} all-day events)`);

      // Save events to local storage
      if (processedEvents.length > 0) {
        await this.saveEventsToLocalStorage(processedEvents);
        this.totalSynced += processedEvents.length;
        
        // Notify calendar store to refresh
        await this.notifyCalendarStore();
      }

      result.success = true;
      this.updateLastSyncTimestamp(startTime);
      
      console.log(`✅ Sync completed: ${result.newEvents} new events`);

    } catch (error) {
      console.error('❌ Sync failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    // Store result and notify callbacks
    this.lastResult = result;
    this.notifyCallbacks(result);

    return result;
  }

  /**
   * Get time range for sync (last sync to now + 7 days)
   */
  private getSyncTimeRange(): { startDate: Date; endDate: Date } {
    const now = new Date();
    
    // Start from last sync or 7 days ago if no previous sync
    const startDate = this.lastSyncTimestamp 
      ? new Date(this.lastSyncTimestamp)
      : new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    // End 7 days from now to catch future events
    const endDate = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

    return { startDate, endDate };
  }

  /**
   * Save events to local storage
   */
  private async saveEventsToLocalStorage(events: CalendarTimeEntry[]): Promise<void> {
    try {
      // Get calendar store instance
      const calendarStore = useCalendarStore.getState();
      
      // Save each event
      for (const event of events) {
        await calendarStore.addCalendarEntry(event);
      }
      
      console.log(`💾 Saved ${events.length} events to local storage`);
    } catch (error) {
      console.error('❌ Failed to save events to local storage:', error);
      throw error;
    }
  }

  /**
   * Notify calendar store to refresh current view
   */
  private async notifyCalendarStore(): Promise<void> {
    try {
      const calendarStore = useCalendarStore.getState();
      const { viewMode, selectedDate } = calendarStore;
      
      // Refresh the current view
      if (viewMode === 'day') {
        await calendarStore.loadTimeEntriesForDate(selectedDate);
      } else if (viewMode === 'week') {
        const weekStart = new Date(selectedDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        await calendarStore.loadTimeEntriesForDateRange(weekStart, weekEnd);
      } else if (viewMode === 'month') {
        const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        await calendarStore.loadTimeEntriesForDateRange(monthStart, monthEnd);
      }
      
      console.log('🔄 Calendar view refreshed');
    } catch (error) {
      console.error('❌ Failed to notify calendar store:', error);
    }
  }

  /**
   * Load last sync timestamp from storage
   */
  private loadLastSyncTimestamp(): void {
    try {
      if (Platform.OS === 'web') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.lastSyncTimestamp = parseInt(stored, 10);
        }
      } else {
        // For mobile, you would use SecureStore or AsyncStorage
        // This is a simplified implementation
        this.lastSyncTimestamp = null;
      }
    } catch (error) {
      console.error('❌ Failed to load last sync timestamp:', error);
    }
  }

  /**
   * Update last sync timestamp
   */
  private updateLastSyncTimestamp(timestamp: number): void {
    try {
      this.lastSyncTimestamp = timestamp;
      
      if (Platform.OS === 'web') {
        localStorage.setItem(STORAGE_KEY, timestamp.toString());
      } else {
        // For mobile, store in SecureStore or AsyncStorage
      }
    } catch (error) {
      console.error('❌ Failed to update last sync timestamp:', error);
    }
  }

  /**
   * Notify all callbacks about sync result
   */
  private notifyCallbacks(result: SyncResult): void {
    this.syncCallbacks.forEach(callback => {
      try {
        callback(result);
      } catch (error) {
        console.error('❌ Error in sync callback:', error);
      }
    });
  }
}

export const backgroundSyncService = new BackgroundSyncService(); 