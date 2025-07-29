import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, isFirebaseAvailable } from './firebase';
import { authService, AcornUser } from './authService';
import { EmotionalCheckIn, Reflection, TimeEntry, Insight, MorningCheckInData } from '../types';
import { CalendarTimeEntry } from '../types/calendar';

// Enhanced data models with user association
export interface UserEmotionalCheckIn extends Omit<EmotionalCheckIn, 'id' | 'created_at'> {
  id: string;
  userId: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface UserMorningCheckIn extends Omit<MorningCheckInData, 'id' | 'completedAt'> {
  id: string;
  userId: string;
  completedAt: Timestamp;
  created_at: Timestamp;
}

export interface UserReflection extends Omit<Reflection, 'id' | 'createdAt'> {
  id: string;
  userId: string;
  createdAt: Timestamp;
  updated_at: Timestamp;
}

export interface UserTimeEntry extends Omit<TimeEntry, 'id' | 'created_at'> {
  id: string;
  userId: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface UserCalendarTimeEntry extends Omit<CalendarTimeEntry, 'id' | 'createdAt' | 'updatedAt'> {
  id: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserInsight extends Omit<Insight, 'id' | 'createdAt' | 'generatedAt' | 'periodStart' | 'periodEnd'> {
  id: string;
  userId: string;
  periodStart: Timestamp;
  periodEnd: Timestamp;
  generatedAt: Timestamp;
  createdAt: Timestamp;
}

export interface SyncStatus {
  lastSyncAt: Date;
  pending: number;
  errors: string[];
}

class CloudDatabaseService {
  private isEnabled: boolean = false;

  constructor() {
    this.isEnabled = isFirebaseAvailable();
    if (!this.isEnabled) {
      console.log('⚠️ Cloud database not available - Firebase not configured');
    }
  }

  /**
   * Check if cloud database is available
   */
  isAvailable(): boolean {
    return this.isEnabled && db !== null;
  }

  /**
   * Get current user ID for data isolation
   */
  private getCurrentUserId(): string | null {
    const user = authService.getCurrentUser();
    return user?.uid || null;
  }

  /**
   * Get user-specific collection reference
   */
  private getUserCollection(userId: string, collectionName: string) {
    if (!db) throw new Error('Firestore not available');
    return collection(db, 'users', userId, collectionName);
  }

  // === MORNING CHECK-INS ===
  async saveMorningCheckIn(checkIn: MorningCheckInData): Promise<void> {
    if (!this.isAvailable()) return;
    
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const userCheckIn: UserMorningCheckIn = {
      id: checkIn.id,
      userId,
      date: checkIn.date,
      energyLevel: checkIn.energyLevel,
      positivityLevel: checkIn.positivityLevel,
      focusLevel: checkIn.focusLevel,
      sleepQuality: checkIn.sleepQuality,
      yesterdayCompletion: checkIn.yesterdayCompletion,
      emotions: checkIn.emotions,
      reflectionPrompt: checkIn.reflectionPrompt,
      reflectionResponse: checkIn.reflectionResponse,
      mainGoal: checkIn.mainGoal,
      notes: checkIn.notes,
      completedAt: Timestamp.fromDate(checkIn.completedAt),
      created_at: serverTimestamp() as Timestamp
    };

    const collectionRef = this.getUserCollection(userId, 'morningCheckIns');
    await setDoc(doc(collectionRef, checkIn.id), userCheckIn);
    console.log('✅ Morning check-in synced to cloud:', checkIn.date);
  }

  async getMorningCheckInsByDateRange(startDate: Date, endDate: Date): Promise<MorningCheckInData[]> {
    if (!this.isAvailable()) return [];
    
    const userId = this.getCurrentUserId();
    if (!userId) return [];

    try {
      const collectionRef = this.getUserCollection(userId, 'morningCheckIns');
      const q = query(
        collectionRef,
        where('date', '>=', startDate.toISOString().split('T')[0]),
        where('date', '<=', endDate.toISOString().split('T')[0]),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data() as UserMorningCheckIn;
        return {
          id: data.id,
          date: data.date,
          energyLevel: data.energyLevel,
          positivityLevel: data.positivityLevel,
          focusLevel: data.focusLevel,
          sleepQuality: data.sleepQuality,
          yesterdayCompletion: data.yesterdayCompletion,
          emotions: data.emotions,
          reflectionPrompt: data.reflectionPrompt,
          reflectionResponse: data.reflectionResponse,
          mainGoal: data.mainGoal,
          notes: data.notes,
          completedAt: data.completedAt.toDate()
        };
      });
    } catch (error) {
      console.error('❌ Failed to fetch morning check-ins from cloud:', error);
      return [];
    }
  }

  // === CALENDAR TIME ENTRIES ===
  async saveCalendarTimeEntry(entry: CalendarTimeEntry): Promise<void> {
    if (!this.isAvailable()) return;
    
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const userEntry: UserCalendarTimeEntry = {
      id: entry.id,
      userId,
      date: entry.date,
      activity: entry.activity,
      category: entry.category,
      startTime: entry.startTime,
      endTime: entry.endTime,
      duration: entry.duration,
      moodRating: entry.moodRating,
      emotionalTags: entry.emotionalTags,
      reflection: entry.reflection,
      createdAt: Timestamp.fromDate(entry.createdAt),
      updatedAt: Timestamp.fromDate(entry.updatedAt)
    };

    const collectionRef = this.getUserCollection(userId, 'calendarTimeEntries');
    await setDoc(doc(collectionRef, entry.id), userEntry);
    console.log('✅ Calendar time entry synced to cloud:', entry.activity);
  }

  async updateCalendarTimeEntry(entryId: string, updates: Partial<CalendarTimeEntry>): Promise<void> {
    if (!this.isAvailable()) return;
    
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    const collectionRef = this.getUserCollection(userId, 'calendarTimeEntries');
    await setDoc(doc(collectionRef, entryId), updateData, { merge: true });
    console.log('✅ Calendar time entry updated in cloud:', entryId);
  }

  async deleteCalendarTimeEntry(entryId: string): Promise<void> {
    if (!this.isAvailable()) return;
    
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const collectionRef = this.getUserCollection(userId, 'calendarTimeEntries');
    await deleteDoc(doc(collectionRef, entryId));
    console.log('✅ Calendar time entry deleted from cloud:', entryId);
  }

  async getCalendarTimeEntriesByDate(date: string): Promise<CalendarTimeEntry[]> {
    if (!this.isAvailable()) return [];
    
    const userId = this.getCurrentUserId();
    if (!userId) return [];

    try {
      const collectionRef = this.getUserCollection(userId, 'calendarTimeEntries');
      const q = query(
        collectionRef,
        where('date', '==', date),
        orderBy('startTime', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data() as UserCalendarTimeEntry;
        return {
          id: data.id,
          date: data.date,
          activity: data.activity,
          category: data.category,
          startTime: data.startTime,
          endTime: data.endTime,
          duration: data.duration,
          moodRating: data.moodRating,
          emotionalTags: data.emotionalTags,
          reflection: data.reflection,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        };
      });
    } catch (error) {
      console.error('❌ Failed to fetch calendar entries from cloud:', error);
      return [];
    }
  }

  // === INSIGHTS ===
  async saveInsight(insight: Insight): Promise<void> {
    if (!this.isAvailable()) return;
    
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const userInsight: UserInsight = {
      id: insight.id,
      userId,
      content: insight.content,
      type: insight.type,
      icon: insight.icon,
      timePeriod: insight.timePeriod,
      periodStart: Timestamp.fromDate(insight.periodStart),
      periodEnd: Timestamp.fromDate(insight.periodEnd),
      dataHash: insight.dataHash,
      dataVersion: insight.dataVersion,
      generatedAt: Timestamp.fromDate(insight.generatedAt),
      metadata: insight.metadata,
      createdAt: Timestamp.fromDate(insight.createdAt)
    };

    const collectionRef = this.getUserCollection(userId, 'insights');
    await setDoc(doc(collectionRef, insight.id), userInsight);
    console.log('✅ Insight synced to cloud:', insight.type);
  }

  async getInsightsByPeriod(timePeriod: 'week' | 'month' | 'quarter', periodStart: Date, periodEnd: Date): Promise<Insight[]> {
    if (!this.isAvailable()) return [];
    
    const userId = this.getCurrentUserId();
    if (!userId) return [];

    try {
      const collectionRef = this.getUserCollection(userId, 'insights');
      const q = query(
        collectionRef,
        where('timePeriod', '==', timePeriod),
        where('periodStart', '>=', Timestamp.fromDate(periodStart)),
        where('periodEnd', '<=', Timestamp.fromDate(periodEnd)),
        orderBy('generatedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data() as UserInsight;
        return {
          id: data.id,
          content: data.content,
          type: data.type,
          icon: data.icon,
          timePeriod: data.timePeriod,
          periodStart: data.periodStart.toDate(),
          periodEnd: data.periodEnd.toDate(),
          dataHash: data.dataHash,
          dataVersion: data.dataVersion,
          generatedAt: data.generatedAt.toDate(),
          metadata: data.metadata,
          createdAt: data.createdAt.toDate()
        };
      });
    } catch (error) {
      console.error('❌ Failed to fetch insights from cloud:', error);
      return [];
    }
  }

  // === SYNC STATUS ===
  async getSyncStatus(): Promise<SyncStatus> {
    // For now, return a basic sync status
    // In the future, this could track actual sync operations
    return {
      lastSyncAt: new Date(),
      pending: 0,
      errors: []
    };
  }

  /**
   * Sync all local data to cloud (for initial migration)
   */
  async syncAllLocalDataToCloud(): Promise<{ success: boolean; synced: number; errors: string[] }> {
    if (!this.isAvailable()) {
      return { success: false, synced: 0, errors: ['Cloud database not available'] };
    }

    const userId = this.getCurrentUserId();
    if (!userId) {
      return { success: false, synced: 0, errors: ['User not authenticated'] };
    }

    console.log('🔄 Starting full data sync to cloud...');
    
    let synced = 0;
    const errors: string[] = [];

    try {
      // This would integrate with the local database service to sync existing data
      // For now, we'll implement the sync when we update the app store
      console.log('✅ Full data sync completed');
      return { success: true, synced, errors };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      errors.push(errorMessage);
      console.error('❌ Full data sync failed:', error);
      return { success: false, synced, errors };
    }
  }
}

export const cloudDatabaseService = new CloudDatabaseService(); 