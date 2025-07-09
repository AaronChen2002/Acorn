import { create } from 'zustand';
import { Platform } from 'react-native';
import { CalendarTimeEntry, CalendarState, CalendarSelection, TimeSlot, ActivityCreationData, ViewMode, getWeekStart, getWeekEnd, getMonthStart, getMonthEnd } from '../types/calendar';
import { generateId } from './appStore';
import { databaseService } from '../services/database';
import { webDatabaseService } from '../services/webDatabase';

// Use web-compatible database service for web platform
const dbService = Platform.OS === 'web' ? webDatabaseService : databaseService;

interface CalendarStore extends CalendarState {
  // Actions
  setSelectedDate: (date: Date) => void;
  
  // View mode actions (Phase 7.1)
  setViewMode: (mode: ViewMode) => void;
  navigateToDate: (date: Date) => void;
  navigatePrevious: () => void;
  navigateNext: () => void;
  
  // Time entries
  addTimeEntry: (timeSlot: TimeSlot, activityData: ActivityCreationData) => Promise<void>;
  updateTimeEntry: (id: string, updates: Partial<CalendarTimeEntry>) => Promise<void>;
  deleteTimeEntry: (id: string) => Promise<void>;
  loadTimeEntriesForDate: (date: Date) => Promise<void>;
  loadTimeEntriesForDateRange: (startDate: Date, endDate: Date) => Promise<void>;
  
  // Selection
  startSelection: (startTime: Date) => void;
  updateSelection: (endTime: Date) => void;
  clearSelection: () => void;
  
  // Activity modal
  openActivityModal: (timeSlot?: TimeSlot) => void;
  openEditModal: (entry: CalendarTimeEntry) => void;
  closeActivityModal: () => void;
  
  // Utils
  getTimeEntriesForDate: (date: Date) => CalendarTimeEntry[];
  hasTimeConflict: (startTime: Date, endTime: Date, excludeId?: string) => boolean;
}

