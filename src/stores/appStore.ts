import { create } from 'zustand';
import {
  EmotionalCheckIn,
  Reflection,
  TimeEntry,
  Insight,
  MorningCheckInData,
  MorningCheckInState,
} from '../types';
import { DAILY_PROMPTS } from '../constants';

interface AppState {
  // Data
  checkIns: EmotionalCheckIn[];
  reflections: Reflection[];
  timeEntries: TimeEntry[];
  insights: Insight[];

  // Morning Check-in State (New)
  morningCheckIn: MorningCheckInState;

  // UI State
  selectedDate: Date;
  currentScreen: string;
  isLoading: boolean;
  error: string | null;

  // Settings
  theme: 'light' | 'dark';
  reminderEnabled: boolean;
  reminderTime: string;

  // Actions
  setSelectedDate: (date: Date) => void;
  setCurrentScreen: (screen: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Data actions
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

  // Morning Check-in Actions (New)
  completeMorningCheckIn: (data: Omit<MorningCheckInData, 'id' | 'completedAt'>) => void;
  shouldShowMorningModal: () => boolean;
  resetMorningCheckIn: () => void;
  getCurrentPrompt: () => string;
  cycleToNextPrompt: () => void;
  setModalVisibility: (visible: boolean) => void;

  // Getters
  getCheckInByDate: (date: Date) => EmotionalCheckIn | undefined;
  getReflectionsByDate: (date: Date) => Reflection[];
  getTimeEntriesByDate: (date: Date) => TimeEntry[];
  getRecentInsights: (days: number) => Insight[];

  // Settings actions
  setTheme: (theme: 'light' | 'dark') => void;
  setReminderEnabled: (enabled: boolean) => void;
  setReminderTime: (time: string) => void;
}

// Centralized ID generation utility
export const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const isSameDate = (date1: Date, date2: Date) => {
  return date1.toDateString() === date2.toDateString();
};

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Helper function to check if it's after 5 AM
const isMorningTime = (): boolean => {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 5;
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  checkIns: [],
  reflections: [],
  timeEntries: [],
  insights: [],

  // Morning Check-in initial state
  morningCheckIn: {
    isCompleted: false,
    completedAt: null,
    data: null,
    shouldShowModal: false,
    currentPromptIndex: 0,
    lastPromptDate: null,
  },

  selectedDate: new Date(),
  currentScreen: 'TimeTracking',
  isLoading: false,
  error: null,

  theme: 'light',
  reminderEnabled: true,
  reminderTime: '18:00',

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

  // Morning Check-in Actions (New)
  completeMorningCheckIn: (checkInData) => {
    const completedData: MorningCheckInData = {
      ...checkInData,
      id: generateId(),
      completedAt: new Date(),
    };

    set((state) => ({
      morningCheckIn: {
        ...state.morningCheckIn,
        isCompleted: true,
        completedAt: new Date(),
        data: completedData,
        shouldShowModal: false,
      },
    }));
  },

  shouldShowMorningModal: () => {
    const { morningCheckIn } = get();
    const today = formatDate(new Date());
    const lastCompletedDate = morningCheckIn.data?.date;

    return (
      isMorningTime() && 
      !morningCheckIn.isCompleted && 
      lastCompletedDate !== today
    );
  },

  resetMorningCheckIn: () => {
    set((state) => ({
      morningCheckIn: {
        ...state.morningCheckIn,
        isCompleted: false,
        completedAt: null,
        data: null,
        shouldShowModal: false,
      },
    }));
  },

  getCurrentPrompt: () => {
    const { morningCheckIn } = get();
    return DAILY_PROMPTS[morningCheckIn.currentPromptIndex] || DAILY_PROMPTS[0];
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

  // Settings actions
  setTheme: (theme) => set({ theme }),
  setReminderEnabled: (reminderEnabled) => set({ reminderEnabled }),
  setReminderTime: (reminderTime) => set({ reminderTime }),
}));
