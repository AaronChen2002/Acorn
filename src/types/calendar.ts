// Calendar-specific types for Phase 6 development

export interface TimeSlot {
  start: Date;
  end: Date;
  duration: number; // in minutes
}

export interface CalendarTimeEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  activity: string;
  category: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  
  // Emotional context (Phase 6)
  moodRating?: number; // 1-6 scale with emojis
  emotionalTags: string[]; // ['focused', 'stressed', 'collaborative', etc.]
  reflection?: string; // Quick notes about the activity
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarSelection {
  startTime: Date;
  endTime: Date;
  isSelecting: boolean;
  selectedSlots: TimeSlot[];
}

export interface CalendarState {
  // Current date being viewed
  selectedDate: Date;
  
  // Time entries for the current date
  timeEntries: CalendarTimeEntry[];
  
  // Current selection state
  selection: CalendarSelection | null;
  
  // UI state
  isActivityModalVisible: boolean;
  editingEntry: CalendarTimeEntry | null;
  
  // Calendar view settings
  viewStartHour: number; // Default 6 AM
  viewEndHour: number; // Default 11 PM
  slotDuration: number; // Default 15 minutes
}

export interface ActivityCreationData {
  activity: string;
  category: string;
  moodRating?: number;
  emotionalTags: string[];
  reflection?: string;
}

export interface CalendarGridProps {
  date: Date;
  timeEntries: CalendarTimeEntry[];
  selection: CalendarSelection | null;
  onTimeSlotPress: (time: Date) => void;
  onTimeSlotDrag: (startTime: Date, endTime: Date) => void;
  onEntryPress: (entry: CalendarTimeEntry) => void;
}

export interface ActivityModalProps {
  isVisible: boolean;
  selectedTimeSlot: TimeSlot | null;
  editingEntry: CalendarTimeEntry | null;
  onSave: (data: ActivityCreationData) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

// Emotional tags for activities
export const EMOTIONAL_TAGS = [
  { key: 'focused', label: 'Focused', emoji: '🎯' },
  { key: 'stressed', label: 'Stressed', emoji: '😰' },
  { key: 'collaborative', label: 'Collaborative', emoji: '🤝' },
  { key: 'creative', label: 'Creative', emoji: '🎨' },
  { key: 'energized', label: 'Energized', emoji: '⚡' },
  { key: 'calm', label: 'Calm', emoji: '😌' },
  { key: 'rushed', label: 'Rushed', emoji: '⏰' },
  { key: 'productive', label: 'Productive', emoji: '✅' },
  { key: 'learning', label: 'Learning', emoji: '📚' },
  { key: 'social', label: 'Social', emoji: '👥' },
  { key: 'challenging', label: 'Challenging', emoji: '🔥' },
  { key: 'routine', label: 'Routine', emoji: '🔄' },
];

// Mood ratings with emojis (1-6 scale)
export const MOOD_RATINGS = [
  { value: 1, emoji: '😫', label: 'Terrible' },
  { value: 2, emoji: '😔', label: 'Poor' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
  { value: 6, emoji: '🤩', label: 'Amazing' },
];

// Utility functions
export const formatTimeSlot = (slot: TimeSlot): string => {
  const formatTime = (date: Date) => 
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return `${formatTime(slot.start)} - ${formatTime(slot.end)}`;
};

export const createTimeSlot = (startTime: Date, endTime: Date): TimeSlot => {
  return {
    start: startTime,
    end: endTime,
    duration: Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60)),
  };
};

export const generateTimeSlots = (date: Date, startHour: number = 6, endHour: number = 23, slotDuration: number = 15): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const start = new Date(date);
      start.setHours(hour, minute, 0, 0);
      
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + slotDuration);
      
      slots.push(createTimeSlot(start, end));
    }
  }
  
  return slots;
};

export const checkTimeConflict = (newEntry: { startTime: Date; endTime: Date }, existingEntries: CalendarTimeEntry[]): boolean => {
  return existingEntries.some(entry => {
    const newStart = newEntry.startTime.getTime();
    const newEnd = newEntry.endTime.getTime();
    const existingStart = entry.startTime.getTime();
    const existingEnd = entry.endTime.getTime();
    
    // Check if there's any overlap
    return (newStart < existingEnd && newEnd > existingStart);
  });
}; 