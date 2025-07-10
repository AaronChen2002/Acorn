import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { EmotionalCheckIn, Reflection, TimeEntry, Insight, MorningCheckInData } from '../types';
import { CalendarTimeEntry } from '../types/calendar';
import { DB_CONFIG } from '../constants';

// Database result type definitions
interface MorningCheckInRow {
  id: string;
  date: string;
  energy_level: number;
  positivity_level: number;
  emotions: string;
  reflection_prompt: string;
  reflection_response: string;
  notes: string | null;
  completed_at: string;
}

interface CheckInRow {
  id: string;
  date: string;
  energy_level: number;
  positivity_level: number;
  emotions: string;
  description: string | null;
  created_at: string;
}

interface ReflectionRow {
  id: string;
  date: string;
  type: string;
  content: string;
  tags: string;
  created_at: string;
}

interface TimeEntryRow {
  id: string;
  date: string;
  activity: string;
  category: string;
  start_time: string;
  end_time: string;
  tags: string;
  created_at: string;
}

interface InsightRow {
  id: string;
  content: string;
  type: string;
  icon: string;
  time_period: string;
  period_start: string;
  period_end: string;
  data_hash: string;
  data_version: number;
  generated_at: string;
  metadata: string | null;
  created_at: string;
}

interface CalendarTimeEntryRow {
  id: string;
  date: string;
  activity: string;
  category: string;
  start_time: string;
  end_time: string;
  duration: number;
  mood_rating: number | null;
  emotional_tags: string;
  reflection: string | null;
  created_at: string;
  updated_at: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabaseSync(DB_CONFIG.name);
    this.initializeTables();
  }

  private initializeTables() {
    // Emotional check-ins table (updated column names)
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS check_ins (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        energy_level INTEGER,
        positivity_level INTEGER,
        emotions TEXT,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Morning check-ins table
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS morning_checkins (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        energy_level INTEGER NOT NULL,
        positivity_level INTEGER NOT NULL,
        emotions TEXT NOT NULL,
        reflection_prompt TEXT NOT NULL,
        reflection_response TEXT NOT NULL,
        notes TEXT,
        completed_at TEXT NOT NULL,
        UNIQUE(date)
      )
    `);

    // Reflections table
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS reflections (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Time entries table
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS time_entries (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        activity TEXT NOT NULL,
        category TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        tags TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Enhanced insights table for caching
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS insights (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        icon TEXT NOT NULL,
        time_period TEXT NOT NULL,
        period_start TEXT NOT NULL,
        period_end TEXT NOT NULL,
        data_hash TEXT NOT NULL,
        data_version INTEGER DEFAULT 1,
        generated_at TEXT NOT NULL,
        metadata TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Index for efficient period-based queries
    this.db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_insights_period 
      ON insights(time_period, period_start, period_end)
    `);

    // Index for data version tracking
    this.db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_insights_hash 
      ON insights(data_hash, time_period)
    `);

    // Calendar time entries table (Phase 6)
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS calendar_time_entries (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        activity TEXT NOT NULL,
        category TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        duration INTEGER NOT NULL,
        mood_rating INTEGER,
        emotional_tags TEXT,
        reflection TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
  }

  // Morning check-in operations
  async saveMorningCheckIn(checkIn: MorningCheckInData): Promise<void> {
    const statement = this.db.prepareSync(
      `INSERT OR REPLACE INTO morning_checkins 
       (id, date, energy_level, positivity_level, emotions, reflection_prompt, reflection_response, notes, completed_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    try {
      statement.executeSync([
        checkIn.id,
        checkIn.date,
        checkIn.energyLevel,
        checkIn.positivityLevel,
        JSON.stringify(checkIn.emotions),
        checkIn.reflectionPrompt,
        checkIn.reflectionResponse,
        checkIn.notes || null,
        checkIn.completedAt.toISOString(),
      ]);
    } finally {
      statement.finalizeSync();
    }
  }

  async getMorningCheckIns(): Promise<MorningCheckInData[]> {
    const result = this.db.getAllSync(
      'SELECT * FROM morning_checkins ORDER BY date DESC'
    ) as MorningCheckInRow[];

    return result.map((row) => ({
      id: row.id,
      date: row.date,
      energyLevel: row.energy_level,
      positivityLevel: row.positivity_level,
      emotions: JSON.parse(row.emotions || '[]'),
      reflectionPrompt: row.reflection_prompt,
      reflectionResponse: row.reflection_response,
      notes: row.notes || undefined,
      completedAt: new Date(row.completed_at),
    }));
  }

  async getMorningCheckInByDate(date: string): Promise<MorningCheckInData | null> {
    const result = this.db.getFirstSync(
      'SELECT * FROM morning_checkins WHERE date = ?',
      [date]
    ) as MorningCheckInRow | null;

    if (!result) return null;

    return {
      id: result.id,
      date: result.date,
      energyLevel: result.energy_level,
      positivityLevel: result.positivity_level,
      emotions: JSON.parse(result.emotions || '[]'),
      reflectionPrompt: result.reflection_prompt,
      reflectionResponse: result.reflection_response,
      notes: result.notes || undefined,
      completedAt: new Date(result.completed_at),
    };
  }

  // Check-in operations (updated to use new column names)
  async saveCheckIn(checkIn: EmotionalCheckIn): Promise<void> {
    const statement = this.db.prepareSync(
      `INSERT OR REPLACE INTO check_ins 
       (id, date, energy_level, positivity_level, emotions, description, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    try {
      statement.executeSync([
        checkIn.id,
        checkIn.date.toISOString(),
        checkIn.energyLevel,
        checkIn.positivityLevel,
        JSON.stringify(checkIn.emotions),
        checkIn.description || null,
        checkIn.created_at.toISOString(),
      ]);
    } finally {
      statement.finalizeSync();
    }
  }

  async getCheckIns(): Promise<EmotionalCheckIn[]> {
    const result = this.db.getAllSync(
      'SELECT * FROM check_ins ORDER BY date DESC'
    ) as CheckInRow[];

    return result.map((row) => ({
      id: row.id,
      date: new Date(row.date),
      energyLevel: row.energy_level,
      positivityLevel: row.positivity_level,
      emotions: JSON.parse(row.emotions || '[]'),
      description: row.description || undefined,
      created_at: new Date(row.created_at),
    }));
  }

  // Reflection operations
  async saveReflection(reflection: Reflection): Promise<void> {
    const statement = this.db.prepareSync(
      `INSERT OR REPLACE INTO reflections 
       (id, date, type, content, tags, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    try {
      statement.executeSync([
        reflection.id,
        reflection.date.toISOString(),
        reflection.type,
        reflection.content,
        JSON.stringify(reflection.tags),
        reflection.created_at.toISOString(),
      ]);
    } finally {
      statement.finalizeSync();
    }
  }

  async getReflections(): Promise<Reflection[]> {
    const result = this.db.getAllSync(
      'SELECT * FROM reflections ORDER BY date DESC'
    ) as ReflectionRow[];

    return result.map((row) => ({
      id: row.id,
      date: new Date(row.date),
      type: row.type as 'daily_prompt',
      content: row.content,
      tags: JSON.parse(row.tags || '[]'),
      created_at: new Date(row.created_at),
    }));
  }

  // Time entry operations
  async saveTimeEntry(entry: TimeEntry): Promise<void> {
    const statement = this.db.prepareSync(
      `INSERT OR REPLACE INTO time_entries 
       (id, date, activity, category, start_time, end_time, tags, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    try {
      statement.executeSync([
        entry.id,
        entry.date.toISOString(),
        entry.activity,
        entry.category,
        entry.start_time.toISOString(),
        entry.end_time.toISOString(),
        JSON.stringify(entry.tags),
        entry.created_at.toISOString(),
      ]);
    } finally {
      statement.finalizeSync();
    }
  }

  async getTimeEntries(): Promise<TimeEntry[]> {
    const result = this.db.getAllSync(
      'SELECT * FROM time_entries ORDER BY date DESC, start_time DESC'
    ) as TimeEntryRow[];

    return result.map((row) => ({
      id: row.id,
      date: new Date(row.date),
      activity: row.activity,
      category: row.category,
      start_time: new Date(row.start_time),
      end_time: new Date(row.end_time),
      tags: JSON.parse(row.tags || '[]'),
      created_at: new Date(row.created_at),
    }));
  }

  // Enhanced insight operations for caching
  async saveInsight(insight: Insight): Promise<void> {
    const statement = this.db.prepareSync(
      `INSERT OR REPLACE INTO insights 
       (id, content, type, icon, time_period, period_start, period_end, data_hash, data_version, generated_at, metadata) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    try {
      statement.executeSync([
        insight.id,
        insight.content,
        insight.type,
        insight.icon,
        insight.timePeriod,
        insight.periodStart.toISOString(),
        insight.periodEnd.toISOString(),
        insight.dataHash,
        insight.dataVersion,
        insight.generatedAt.toISOString(),
        insight.metadata ? JSON.stringify(insight.metadata) : null,
      ]);
    } finally {
      statement.finalizeSync();
    }
  }

  async getInsights(): Promise<Insight[]> {
    const result = this.db.getAllSync(
      'SELECT * FROM insights ORDER BY generated_at DESC'
    ) as InsightRow[];

    return result.map((row) => ({
      id: row.id,
      content: row.content,
      type: row.type as 'trend' | 'pattern' | 'correlation' | 'habit' | 'energy' | 'productivity',
      icon: row.icon,
      timePeriod: row.time_period as 'week' | 'month' | 'quarter' | 'year',
      periodStart: new Date(row.period_start),
      periodEnd: new Date(row.period_end),
      dataHash: row.data_hash,
      dataVersion: row.data_version,
      generatedAt: new Date(row.generated_at),
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      createdAt: new Date(row.created_at),
    }));
  }

  // New methods for insight caching
  async getInsightsForPeriod(timePeriod: 'week' | 'month' | 'quarter', periodStart: Date, periodEnd: Date): Promise<Insight[]> {
    const result = this.db.getAllSync(
      'SELECT * FROM insights WHERE time_period = ? AND period_start = ? AND period_end = ? ORDER BY generated_at DESC',
      [timePeriod, periodStart.toISOString(), periodEnd.toISOString()]
    ) as InsightRow[];

    return result.map((row) => ({
      id: row.id,
      content: row.content,
      type: row.type as 'trend' | 'pattern' | 'correlation' | 'habit' | 'energy' | 'productivity',
      icon: row.icon,
      timePeriod: row.time_period as 'week' | 'month' | 'quarter' | 'year',
      periodStart: new Date(row.period_start),
      periodEnd: new Date(row.period_end),
      dataHash: row.data_hash,
      dataVersion: row.data_version,
      generatedAt: new Date(row.generated_at),
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      createdAt: new Date(row.created_at),
    }));
  }

  async getInsightsByDataHash(dataHash: string, timePeriod: 'week' | 'month' | 'quarter'): Promise<Insight[]> {
    const result = this.db.getAllSync(
      'SELECT * FROM insights WHERE data_hash = ? AND time_period = ? ORDER BY generated_at DESC',
      [dataHash, timePeriod]
    ) as InsightRow[];

    return result.map((row) => ({
      id: row.id,
      content: row.content,
      type: row.type as 'trend' | 'pattern' | 'correlation' | 'habit' | 'energy' | 'productivity',
      icon: row.icon,
      timePeriod: row.time_period as 'week' | 'month' | 'quarter' | 'year',
      periodStart: new Date(row.period_start),
      periodEnd: new Date(row.period_end),
      dataHash: row.data_hash,
      dataVersion: row.data_version,
      generatedAt: new Date(row.generated_at),
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      createdAt: new Date(row.created_at),
    }));
  }

  async deleteOldInsights(olderThan: Date): Promise<void> {
    const statement = this.db.prepareSync('DELETE FROM insights WHERE generated_at < ?');
    try {
      statement.executeSync([olderThan.toISOString()]);
    } finally {
      statement.finalizeSync();
    }
  }

  // Utility operations
  async deleteEntry(table: string, id: string): Promise<void> {
    const statement = this.db.prepareSync(`DELETE FROM ${table} WHERE id = ?`);
    try {
      statement.executeSync([id]);
    } finally {
      statement.finalizeSync();
    }
  }

  // Calendar time entry operations (Phase 6)
  async saveCalendarTimeEntry(entry: CalendarTimeEntry): Promise<void> {
    const statement = this.db.prepareSync(
      `INSERT OR REPLACE INTO calendar_time_entries 
       (id, date, activity, category, start_time, end_time, duration, mood_rating, emotional_tags, reflection, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    try {
      statement.executeSync([
        entry.id,
        entry.date,
        entry.activity,
        entry.category,
        entry.startTime.toISOString(),
        entry.endTime.toISOString(),
        entry.duration,
        entry.moodRating || null,
        JSON.stringify(entry.emotionalTags),
        entry.reflection || null,
        entry.createdAt.toISOString(),
        entry.updatedAt.toISOString(),
      ]);
    } finally {
      statement.finalizeSync();
    }
  }

  async getCalendarTimeEntries(): Promise<CalendarTimeEntry[]> {
    const result = this.db.getAllSync(
      'SELECT * FROM calendar_time_entries ORDER BY date DESC, start_time DESC'
    ) as CalendarTimeEntryRow[];

    return result.map((row) => ({
      id: row.id,
      date: row.date,
      activity: row.activity,
      category: row.category,
      startTime: new Date(row.start_time),
      endTime: new Date(row.end_time),
      duration: row.duration,
      moodRating: row.mood_rating || undefined,
      emotionalTags: JSON.parse(row.emotional_tags || '[]'),
      reflection: row.reflection || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async getCalendarTimeEntriesForDate(date: string): Promise<CalendarTimeEntry[]> {
    const result = this.db.getAllSync(
      'SELECT * FROM calendar_time_entries WHERE date = ? ORDER BY start_time ASC',
      [date]
    ) as CalendarTimeEntryRow[];

    return result.map((row) => ({
      id: row.id,
      date: row.date,
      activity: row.activity,
      category: row.category,
      startTime: new Date(row.start_time),
      endTime: new Date(row.end_time),
      duration: row.duration,
      moodRating: row.mood_rating || undefined,
      emotionalTags: JSON.parse(row.emotional_tags || '[]'),
      reflection: row.reflection || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async updateCalendarTimeEntry(id: string, updates: Partial<CalendarTimeEntry>): Promise<void> {
    // First get the existing entry
    const existing = this.db.getFirstSync(
      'SELECT * FROM calendar_time_entries WHERE id = ?',
      [id]
    ) as CalendarTimeEntryRow | null;

    if (!existing) {
      throw new Error('Calendar time entry not found');
    }

    // Merge updates with existing data
    const updatedEntry: CalendarTimeEntry = {
      id: existing.id,
      date: existing.date,
      activity: updates.activity || existing.activity,
      category: updates.category || existing.category,
      startTime: updates.startTime || new Date(existing.start_time),
      endTime: updates.endTime || new Date(existing.end_time),
      duration: updates.duration || existing.duration,
      moodRating: updates.moodRating !== undefined ? updates.moodRating : (existing.mood_rating || undefined),
      emotionalTags: updates.emotionalTags || JSON.parse(existing.emotional_tags || '[]'),
      reflection: updates.reflection !== undefined ? updates.reflection : (existing.reflection || undefined),
      createdAt: new Date(existing.created_at),
      updatedAt: new Date(),
    };

    // Save the updated entry
    await this.saveCalendarTimeEntry(updatedEntry);
  }

  async deleteCalendarTimeEntry(id: string): Promise<void> {
    const statement = this.db.prepareSync('DELETE FROM calendar_time_entries WHERE id = ?');
    try {
      statement.executeSync([id]);
    } finally {
      statement.finalizeSync();
    }
  }

  async clearAllData(): Promise<void> {
    this.db.execSync('DELETE FROM check_ins');
    this.db.execSync('DELETE FROM morning_checkins');
    this.db.execSync('DELETE FROM reflections');
    this.db.execSync('DELETE FROM time_entries');
    this.db.execSync('DELETE FROM insights');
    this.db.execSync('DELETE FROM calendar_time_entries');
  }
}

import { webDatabaseService } from './webDatabase';

// Use web-compatible database service for web platform
export const databaseService = Platform.OS === 'web' ? webDatabaseService : new DatabaseService();
