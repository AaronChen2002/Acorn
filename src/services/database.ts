import * as SQLite from 'expo-sqlite';
import { EmotionalCheckIn, Reflection, TimeEntry, Insight, MorningCheckInData } from '../types';
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
  type: string;
  content: string;
  metadata: string;
  date_range_start: string;
  date_range_end: string;
  created_at: string;
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

    // Insights table
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS insights (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata TEXT,
        date_range_start TEXT,
        date_range_end TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
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

  // Insight operations
  async saveInsight(insight: Insight): Promise<void> {
    const statement = this.db.prepareSync(
      `INSERT OR REPLACE INTO insights 
       (id, type, content, metadata, date_range_start, date_range_end, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    try {
      statement.executeSync([
        insight.id,
        insight.type,
        insight.content,
        JSON.stringify(insight.metadata),
        insight.date_range_start.toISOString(),
        insight.date_range_end.toISOString(),
        insight.created_at.toISOString(),
      ]);
    } finally {
      statement.finalizeSync();
    }
  }

  async getInsights(): Promise<Insight[]> {
    const result = this.db.getAllSync(
      'SELECT * FROM insights ORDER BY created_at DESC'
    ) as InsightRow[];

    return result.map((row) => ({
      id: row.id,
      type: row.type as 'theme' | 'pattern' | 'correlation',
      content: row.content,
      metadata: JSON.parse(row.metadata || '{}'),
      date_range_start: new Date(row.date_range_start),
      date_range_end: new Date(row.date_range_end),
      created_at: new Date(row.created_at),
    }));
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

  async clearAllData(): Promise<void> {
    this.db.execSync('DELETE FROM check_ins');
    this.db.execSync('DELETE FROM morning_checkins');
    this.db.execSync('DELETE FROM reflections');
    this.db.execSync('DELETE FROM time_entries');
    this.db.execSync('DELETE FROM insights');
  }
}

export const databaseService = new DatabaseService();
