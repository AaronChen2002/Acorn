import { EmotionalCheckIn, Reflection, TimeEntry, Insight, MorningCheckInData } from '../types';
import { CalendarTimeEntry } from '../types/calendar';

// Web-compatible database service using localStorage for development
class WebDatabaseService {
  private getStorageKey(table: string): string {
    return `acorn_${table}`;
  }

  private getFromStorage<T>(table: string): T[] {
    try {
      const data = localStorage.getItem(this.getStorageKey(table));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading from localStorage for table ${table}:`, error);
      return [];
    }
  }

  private saveToStorage<T>(table: string, data: T[]): void {
    try {
      localStorage.setItem(this.getStorageKey(table), JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to localStorage for table ${table}:`, error);
    }
  }

  // Initialize tables (no-op for localStorage)
  private initializeTables() {
    // localStorage doesn't need table creation
    console.log('Web database initialized with localStorage');
  }

  constructor() {
    this.initializeTables();
  }

  // Morning check-in operations
  async saveMorningCheckIn(checkIn: MorningCheckInData): Promise<void> {
    const checkIns = this.getFromStorage<MorningCheckInData>('morning_checkins');
    const existingIndex = checkIns.findIndex(c => c.date === checkIn.date);
    
    if (existingIndex >= 0) {
      checkIns[existingIndex] = checkIn;
    } else {
      checkIns.push(checkIn);
    }
    
    this.saveToStorage('morning_checkins', checkIns);
  }

  async getMorningCheckIns(): Promise<MorningCheckInData[]> {
    return this.getFromStorage<MorningCheckInData>('morning_checkins')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getMorningCheckInByDate(date: string): Promise<MorningCheckInData | null> {
    const checkIns = this.getFromStorage<MorningCheckInData>('morning_checkins');
    return checkIns.find(c => c.date === date) || null;
  }

  // Check-in operations
  async saveCheckIn(checkIn: EmotionalCheckIn): Promise<void> {
    const checkIns = this.getFromStorage<EmotionalCheckIn>('check_ins');
    const existingIndex = checkIns.findIndex(c => c.id === checkIn.id);
    
    if (existingIndex >= 0) {
      checkIns[existingIndex] = checkIn;
    } else {
      checkIns.push(checkIn);
    }
    
    this.saveToStorage('check_ins', checkIns);
  }

  async getCheckIns(): Promise<EmotionalCheckIn[]> {
    return this.getFromStorage<EmotionalCheckIn>('check_ins')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Reflection operations
  async saveReflection(reflection: Reflection): Promise<void> {
    const reflections = this.getFromStorage<Reflection>('reflections');
    const existingIndex = reflections.findIndex(r => r.id === reflection.id);
    
    if (existingIndex >= 0) {
      reflections[existingIndex] = reflection;
    } else {
      reflections.push(reflection);
    }
    
    this.saveToStorage('reflections', reflections);
  }

  async getReflections(): Promise<Reflection[]> {
    return this.getFromStorage<Reflection>('reflections')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Time entry operations (original)
  async saveTimeEntry(entry: TimeEntry): Promise<void> {
    const entries = this.getFromStorage<TimeEntry>('time_entries');
    const existingIndex = entries.findIndex(e => e.id === entry.id);
    
    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }
    
    this.saveToStorage('time_entries', entries);
  }

  async getTimeEntries(): Promise<TimeEntry[]> {
    return this.getFromStorage<TimeEntry>('time_entries')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Calendar time entry operations (Phase 6)
  async saveCalendarTimeEntry(entry: CalendarTimeEntry): Promise<void> {
    const entries = this.getFromStorage<CalendarTimeEntry>('calendar_time_entries');
    const existingIndex = entries.findIndex(e => e.id === entry.id);
    
    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }
    
    this.saveToStorage('calendar_time_entries', entries);
  }

  async getCalendarTimeEntries(): Promise<CalendarTimeEntry[]> {
    const entries = this.getFromStorage<CalendarTimeEntry>('calendar_time_entries');
    
    // Convert string dates back to Date objects
    return entries.map(entry => ({
      ...entry,
      startTime: new Date(entry.startTime),
      endTime: new Date(entry.endTime),
      createdAt: new Date(entry.createdAt),
      updatedAt: new Date(entry.updatedAt),
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getCalendarTimeEntriesForDate(date: string): Promise<CalendarTimeEntry[]> {
    const entries = this.getFromStorage<CalendarTimeEntry>('calendar_time_entries');
    
    return entries
      .filter(entry => entry.date === date)
      .map(entry => ({
        ...entry,
        startTime: new Date(entry.startTime),
        endTime: new Date(entry.endTime),
        createdAt: new Date(entry.createdAt),
        updatedAt: new Date(entry.updatedAt),
      }))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async updateCalendarTimeEntry(id: string, updates: Partial<CalendarTimeEntry>): Promise<void> {
    const entries = this.getFromStorage<CalendarTimeEntry>('calendar_time_entries');
    const existingIndex = entries.findIndex(e => e.id === id);
    
    if (existingIndex === -1) {
      throw new Error('Calendar time entry not found');
    }
    
    const existing = entries[existingIndex];
    const updatedEntry: CalendarTimeEntry = {
      ...existing,
      ...updates,
      startTime: updates.startTime || new Date(existing.startTime),
      endTime: updates.endTime || new Date(existing.endTime),
      createdAt: new Date(existing.createdAt),
      updatedAt: new Date(),
    };
    
    entries[existingIndex] = updatedEntry;
    this.saveToStorage('calendar_time_entries', entries);
  }

  async deleteCalendarTimeEntry(id: string): Promise<void> {
    const entries = this.getFromStorage<CalendarTimeEntry>('calendar_time_entries');
    const filteredEntries = entries.filter(e => e.id !== id);
    this.saveToStorage('calendar_time_entries', filteredEntries);
  }

  // Insight operations
  async saveInsight(insight: Insight): Promise<void> {
    const insights = this.getFromStorage<Insight>('insights');
    const existingIndex = insights.findIndex(i => i.id === insight.id);
    
    if (existingIndex >= 0) {
      insights[existingIndex] = insight;
    } else {
      insights.push(insight);
    }
    
    this.saveToStorage('insights', insights);
  }

  async getInsights(): Promise<Insight[]> {
    return this.getFromStorage<Insight>('insights')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Utility operations
  async deleteEntry(table: string, id: string): Promise<void> {
    const entries = this.getFromStorage<any>(table);
    const filteredEntries = entries.filter((e: any) => e.id !== id);
    this.saveToStorage(table, filteredEntries);
  }

  async clearAllData(): Promise<void> {
    const tables = [
      'check_ins',
      'morning_checkins', 
      'reflections',
      'time_entries',
      'calendar_time_entries',
      'insights'
    ];
    
    tables.forEach(table => {
      localStorage.removeItem(this.getStorageKey(table));
    });
    
    console.log('All data cleared from localStorage');
  }
}

export const webDatabaseService = new WebDatabaseService(); 