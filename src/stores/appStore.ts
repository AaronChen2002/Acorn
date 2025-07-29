import { create } from 'zustand';
import {
  EmotionalCheckIn,
  Reflection,
  TimeEntry,
  Insight,
  MorningCheckInData,
  MorningCheckInState,
} from '../types';
import { CalendarTimeEntry } from '../types/calendar';
import { DAILY_PROMPTS } from '../constants';
import { aiService } from '../services/aiService';
import { databaseService } from '../services/database';
import { authService, AcornUser } from '../services/authService';
import { cloudDatabaseService } from '../services/cloudDatabase';
import {
  generateDataHash,
  getTimePeriodBounds,
  areCachedInsightsValid,
  hasEnoughDataForInsights,
  filterDataForPeriod,
  createInsightCacheKey,
} from '../utils/insightCache';

interface AppState {
  // Data
  checkIns: EmotionalCheckIn[];
  reflections: Reflection[];
  timeEntries: TimeEntry[];
  insights: Insight[];

  // Authentication State (New)
  currentUser: AcornUser | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;

  // Morning Check-in State (Enhanced)
  morningCheckIn: MorningCheckInState;

  // UI State
  selectedDate: Date;
  currentScreen: string;
  isLoading: boolean;
  error: string | null;
  isFirstTimeUser: boolean;

  // Cloud Sync State (New)
  syncStatus: {
    lastSyncAt: Date | null;
    isSyncing: boolean;
    syncError: string | null;
    pendingChanges: number;
  };

  // Settings
  theme: 'light' | 'dark';
  reminderEnabled: boolean;
  reminderTime: string;
  testMode: boolean;

  // Authentication Actions (New)
  signIn: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;

  // Cloud Sync Actions (New)
  syncToCloud: () => Promise<{ success: boolean; error?: string }>;
  syncFromCloud: () => Promise<{ success: boolean; error?: string }>;
  enableCloudSync: (enable: boolean) => void;

  // Actions
  setSelectedDate: (date: Date) => void;
  setCurrentScreen: (screen: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Data actions (Enhanced with cloud sync)
  addCheckIn: (checkIn: Omit<EmotionalCheckIn, 'id' | 'created_at'>) => void;
  updateCheckIn: (id: string, updates: Partial<EmotionalCheckIn>) => void;
  deleteCheckIn: (id: string) => void;

  addReflection: (reflection: Omit<Reflection, 'id' | 'created_at'>) => void;
  updateReflection: (id: string, updates: Partial<Reflection>) => void;
  deleteReflection: (id: string) => void;

  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'created_at'>) => void;
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => void;
  deleteTimeEntry: (id: string) => void;

  addInsight: (insight: Omit<Insight, 'id' | 'created_at'>) => void;

  // Insight caching actions
  getCachedInsights: (timePeriod: 'week' | 'month' | 'quarter', forceRefresh?: boolean) => Promise<Insight[]>;
  generateInsightsForPeriod: (timePeriod: 'week' | 'month' | 'quarter', periodStart: Date, periodEnd: Date) => Promise<Insight[]>;
  invalidateInsightCache: (timePeriod?: 'week' | 'month' | 'quarter') => Promise<void>;
  clearOldInsights: (olderThanDays: number) => Promise<void>;

  // Morning Check-in Actions (Enhanced with cloud sync)
  completeMorningCheckIn: (data: Omit<MorningCheckInData, 'id' | 'completedAt'>) => Promise<void>;
  shouldShowMorningModal: () => boolean;
  resetMorningCheckIn: () => void;
  getCurrentPrompt: () => string;
  generateTodaysPrompt: () => Promise<string>;
  cycleToNextPrompt: () => void;
  setModalVisibility: (visible: boolean) => void;
  checkForNewDay: () => void;
  initializeMorningCheckIn: () => Promise<boolean>;
  markUserAsExperienced: () => Promise<void>;

  // Getters
  getCheckInByDate: (date: Date) => EmotionalCheckIn | undefined;
  getReflectionsByDate: (date: Date) => Reflection[];
  getTimeEntriesByDate: (date: Date) => TimeEntry[];
  getRecentInsights: (days: number) => Insight[];
  getRecentMorningCheckIns: (days: number) => Promise<MorningCheckInData[]>;