const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  // Initial state
  selectedDate: new Date(),
  timeEntries: [],
  selection: null,
  viewMode: 'day', // Default to day view
  isActivityModalVisible: false,
  editingEntry: null,
  viewStartHour: 6,
  viewEndHour: 23,
  slotDuration: 15,
  
  // Date selection
  setSelectedDate: (date: Date) => {
    set({ selectedDate: date });
    get().loadTimeEntriesForDate(date);
  },
  
  // View mode actions (Phase 7.1)
  setViewMode: (mode: ViewMode) => {
    set({ viewMode: mode });
    
    // Load appropriate data for the new view mode
    const { selectedDate } = get();
    if (mode === 'day') {
      get().loadTimeEntriesForDate(selectedDate);
    } else if (mode === 'week') {
      const weekStart = getWeekStart(selectedDate);
      const weekEnd = getWeekEnd(selectedDate);
      get().loadTimeEntriesForDateRange(weekStart, weekEnd);
    } else if (mode === 'month') {
      const monthStart = getMonthStart(selectedDate);
      const monthEnd = getMonthEnd(selectedDate);
      get().loadTimeEntriesForDateRange(monthStart, monthEnd);
    }
  },
  
  navigateToDate: (date: Date) => {
    const { viewMode } = get();
    set({ selectedDate: date });
    
    // Load appropriate data for the new date
    if (viewMode === 'day') {
      get().loadTimeEntriesForDate(date);
    } else if (viewMode === 'week') {
      const weekStart = getWeekStart(date);
      const weekEnd = getWeekEnd(date);
      get().loadTimeEntriesForDateRange(weekStart, weekEnd);
    } else if (viewMode === 'month') {
      const monthStart = getMonthStart(date);
      const monthEnd = getMonthEnd(date);
      get().loadTimeEntriesForDateRange(monthStart, monthEnd);
    }
  },
  
  navigatePrevious: () => {
    const { selectedDate, viewMode } = get();
    const newDate = new Date(selectedDate);
    
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    
    get().navigateToDate(newDate);
  },
  
  navigateNext: () => {
    const { selectedDate, viewMode } = get();
    const newDate = new Date(selectedDate);
    
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    
    get().navigateToDate(newDate);
  },
  
  // Time entries
  addTimeEntry: async (timeSlot: TimeSlot, activityData: ActivityCreationData) => {
    const { selectedDate, hasTimeConflict } = get();
    
    // Check for conflicts
    if (hasTimeConflict(timeSlot.start, timeSlot.end)) {
      throw new Error('Time slot conflicts with existing entry');
    }
    
    const newEntry: CalendarTimeEntry = {
      id: generateId(),
      date: formatDateKey(selectedDate),
      activity: activityData.activity,
      category: activityData.category,
      startTime: timeSlot.start,
      endTime: timeSlot.end,
      duration: timeSlot.duration,
      moodRating: activityData.moodRating,
      emotionalTags: activityData.emotionalTags,
      reflection: activityData.reflection,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Save to database
    await dbService.saveCalendarTimeEntry(newEntry);
    
    // Update store
    set((state) => ({
      timeEntries: [...state.timeEntries, newEntry],
      isActivityModalVisible: false,
      selection: null,
    }));
  },
  
  updateTimeEntry: async (id: string, updates: Partial<CalendarTimeEntry>) => {
    // Update in database
    await dbService.updateCalendarTimeEntry(id, updates);
    
    // Update store
    set((state) => ({
      timeEntries: state.timeEntries.map((entry) =>
        entry.id === id 
          ? { ...entry, ...updates, updatedAt: new Date() }
          : entry
      ),
      isActivityModalVisible: false,
      editingEntry: null,
    }));
  },
  
  deleteTimeEntry: async (id: string) => {
    // Delete from database
    await dbService.deleteCalendarTimeEntry(id);
    
    // Update store
    set((state) => ({
      timeEntries: state.timeEntries.filter((entry) => entry.id !== id),
      isActivityModalVisible: false,
      editingEntry: null,
    }));
  },
  
  loadTimeEntriesForDate: async (date: Date) => {
    const dateKey = formatDateKey(date);
    
    try {
      // Load from database
      const entries = await dbService.getCalendarTimeEntriesForDate(dateKey);
      
      // Update store
      set({ timeEntries: entries });
    } catch (error) {
      console.error('Error loading time entries:', error);
      // Fallback to empty entries
      set({ timeEntries: [] });
    }
  },
  
  loadTimeEntriesForDateRange: async (startDate: Date, endDate: Date) => {
    try {
      // Load all entries from database
      const allEntries = await dbService.getCalendarTimeEntries();
      
      // Filter entries within the date range
      const startDateKey = formatDateKey(startDate);
      const endDateKey = formatDateKey(endDate);
      
      const filteredEntries = allEntries.filter(entry => {
        return entry.date >= startDateKey && entry.date <= endDateKey;
      });
      
      // Update store
      set({ timeEntries: filteredEntries });
    } catch (error) {
      console.error('Error loading time entries for date range:', error);
      // Fallback to empty entries
      set({ timeEntries: [] });
    }
  },
  
  // Selection
  startSelection: (startTime: Date) => {
    set({
      selection: {
        startTime,
        endTime: startTime,
        isSelecting: true,
        selectedSlots: [],
      },
    });
  },
  
  updateSelection: (endTime: Date) => {
    set((state) => {
      if (!state.selection) return state;
      
      const startTime = state.selection.startTime;
      const actualStart = startTime < endTime ? startTime : endTime;
      const actualEnd = startTime < endTime ? endTime : startTime;
      
      // Generate slots for the selection
      const slots: TimeSlot[] = [];
      const slotDuration = state.slotDuration;
      let currentTime = new Date(actualStart);
      
      while (currentTime < actualEnd) {
        const slotEnd = new Date(currentTime);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);
        
        if (slotEnd <= actualEnd) {
          slots.push({
            start: new Date(currentTime),
            end: slotEnd,
            duration: slotDuration,
          });
        }
        
        currentTime = slotEnd;
      }
      
      return {
        selection: {
          startTime: actualStart,
          endTime: actualEnd,
          isSelecting: state.selection.isSelecting,
          selectedSlots: slots,
        },
      };
    });
  },
  
  clearSelection: () => {
    set({ selection: null });
  },
  
  // Activity modal
  openActivityModal: (timeSlot?: TimeSlot) => {
    set({ 
      isActivityModalVisible: true,
      editingEntry: null,
    });
  },
  
  openEditModal: (entry: CalendarTimeEntry) => {
    set({
      isActivityModalVisible: true,
      editingEntry: entry,
    });
  },
  
  closeActivityModal: () => {
    set({
      isActivityModalVisible: false,
      editingEntry: null,
    });
  },
  
  // Utils
  getTimeEntriesForDate: (date: Date) => {
    const dateKey = formatDateKey(date);
    return get().timeEntries.filter(entry => entry.date === dateKey);
  },
  
  hasTimeConflict: (startTime: Date, endTime: Date, excludeId?: string) => {
    const { timeEntries } = get();
    const relevantEntries = excludeId 
      ? timeEntries.filter(entry => entry.id !== excludeId)
      : timeEntries;
    
    return relevantEntries.some(entry => {
      const newStart = startTime.getTime();
      const newEnd = endTime.getTime();
      const existingStart = entry.startTime.getTime();
      const existingEnd = entry.endTime.getTime();
      
      // Check if there's any overlap
      return (newStart < existingEnd && newEnd > existingStart);
    });
  },
})); 