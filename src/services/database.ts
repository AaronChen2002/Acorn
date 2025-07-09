import * as SQLite from 'expo-sqlite';
import { EmotionalCheckIn, Reflection, TimeEntry, Insight } from '../types';
import { DB_CONFIG } from '../constants';

class DatabaseService {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabaseSync(DB_CONFIG.name);
    this.initializeTables();
  }

  private initializeTables() {
    // Emotional check-ins table
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS check_ins (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        mood_energy INTEGER,
        mood_positivity INTEGER,
        emotions TEXT,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
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

  // Check-in operations
  async saveCheckIn(checkIn: EmotionalCheckIn): Promise<void> {
    const statement = this.db.prepareSync(
      `INSERT OR REPLACE INTO check_ins 
       (id, date, mood_energy, mood_positivity, emotions, description, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    try {
      statement.executeSync([
        checkIn.id,
        checkIn.date.toISOString(),
        checkIn.mood_energy,
        checkIn.mood_positivity,
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
    );

    return result.map((row: any) => ({
      id: row.id,
      date: new Date(row.date),
      mood_energy: row.mood_energy,
      mood_positivity: row.mood_positivity,
      emotions: JSON.parse(row.emotions || '[]'),
      description: row.description,
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
    );

    return result.map((row: any) => ({
      id: row.id,
      date: new Date(row.date),
      type: row.type as 'worry' | 'priority',
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
    );

    return result.map((row: any) => ({
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
    );

    return result.map((row: any) => ({
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
    const tables = ['check_ins', 'reflections', 'time_entries', 'insights'];
    tables.forEach((table) => {
      this.db.execSync(`DELETE FROM ${table}`);
    });
  }
}

export const databaseService = new DatabaseService();
