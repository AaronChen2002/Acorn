import { create } from 'zustand';
import { Platform } from 'react-native';
import { CalendarTimeEntry, CalendarState, CalendarSelection, TimeSlot, ActivityCreationData } from '../types/calendar';
import { generateId } from './appStore';
import { databaseService } from '../services/database';
import { webDatabaseService } from '../services/webDatabase';

// Use web-compatible database service for web platform
const dbService = Platform.OS === 'web' ? webDatabaseService : databaseService;

interface CalendarStore extends CalendarState {
  // Actions
  setSelectedDate: (date: Date) => void;
  
  // Time entries
  addTimeEntry: (timeSlot: TimeSlot, activityData: ActivityCreationData) => Promise<void>;
  updateTimeEntry: (id: string, updates: Partial<CalendarTimeEntry>) => Promise<void>;
  deleteTimeEntry: (id: string) => Promise<void>;
  loadTimeEntriesForDate: (date: Date) => Promise<void>;
  
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