  // Settings actions
  setTheme: (theme: 'light' | 'dark') => void;
  setReminderEnabled: (enabled: boolean) => void;
  setReminderTime: (time: string) => void;
  setTestMode: (enabled: boolean) => void;
}

// Centralized ID generation utility
export const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const isSameDate = (date1: Date, date2: Date) => {
  return date1.toDateString() === date2.toDateString();
};

// Enhanced helper function to format date as YYYY-MM-DD with timezone handling
const formatDate = (date: Date): string => {
  // Use local timezone for consistent date calculation
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Enhanced helper function to check if it's morning time (after 5 AM)
const isMorningTime = (date: Date = new Date()): boolean => {
  const hour = date.getHours();
  return hour >= 5;
};

// Helper to check if it's a new day since last check-in
const isNewDay = (lastCheckInDate: string | null, currentDate: Date): boolean => {
  if (!lastCheckInDate) return true;
  
  const today = formatDate(currentDate);
  return lastCheckInDate !== today;
};

// Helper to determine if we should show morning modal
const shouldShowModalLogic = (state: MorningCheckInState, isFirstTimeUser: boolean, currentTime: Date = new Date()): boolean => {
  const today = formatDate(currentTime);
  
  // Don't show for first-time users
  if (isFirstTimeUser) {
    console.log('Modal hidden: First-time user');
    return false;
  }
  
  // Don't show if already completed today
  if (state.isCompleted && state.data?.date === today) {
    return false;
  }
  
  // Don't show if it's before 5 AM
  if (!isMorningTime(currentTime)) {
    return false;
  }
  
  // Don't show if manually hidden and not a new day
  if (!state.shouldShowModal && state.data?.date === today) {
    return false;
  }
  
  // Show if it's a new day and after 5 AM
  return isNewDay(state.data?.date || null, currentTime);
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  checkIns: [],
  reflections: [],
  timeEntries: [],
  insights: [],

  // Authentication state (New)
  currentUser: null,
  isAuthenticated: false,
  authLoading: false,
  authError: null,

  // Morning Check-in initial state
  morningCheckIn: {
    isCompleted: false,
    completedAt: null,
    data: null,
    shouldShowModal: false,
    currentPromptIndex: 0,
    lastPromptDate: null,
    aiGeneratedPrompt: null,
    aiPromptDate: null,
  },
  
  // Check authentication state to determine first-time status
  isFirstTimeUser: true, // Will be updated during auth initialization

  // Cloud sync state (New)
  syncStatus: {
    lastSyncAt: null,
    isSyncing: false,
    syncError: null,
    pendingChanges: 0,
  },

  selectedDate: new Date(),
  currentScreen: 'TimeTracking',
  isLoading: false,
  error: null,

  theme: 'dark',
  reminderEnabled: true,
  reminderTime: '18:00',
  testMode: true,

  // Authentication Actions (New)
  signIn: async () => {
    set({ authLoading: true, authError: null });
    
    try {
      const result = await authService.signIn();
      
      if (result.success && result.user) {
        set({ 
          currentUser: result.user, 
          isAuthenticated: true,
          isFirstTimeUser: result.user.isFirstTimeUser,
          authLoading: false 
        });
        
        // Trigger sync after successful authentication
        get().syncFromCloud();
        
        return { success: true };
      } else {
        set({ 
          authError: result.error || 'Authentication failed', 
          authLoading: false 
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      set({ authError: errorMessage, authLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  signOut: async () => {
    set({ authLoading: true });
    
    try {
      await authService.signOut();
      set({ 
        currentUser: null, 
        isAuthenticated: false,
        isFirstTimeUser: true,
        authLoading: false,
        syncStatus: {
          lastSyncAt: null,
          isSyncing: false,
          syncError: null,
          pendingChanges: 0,
        }
      });
    } catch (error) {
      console.error('Sign out error:', error);
      set({ authLoading: false });
    }
  },

  initializeAuth: async () => {
    set({ authLoading: true });
    
    // Listen for auth state changes
    authService.onAuthStateChanged((user) => {
      set({ 
        currentUser: user, 
        isAuthenticated: !!user,
        isFirstTimeUser: user?.isFirstTimeUser ?? true,
        authLoading: false 
      });
      
      // If user is authenticated, sync data
      if (user) {
        get().syncFromCloud();
      }
    });
  },

  // Cloud Sync Actions (New)
  syncToCloud: async () => {
    const state = get();
    if (!state.isAuthenticated || state.syncStatus.isSyncing) {
      return { success: false, error: 'Not authenticated or already syncing' };
    }

    set({ 
      syncStatus: { 
        ...state.syncStatus, 
        isSyncing: true, 
        syncError: null 
      } 
    });

    try {
      // Sync all local data to cloud
      const result = await cloudDatabaseService.syncAllLocalDataToCloud();
      
      set({ 
        syncStatus: { 
          lastSyncAt: new Date(),
          isSyncing: false,
          syncError: result.errors.length > 0 ? result.errors.join(', ') : null,
          pendingChanges: 0
        } 
      });

      return { success: result.success, error: result.errors.join(', ') || undefined };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      set({ 
        syncStatus: { 
          ...state.syncStatus, 
          isSyncing: false, 
          syncError: errorMessage 
        } 
      });
      return { success: false, error: errorMessage };
    }
  },

  syncFromCloud: async () => {
    const state = get();
    if (!state.isAuthenticated || state.syncStatus.isSyncing) {
      return { success: false, error: 'Not authenticated or already syncing' };
    }

    set({ 
      syncStatus: { 
        ...state.syncStatus, 
        isSyncing: true, 
        syncError: null 
      } 
    });

    try {
      // For now, just update the sync status
      // Full sync implementation would load data from cloud
      console.log('🔄 Syncing data from cloud...');
      
      set({ 
        syncStatus: { 
          lastSyncAt: new Date(),
          isSyncing: false,
          syncError: null,
          pendingChanges: 0
        } 
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      set({ 
        syncStatus: { 
          ...state.syncStatus, 
          isSyncing: false, 
          syncError: errorMessage 
        } 
      });
      return { success: false, error: errorMessage };
    }
  },

  enableCloudSync: (enable: boolean) => {
    // Toggle cloud sync if needed
    console.log('Cloud sync', enable ? 'enabled' : 'disabled');
  },

  // UI Actions
  setSelectedDate: (date) => set({ selectedDate: date }),
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Check-in actions
  addCheckIn: (checkInData) => {
    const checkIn: EmotionalCheckIn = {
      ...checkInData,
      id: generateId(),
      created_at: new Date(),
    };
    set((state) => ({
      checkIns: [...state.checkIns, checkIn],
    }));
  },

  updateCheckIn: (id, updates) => {
    set((state) => ({
      checkIns: state.checkIns.map((checkIn) =>
        checkIn.id === id ? { ...checkIn, ...updates } : checkIn
      ),
    }));
  },

  deleteCheckIn: (id) => {
    set((state) => ({
      checkIns: state.checkIns.filter((checkIn) => checkIn.id !== id),
    }));
  },

  // Reflection actions
  addReflection: (reflectionData) => {
    const reflection: Reflection = {
      ...reflectionData,
      id: generateId(),
      created_at: new Date(),
    };
    set((state) => ({
      reflections: [...state.reflections, reflection],
    }));
  },

  updateReflection: (id, updates) => {
    set((state) => ({
      reflections: state.reflections.map((reflection) =>
        reflection.id === id ? { ...reflection, ...updates } : reflection
      ),
    }));
  },

  deleteReflection: (id) => {
    set((state) => ({
      reflections: state.reflections.filter((reflection) => reflection.id !== id),
    }));
  },

  // Time entry actions
  addTimeEntry: (entryData) => {
    const entry: TimeEntry = {
      ...entryData,
      id: generateId(),
      created_at: new Date(),
    };
    
    const state = get();
    
    // Mark user as experienced after they create their first time entry
    if (state.isFirstTimeUser) {
      console.log('🎯 User created their first time entry - marking as experienced');
      get().markUserAsExperienced();
    }
    
    set((state) => ({
      timeEntries: [...state.timeEntries, entry],
    }));
  },

  updateTimeEntry: (id, updates) => {
    set((state) => ({
      timeEntries: state.timeEntries.map((entry) =>
        entry.id === id ? { ...entry, ...updates } : entry
      ),
    }));
  },

  deleteTimeEntry: (id) => {
    set((state) => ({
      timeEntries: state.timeEntries.filter((entry) => entry.id !== id),
    }));
  },

  // Insight actions
  addInsight: (insightData) => {
    const insight: Insight = {
      ...insightData,
      id: generateId(),
      created_at: new Date(),
    };
    set((state) => ({
      insights: [...state.insights, insight],
    }));
  },

  // Enhanced Morning Check-in Actions (Phase 3)
  completeMorningCheckIn: async (checkInData) => {
    const completedData: MorningCheckInData = {
      ...checkInData,
      id: generateId(),
      completedAt: new Date(),
    };

    try {
      // Save to local database
      await databaseService.saveMorningCheckIn(completedData);
      
      // Save to cloud if authenticated
      if (get().isAuthenticated) {
        await cloudDatabaseService.saveMorningCheckIn(completedData);
      }

      set((state) => ({
        morningCheckIn: {
          ...state.morningCheckIn,
          isCompleted: true,
          completedAt: completedData.completedAt,
          data: completedData,
          shouldShowModal: false,
        },
      }));
      
      console.log('✅ Morning check-in completed and synced');
    } catch (error) {
      console.error('❌ Error completing morning check-in:', error);
      throw error;
    }
  },

  shouldShowMorningModal: () => {
    const { morningCheckIn, isFirstTimeUser } = get();
    return shouldShowModalLogic(morningCheckIn, isFirstTimeUser);
  },

  resetMorningCheckIn: () => {
    set((state) => ({
      morningCheckIn: {
        ...state.morningCheckIn,
        isCompleted: false,
        completedAt: null,
        shouldShowModal: false,
        // Keep existing data and prompt index for reference
      },
    }));
  },

  getCurrentPrompt: () => {
    const { morningCheckIn } = get();
    const today = formatDate(new Date());
    
    // Use AI-generated prompt if available and from today
    if (morningCheckIn.aiGeneratedPrompt && morningCheckIn.aiPromptDate === today) {
      console.log('Using AI-generated prompt for today');
      return morningCheckIn.aiGeneratedPrompt;
    }
    
    // Fallback to static prompt
    console.log('Using fallback static prompt');
    const fallbackPrompt = DAILY_PROMPTS[morningCheckIn.currentPromptIndex] || DAILY_PROMPTS[0];
    return fallbackPrompt;
  },

  generateTodaysPrompt: async () => {
    const { morningCheckIn, testMode } = get();
    const today = formatDate(new Date());
    
    // Return cached prompt if already generated today
    if (morningCheckIn.aiGeneratedPrompt && morningCheckIn.aiPromptDate === today) {
      return morningCheckIn.aiGeneratedPrompt;
    }
    
    try {
      // Get recent check-in data (last 7 days)
      const recentCheckIns = await get().getRecentMorningCheckIns(7);
      
      // Extract recent goals
      const recentGoals = recentCheckIns
        .map(checkIn => checkIn.mainGoal)
        .filter(goal => goal && goal.trim().length > 0)
        .slice(0, 5); // Last 5 goals
      
      // Generate AI prompt
      const result = await aiService.generatePersonalizedPrompt(
        recentCheckIns,
        recentGoals,
        testMode
      );
      
      // Cache the generated prompt
      set((state) => ({
        morningCheckIn: {
          ...state.morningCheckIn,
          aiGeneratedPrompt: result.prompt,
          aiPromptDate: today,
        },
      }));
      
      console.log('Generated personalized prompt:', result.prompt);
      console.log('Context:', result.context);
      
      return result.prompt;
    } catch (error) {
      console.error('Failed to generate personalized prompt:', error);
      
      // Fallback to static prompt
      const fallbackPrompt = DAILY_PROMPTS[morningCheckIn.currentPromptIndex] || DAILY_PROMPTS[0];
      
      // Cache the fallback prompt
      set((state) => ({
        morningCheckIn: {
          ...state.morningCheckIn,
          aiGeneratedPrompt: fallbackPrompt,
          aiPromptDate: today,
        },
      }));
      
      return fallbackPrompt;
    }
  },

  cycleToNextPrompt: () => {
    const today = formatDate(new Date());
    
    set((state) => {
      // Only cycle if it's a new day
      if (state.morningCheckIn.lastPromptDate !== today) {
        const nextIndex = (state.morningCheckIn.currentPromptIndex + 1) % DAILY_PROMPTS.length;
        return {
          morningCheckIn: {
            ...state.morningCheckIn,
            currentPromptIndex: nextIndex,
            lastPromptDate: today,
          },
        };
      }
      return state;
    });
  },

  setModalVisibility: (visible) => {
    set((state) => ({
      morningCheckIn: {
        ...state.morningCheckIn,
        shouldShowModal: visible,
      },
    }));
  },

  // New Phase 3 method: Check for new day and handle transitions
  checkForNewDay: () => {
    const { morningCheckIn, isFirstTimeUser } = get();
    const now = new Date();
    const today = formatDate(now);
    
    // If it's a new day, reset the morning check-in state
    if (isNewDay(morningCheckIn.data?.date || null, now)) {
      set((state) => ({
        morningCheckIn: {
          ...state.morningCheckIn,
          isCompleted: false,
          completedAt: null,
          shouldShowModal: shouldShowModalLogic(state.morningCheckIn, isFirstTimeUser, now),
          // Clear AI prompt so new personalized prompt gets generated
          aiGeneratedPrompt: null,
          aiPromptDate: null,
        },
      }));
      
      // Cycle to next prompt for the new day (fallback mechanism)
      get().cycleToNextPrompt();
    }
  },

  // New Phase 3 method: Initialize morning check-in on app launch
  initializeMorningCheckIn: async (): Promise<boolean> => {
    try {
      const now = new Date();
      const { morningCheckIn, isFirstTimeUser } = get();
      
      // Check if it's a new day
      get().checkForNewDay();
      
      // Determine if modal should show
      const shouldShow = shouldShowModalLogic(get().morningCheckIn, isFirstTimeUser, now);
      
      if (shouldShow) {
        // Generate today's personalized prompt before showing modal
        console.log('Generating personalized prompt for today...');
        await get().generateTodaysPrompt();
        
        set((state) => ({
          morningCheckIn: {
            ...state.morningCheckIn,
            shouldShowModal: true,
          },
        }));
      }
      
      return shouldShow;
    } catch (error) {
      console.error('Error initializing morning check-in:', error);
      return false;
    }
  },

  // Getters
  getCheckInByDate: (date) => {
    const { checkIns } = get();
    return checkIns.find((checkIn) => isSameDate(checkIn.date, date));
  },

  getReflectionsByDate: (date) => {
    const { reflections } = get();
    return reflections.filter((reflection) => isSameDate(reflection.date, date));
  },

  getTimeEntriesByDate: (date) => {
    const { timeEntries } = get();
    return timeEntries.filter((entry) => isSameDate(entry.date, date));
  },

  getRecentInsights: (days) => {
    const { insights } = get();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return insights
      .filter((insight) => insight.created_at >= cutoffDate)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  },

  getRecentMorningCheckIns: async (days) => {
    try {
      // Get from database service
      const allCheckIns = await databaseService.getMorningCheckIns();
      
      // Filter to recent days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const recentCheckIns = allCheckIns.filter(checkIn => {
        const checkInDate = new Date(checkIn.date);
        return checkInDate >= cutoffDate;
      });
      
      return recentCheckIns;
    } catch (error) {
      console.error('Error getting recent morning check-ins:', error);
      return [];
    }
  },

  // Insight caching implementations
  getCachedInsights: async (timePeriod, forceRefresh = false) => {
    try {
      const periodBounds = getTimePeriodBounds(new Date(), timePeriod);
      
      if (!forceRefresh) {
        // Check for cached insights
        const cachedInsights = await databaseService.getInsightsForPeriod(
          timePeriod,
          periodBounds.start,
          periodBounds.end
        );
        
        if (cachedInsights.length > 0) {
          // Check if cache is still valid
          const mostRecentInsight = cachedInsights[0];
          
          // Get current data to check if it has changed
          const [checkIns, activities] = await Promise.all([
            get().getRecentMorningCheckIns(30), // Get 30 days of data
            databaseService.getCalendarTimeEntries(),
          ]);
          
          // Extract recent goals from check-ins
          const recentGoals = checkIns.map(c => c.mainGoal).filter(g => g);
          
          // Generate current data hash
          const currentDataHash = generateDataHash(checkIns, activities, recentGoals);
          
          // Check if cached data is still valid
          if (areCachedInsightsValid(
            mostRecentInsight.dataHash,
            currentDataHash,
            mostRecentInsight.generatedAt,
            24 // Cache for 24 hours
          )) {
            console.log(`Using cached insights for ${timePeriod}`);
            return cachedInsights;
          }
        }
      }
      
      // Generate new insights if cache is invalid or forced refresh
      console.log(`Generating new insights for ${timePeriod}`);
      return await get().generateInsightsForPeriod(
        timePeriod,
        periodBounds.start,
        periodBounds.end
      );
    } catch (error) {
      console.error('Error getting cached insights:', error);
      return [];
    }
  },

  generateInsightsForPeriod: async (timePeriod, periodStart, periodEnd) => {
    try {
      const { testMode } = get();
      
      // Get all data for the period
      const [allCheckIns, allActivities] = await Promise.all([
        databaseService.getMorningCheckIns(),
        databaseService.getCalendarTimeEntries(),
      ]);
      
      // Filter data for the specific period
      const { checkIns, activities } = filterDataForPeriod(
        allCheckIns,
        allActivities,
        periodStart,
        periodEnd
      );
      
      // Check if we have enough data
      if (!hasEnoughDataForInsights(checkIns, activities)) {
        console.log(`Not enough data for ${timePeriod} insights`);
        return [];
      }
      
      // Extract goals from check-ins
      const goals = checkIns.map(c => c.mainGoal).filter(g => g);
      
      // Generate data hash
      const dataHash = generateDataHash(checkIns, activities, goals);
      
      // Generate insights using AI
      const aiInsights = await aiService.generateCachedInsights(
        checkIns,
        activities,
        goals,
        testMode
      );
      
      // Convert AI insights to our Insight format and save to database
      const insights: Insight[] = [];
      for (const aiInsight of aiInsights) {
        const insight: Insight = {
          id: generateId(),
          content: aiInsight.content,
          type: aiInsight.type as 'trend' | 'pattern' | 'correlation' | 'habit' | 'energy' | 'productivity',
          icon: aiInsight.icon,
          timePeriod,
          periodStart,
          periodEnd,
          dataHash,
          dataVersion: 1,
          generatedAt: new Date(),
          createdAt: new Date(),
        };
        
        // Save to database
        await databaseService.saveInsight(insight);
        insights.push(insight);
      }
      
      // Update app state
      set(state => ({
        insights: [...state.insights, ...insights],
      }));
      
      console.log(`Generated ${insights.length} insights for ${timePeriod}`);
      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  },

  invalidateInsightCache: async (timePeriod) => {
    try {
      if (timePeriod) {
        // Invalidate specific time period
        const periodBounds = getTimePeriodBounds(new Date(), timePeriod);
        const cachedInsights = await databaseService.getInsightsForPeriod(
          timePeriod,
          periodBounds.start,
          periodBounds.end
        );
        
        // Delete cached insights for this period
        for (const insight of cachedInsights) {
          await databaseService.deleteEntry('insights', insight.id);
        }
      } else {
        // Invalidate all cached insights
        const allInsights = await databaseService.getInsights();
        for (const insight of allInsights) {
          await databaseService.deleteEntry('insights', insight.id);
        }
      }
      
      // Clear from app state
      set(state => ({
        insights: timePeriod 
          ? state.insights.filter(i => i.timePeriod !== timePeriod)
          : [],
      }));
      
      console.log(`Invalidated ${timePeriod || 'all'} insight cache`);
    } catch (error) {
      console.error('Error invalidating insight cache:', error);
    }
  },

  clearOldInsights: async (olderThanDays) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      await databaseService.deleteOldInsights(cutoffDate);
      
      // Update app state
      set(state => ({
        insights: state.insights.filter(i => i.generatedAt >= cutoffDate),
      }));
      
      console.log(`Cleared insights older than ${olderThanDays} days`);
    } catch (error) {
      console.error('Error clearing old insights:', error);
    }
  },

  // Settings actions
  setTheme: (theme) => set({ theme }),
  setReminderEnabled: (reminderEnabled) => set({ reminderEnabled }),
  setReminderTime: (reminderTime) => set({ reminderTime }),
  setTestMode: (testMode) => set({ testMode }),
  
  // Mark user as no longer first-time user
  markUserAsExperienced: async () => {
    console.log('👋 Marking user as experienced (no longer first-time)');
    set({ isFirstTimeUser: false });
    
    // Persist this to localStorage so it persists across sessions
    if (typeof window !== 'undefined') {
      localStorage.setItem('acorn_user_experienced', 'true');
    }

    // Update cloud if authenticated
    if (get().isAuthenticated) {
      await authService.markUserAsExperienced();
    }
  },
}));
