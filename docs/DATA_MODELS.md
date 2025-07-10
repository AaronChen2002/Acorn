# Data Models & API Reference

This document provides comprehensive information about the data models, database structure, and API design for the Acorn app, including AI integration and caching systems.

## 📋 Table of Contents

1. [Data Models](#data-models)
2. [Database Schema](#database-schema)
3. [AI Integration Models](#ai-integration-models)
4. [Caching Models](#caching-models)
5. [Store API](#store-api)
6. [Data Flow](#data-flow)
7. [Constants & Enums](#constants--enums)
8. [Validation Rules](#validation-rules)

## 🏗️ Data Models

### Core Types

#### EmotionalCheckIn
Represents a daily emotional check-in entry.

```typescript
interface EmotionalCheckIn {
  id: string;                    // Unique identifier (UUID)
  date: Date;                    // Date object
  energyLevel: number;           // 1-10 scale
  positivityLevel: number;       // 1-10 scale
  emotions: string[];            // Array of emotion keys
  description?: string;          // Optional description
  created_at: Date;              // Timestamp
}
```

#### MorningCheckInData
Represents comprehensive morning ritual data with AI-powered prompts.

```typescript
interface MorningCheckInData {
  id: string;                    // Unique identifier (UUID)
  date: string;                  // ISO date string (YYYY-MM-DD)
  energyLevel: number;           // 1-5 scale
  positivityLevel: number;       // 1-5 scale
  focusLevel: number;            // 1-5 scale
  sleepQuality: number;          // 1-5 scale
  yesterdayCompletion: number;   // 1-5 scale
  emotions: string[];            // Array of emotion keys
  reflectionPrompt: string;      // AI-generated or static prompt
  reflectionResponse: string;    // User's response to prompt
  mainGoal: string;              // Main goal for today
  notes?: string;                // Optional additional notes
  completedAt: Date;             // When the check-in was completed
}
```

**Example:**
```typescript
const morningCheckIn: MorningCheckInData = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  date: "2024-01-15",
  energyLevel: 4,
  positivityLevel: 5,
  focusLevel: 3,
  sleepQuality: 4,
  yesterdayCompletion: 3,
  emotions: ["motivated", "optimistic", "focused"],
  reflectionPrompt: "What energy management strategy could help you maintain focus throughout your day?",
  reflectionResponse: "I'll try the Pomodoro technique with breaks every 25 minutes to maintain my energy levels.",
  mainGoal: "Complete the quarterly report and review team feedback",
  notes: "Feeling good about tackling the big project today",
  completedAt: new Date("2024-01-15T07:30:00.000Z")
};
```

#### Reflection
Represents a daily reflection journal entry.

```typescript
interface Reflection {
  id: string;                    // Unique identifier (UUID)
  date: string;                  // ISO date string (YYYY-MM-DD)
  type: 'daily_prompt';          // Reflection type
  prompt: string;                // The prompt question
  response: string;              // User's response (max 2000 chars)
  tags: string[];                // Categorization tags
  createdAt: string;            // ISO timestamp
  updatedAt: string;            // ISO timestamp
}
```

**Example:**
```typescript
const reflection: Reflection = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  date: "2024-01-15",
  type: "daily_prompt",
  prompt: "What's one thing you're grateful for today?",
  response: "I'm grateful for the supportive team I work with. Their encouragement helps me stay motivated even during challenging projects.",
  tags: ["gratitude", "work", "team", "motivation"],
  createdAt: "2024-01-15T10:15:00.000Z",
  updatedAt: "2024-01-15T10:15:00.000Z"
};
```

#### TimeEntry
Represents a basic time tracking entry.

```typescript
interface TimeEntry {
  id: string;                    // Unique identifier (UUID)
  date: Date;                    // Date object
  activity: string;              // Activity description
  category: string;              // Category key
  start_time: Date;              // Start time
  end_time: Date;                // End time
  tags: string[];                // Activity tags
  created_at: Date;              // Timestamp
}
```

#### CalendarTimeEntry
Represents enhanced calendar time tracking with emotional context.

```typescript
interface CalendarTimeEntry {
  id: string;                    // Unique identifier (UUID)
  date: string;                  // ISO date string (YYYY-MM-DD)
  activity: string;              // Activity description
  category: string;              // Category key
  startTime: Date;               // Start time
  endTime: Date;                 // End time
  duration: number;              // Duration in minutes
  moodRating?: number;           // 1-6 scale mood rating
  emotionalTags: string[];       // Emotional context tags
  reflection?: string;           // Optional reflection text
  createdAt: Date;               // Created timestamp
  updatedAt: Date;               // Updated timestamp
}
```

**Example:**
```typescript
const calendarEntry: CalendarTimeEntry = {
  id: "550e8400-e29b-41d4-a716-446655440002",
  date: "2024-01-15",
  activity: "Sprint planning meeting",
  category: "Work",
  startTime: new Date("2024-01-15T09:00:00.000Z"),
  endTime: new Date("2024-01-15T10:30:00.000Z"),
  duration: 90,
  moodRating: 5,
  emotionalTags: ["productive", "collaborative", "focused"],
  reflection: "Great alignment on sprint goals. Team is motivated and clear on priorities.",
  createdAt: new Date("2024-01-15T10:30:00.000Z"),
  updatedAt: new Date("2024-01-15T10:30:00.000Z")
};
```

#### Insight
Represents AI-generated insights and patterns with caching metadata.

```typescript
interface Insight {
  id: string;                    // Unique identifier (UUID)
  content: string;               // Insight content/description
  type: 'trend' | 'pattern' | 'correlation' | 'habit' | 'energy' | 'productivity';
  icon: string;                  // Emoji icon for visual representation
  timePeriod: 'week' | 'month' | 'quarter' | 'year';
  periodStart: Date;             // Analysis period start
  periodEnd: Date;               // Analysis period end
  dataHash: string;              // Hash of source data for cache validation
  dataVersion: number;           // Version of the data structure
  generatedAt: Date;             // When the insight was generated
  metadata?: Record<string, any>; // Additional context
  createdAt: Date;               // Created timestamp
}
```

**Example:**
```typescript
const insight: Insight = {
  id: "550e8400-e29b-41d4-a716-446655440003",
  content: "Your energy peaks on Tuesdays and Wednesdays (average 4.2/5). You report lowest energy on Mondays (3.1/5). Consider lighter schedules on Monday mornings.",
  type: "pattern",
  icon: "⚡",
  timePeriod: "week",
  periodStart: new Date("2024-01-15T00:00:00.000Z"),
  periodEnd: new Date("2024-01-21T23:59:59.999Z"),
  dataHash: "abc123def456",
  dataVersion: 1,
  generatedAt: new Date("2024-01-22T08:00:00.000Z"),
  metadata: { 
    averageEnergyByDay: { 
      monday: 3.1, 
      tuesday: 4.2, 
      wednesday: 4.2 
    } 
  },
  createdAt: new Date("2024-01-22T08:00:00.000Z")
};
```

### Utility Types

#### ActivityCategory
Represents an activity category with visual styling.

```typescript
interface ActivityCategory {
  key: string;                   // Unique category identifier
  label: string;                 // Display name
  color: string;                 // Hex color code
  icon?: string;                 // Optional icon name
}
```

#### DailyPrompt
Represents a daily reflection prompt.

```typescript
interface DailyPrompt {
  id: string;                    // Unique identifier
  question: string;              // The prompt question
  category: string;              // Prompt category
  suggestedTags: string[];       // Suggested response tags
}
```

---

## 🤖 AI Integration Models

### AI Service Models

#### ActivityCategorizationResult
Represents the result of AI activity categorization.

```typescript
interface ActivityCategorizationResult {
  category: ActivityCategory;    // Assigned category
  confidence: number;            // 0-1 confidence score
  reasoning?: string;            // Optional explanation
}
```

#### PersonalizedPromptResult
Represents an AI-generated personalized reflection prompt.

```typescript
interface PersonalizedPromptResult {
  prompt: string;                // The generated prompt
  context: string;               // Context explanation
}
```

#### CachedInsight
Represents an AI-generated insight in the format expected by the caching system.

```typescript
interface CachedInsight {
  content: string;               // Insight content
  type: 'trend' | 'pattern' | 'correlation' | 'habit' | 'energy' | 'productivity';
  icon: string;                  // Emoji icon
}
```

### AI Processing Models

#### AIDataAggregation
Represents aggregated data for AI processing.

```typescript
interface AIDataAggregation {
  checkIns: MorningCheckInData[];
  activities: CalendarTimeEntry[];
  goals: string[];
  timePeriod: 'week' | 'month' | 'quarter';
  periodStart: Date;
  periodEnd: Date;
}
```

---

## 📊 Caching Models

### Cache Metadata

#### CachedInsightResult
Represents a complete cached insight result with metadata.

```typescript
interface CachedInsightResult {
  insights: Array<{
    id: number;
    content: string;
    type: string;
    icon: string;
  }>;
  dataHash: string;
  timePeriod: 'week' | 'month' | 'quarter';
  periodStart: Date;
  periodEnd: Date;
}
```

#### CacheValidationResult
Represents cache validation status.

```typescript
interface CacheValidationResult {
  isValid: boolean;
  reason?: 'data_changed' | 'expired' | 'missing';
  currentHash: string;
  cachedHash?: string;
  cacheAge?: number;
}
```

### Cache Utility Types

#### TimePeriodBounds
Represents time period boundaries for caching.

```typescript
interface TimePeriodBounds {
  start: Date;
  end: Date;
}
```

#### DataHashComponents
Represents the components used for data hash generation.

```typescript
interface DataHashComponents {
  checkIns: string[];            // Serialized check-in data
  activities: string[];          // Serialized activity data
  goals: string[];               // Goal strings
}
```

---

## 🗄️ Database Schema

### Enhanced SQLite Tables with AI Caching

#### check_ins
```sql
CREATE TABLE check_ins (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
  positivity_level INTEGER NOT NULL CHECK (positivity_level >= 1 AND positivity_level <= 10),
  emotions TEXT NOT NULL,        -- JSON array of emotion keys
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_check_ins_date ON check_ins(date);
CREATE INDEX idx_check_ins_created_at ON check_ins(created_at);
```

#### morning_checkins
```sql
CREATE TABLE morning_checkins (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 5),
  positivity_level INTEGER NOT NULL CHECK (positivity_level >= 1 AND positivity_level <= 5),
  emotions TEXT NOT NULL,        -- JSON array of emotion keys
  reflection_prompt TEXT NOT NULL,
  reflection_response TEXT NOT NULL,
  notes TEXT,
  completed_at TEXT NOT NULL,
  
  UNIQUE(date)                   -- One check-in per day
);

CREATE INDEX idx_morning_checkins_date ON morning_checkins(date);
CREATE INDEX idx_morning_checkins_completed_at ON morning_checkins(completed_at);
```

#### reflections
```sql
CREATE TABLE reflections (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'daily_prompt',
  content TEXT NOT NULL,
  tags TEXT NOT NULL,            -- JSON array of tags
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reflections_date ON reflections(date);
CREATE INDEX idx_reflections_type ON reflections(type);
```

#### time_entries
```sql
CREATE TABLE time_entries (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  activity TEXT NOT NULL,
  category TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  tags TEXT,                     -- JSON array of tags
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_time_entries_date ON time_entries(date);
CREATE INDEX idx_time_entries_category ON time_entries(category);
```

#### calendar_time_entries
```sql
CREATE TABLE calendar_time_entries (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  activity TEXT NOT NULL,
  category TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration INTEGER NOT NULL,
  mood_rating INTEGER,           -- 1-6 scale
  emotional_tags TEXT,           -- JSON array of emotional tags
  reflection TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_calendar_entries_date ON calendar_time_entries(date);
CREATE INDEX idx_calendar_entries_category ON calendar_time_entries(category);
CREATE INDEX idx_calendar_entries_start_time ON calendar_time_entries(start_time);
```

#### insights (AI Caching System)
```sql
CREATE TABLE insights (
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
  metadata TEXT,                 -- JSON metadata
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes for caching
CREATE INDEX idx_insights_period ON insights(time_period, period_start, period_end);
CREATE INDEX idx_insights_hash ON insights(data_hash, time_period);
CREATE INDEX idx_insights_generated_at ON insights(generated_at);
```

### Database Operations

#### Connection Management
```typescript
// database.ts
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('acorn.db');

export const initDB = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // Create tables
      tx.executeSql(CREATE_EMOTIONAL_CHECKINS_TABLE);
      tx.executeSql(CREATE_REFLECTIONS_TABLE);
      tx.executeSql(CREATE_TIME_ENTRIES_TABLE);
      
      // Create indexes
      tx.executeSql(CREATE_INDEXES);
    }, reject, resolve);
  });
};
```

#### CRUD Operations
```typescript
// Example: Save emotional check-in
export const saveEmotionalCheckIn = async (checkIn: EmotionalCheckIn): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT OR REPLACE INTO emotional_checkins 
         (id, date, energy_level, positivity_level, emotions, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          checkIn.id,
          checkIn.date,
          checkIn.energyLevel,
          checkIn.positivityLevel,
          JSON.stringify(checkIn.emotions),
          checkIn.notes,
          checkIn.createdAt,
          checkIn.updatedAt
        ],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};
```

---

## 🔄 Store API

### Zustand Store Structure

```typescript
interface AppState {
  // Data State
  emotionalCheckIns: EmotionalCheckIn[];
  reflections: Reflection[];
  timeEntries: TimeEntry[];
  insights: Insight[];
  
  // UI State
  currentScreen: 'checkin' | 'reflection' | 'timetracking';
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addEmotionalCheckIn: (checkIn: Omit<EmotionalCheckIn, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEmotionalCheckIn: (id: string, updates: Partial<EmotionalCheckIn>) => Promise<void>;
  deleteEmotionalCheckIn: (id: string) => Promise<void>;
  getEmotionalCheckIn: (date: string) => EmotionalCheckIn | null;
  
  addReflection: (reflection: Omit<Reflection, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateReflection: (id: string, updates: Partial<Reflection>) => Promise<void>;
  deleteReflection: (id: string) => Promise<void>;
  getReflection: (date: string) => Reflection | null;
  
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => Promise<void>;
  deleteTimeEntry: (id: string) => Promise<void>;
  getTimeEntriesByDate: (date: string) => TimeEntry[];
  
  // Utility Actions
  loadData: () => Promise<void>;
  initialize: () => Promise<void>;
  setCurrentScreen: (screen: string) => void;
  setError: (error: string | null) => void;
}
```

### Store Implementation Example

```typescript
export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  emotionalCheckIns: [],
  reflections: [],
  timeEntries: [],
  insights: [],
  currentScreen: 'checkin',
  isLoading: false,
  error: null,
  
  // Actions
  addEmotionalCheckIn: async (checkInData) => {
    try {
      set({ isLoading: true, error: null });
      
      const checkIn: EmotionalCheckIn = {
        id: generateId(),
        ...checkInData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to database
      await saveEmotionalCheckIn(checkIn);
      
      // Update state
      set((state) => ({
        emotionalCheckIns: [...state.emotionalCheckIns, checkIn],
        isLoading: false
      }));
      
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  getEmotionalCheckIn: (date) => {
    const { emotionalCheckIns } = get();
    return emotionalCheckIns.find(checkIn => checkIn.date === date) || null;
  },
  
  // ... other actions
}));
```

---

## 🔄 Data Flow

### Data Flow Patterns

#### 1. User Input → Store → Database
```typescript
// User submits emotional check-in
const handleSubmit = async () => {
  await addEmotionalCheckIn({
    date: today,
    energyLevel: 7,
    positivityLevel: 8,
    emotions: ['happy', 'focused'],
    notes: 'Great day!'
  });
};

// Flow: UI → Store Action → Database Save → State Update → UI Re-render
```

#### 2. App Initialization → Database → Store
```typescript
// App startup
const initializeApp = async () => {
  await initialize();  // Store action
  await loadData();    // Load from database
};

// Flow: App Start → Store Initialize → Database Load → State Populate → UI Render
```

#### 3. Data Retrieval → Store → UI
```typescript
// Component data subscription
const CheckInScreen = () => {
  const todayCheckIn = useAppStore(state => 
    state.getEmotionalCheckIn(today)
  );
  
  // Flow: Component Mount → Store Selector → Data Retrieve → UI Display
};
```

### Cross-Platform Data Handling

#### Web Platform
```typescript
// Web: sessionStorage fallback
const webStorageService = {
  save: (key: string, data: any) => {
    sessionStorage.setItem(key, JSON.stringify(data));
  },
  
  load: (key: string) => {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
};
```

#### Mobile Platform
```typescript
// Mobile: SQLite database
const mobileStorageService = {
  save: async (table: string, data: any) => {
    await saveToDatabase(table, data);
  },
  
  load: async (table: string, query: string) => {
    return await loadFromDatabase(table, query);
  }
};
```

---

## 📊 Constants & Enums

### Emotions
```typescript
export const EMOTIONS = [
  { key: 'happy', emoji: '😊', label: 'Happy' },
  { key: 'excited', emoji: '🤩', label: 'Excited' },
  { key: 'calm', emoji: '😌', label: 'Calm' },
  { key: 'focused', emoji: '🎯', label: 'Focused' },
  { key: 'tired', emoji: '😴', label: 'Tired' },
  { key: 'stressed', emoji: '😰', label: 'Stressed' },
  { key: 'anxious', emoji: '😟', label: 'Anxious' },
  { key: 'frustrated', emoji: '😤', label: 'Frustrated' },
  { key: 'sad', emoji: '😢', label: 'Sad' },
  { key: 'angry', emoji: '😠', label: 'Angry' },
  { key: 'overwhelmed', emoji: '😵', label: 'Overwhelmed' },
  { key: 'confident', emoji: '😎', label: 'Confident' },
  { key: 'grateful', emoji: '🙏', label: 'Grateful' },
  { key: 'creative', emoji: '💡', label: 'Creative' },
  { key: 'peaceful', emoji: '☮️', label: 'Peaceful' }
] as const;

export type EmotionKey = typeof EMOTIONS[number]['key'];
```

### Activity Categories
```typescript
export const ACTIVITY_CATEGORIES = [
  { key: 'work', label: 'Work', color: '#3B82F6' },
  { key: 'meetings', label: 'Meetings', color: '#8B5CF6' },
  { key: 'learning', label: 'Learning', color: '#10B981' },
  { key: 'exercise', label: 'Exercise', color: '#F59E0B' },
  { key: 'social', label: 'Social', color: '#EF4444' },
  { key: 'personal', label: 'Personal', color: '#6B7280' },
  { key: 'health', label: 'Health', color: '#14B8A6' },
  { key: 'creative', label: 'Creative', color: '#F97316' },
  { key: 'household', label: 'Household', color: '#84CC16' },
  { key: 'relaxation', label: 'Relaxation', color: '#06B6D4' }
] as const;

export type ActivityCategoryKey = typeof ACTIVITY_CATEGORIES[number]['key'];
```

### Daily Prompts
```typescript
export const DAILY_PROMPTS = [
  {
    id: 'gratitude',
    question: "What's one thing you're grateful for today?",
    category: 'mental_health',
    suggestedTags: ['gratitude', 'appreciation', 'positive']
  },
  {
    id: 'accomplishment',
    question: "What's one thing you accomplished today that you're proud of?",
    category: 'productivity',
    suggestedTags: ['achievement', 'progress', 'success']
  },
  {
    id: 'challenge',
    question: "What challenge did you face today and how did you handle it?",
    category: 'growth',
    suggestedTags: ['challenge', 'resilience', 'problem-solving']
  },
  // ... 12 more prompts
] as const;
```

### Tags
```typescript
export const ALL_TAGS = [
  // Mental Health
  'anxiety', 'stress', 'calm', 'peaceful', 'mindful', 'meditation',
  'gratitude', 'positive', 'negative', 'mood', 'energy', 'focus',
  
  // Work & Productivity
  'work', 'productivity', 'meetings', 'deadlines', 'collaboration',
  'achievement', 'progress', 'goals', 'planning', 'organization',
  
  // Personal Growth
  'learning', 'skill-building', 'reading', 'reflection', 'insight',
  'self-improvement', 'habits', 'discipline', 'motivation', 'inspiration',
  
  // Relationships
  'family', 'friends', 'social', 'communication', 'support',
  'connection', 'love', 'empathy', 'understanding', 'conflict',
  
  // Health & Wellness
  'exercise', 'health', 'nutrition', 'sleep', 'recovery',
  'physical', 'mental', 'emotional', 'spiritual', 'balance'
] as const;
```

---

## ✅ Validation Rules

### Data Validation

#### EmotionalCheckIn Validation
```typescript
const validateEmotionalCheckIn = (checkIn: Partial<EmotionalCheckIn>): ValidationResult => {
  const errors: string[] = [];
  
  // Required fields
  if (!checkIn.date) errors.push('Date is required');
  if (!checkIn.energyLevel) errors.push('Energy level is required');
  if (!checkIn.positivityLevel) errors.push('Positivity level is required');
  
  // Range validation
  if (checkIn.energyLevel && (checkIn.energyLevel < 1 || checkIn.energyLevel > 10)) {
    errors.push('Energy level must be between 1 and 10');
  }
  
  if (checkIn.positivityLevel && (checkIn.positivityLevel < 1 || checkIn.positivityLevel > 10)) {
    errors.push('Positivity level must be between 1 and 10');
  }
  
  // Array validation
  if (checkIn.emotions && !Array.isArray(checkIn.emotions)) {
    errors.push('Emotions must be an array');
  }
  
  // Length validation
  if (checkIn.notes && checkIn.notes.length > 1000) {
    errors.push('Notes cannot exceed 1000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

#### Reflection Validation
```typescript
const validateReflection = (reflection: Partial<Reflection>): ValidationResult => {
  const errors: string[] = [];
  
  // Required fields
  if (!reflection.date) errors.push('Date is required');
  if (!reflection.prompt) errors.push('Prompt is required');
  if (!reflection.response) errors.push('Response is required');
  
  // Length validation
  if (reflection.response && reflection.response.length > 2000) {
    errors.push('Response cannot exceed 2000 characters');
  }
  
  if (reflection.response && reflection.response.trim().length < 10) {
    errors.push('Response must be at least 10 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

#### TimeEntry Validation
```typescript
const validateTimeEntry = (entry: Partial<TimeEntry>): ValidationResult => {
  const errors: string[] = [];
  
  // Required fields
  if (!entry.date) errors.push('Date is required');
  if (!entry.activity) errors.push('Activity is required');
  if (!entry.category) errors.push('Category is required');
  if (!entry.startTime) errors.push('Start time is required');
  if (!entry.endTime) errors.push('End time is required');
  
  // Time validation
  if (entry.startTime && entry.endTime) {
    const start = parseTime(entry.startTime);
    const end = parseTime(entry.endTime);
    
    if (end <= start) {
      errors.push('End time must be after start time');
    }
  }
  
  // Category validation
  if (entry.category && !ACTIVITY_CATEGORIES.find(cat => cat.key === entry.category)) {
    errors.push('Invalid activity category');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

### Input Sanitization

```typescript
const sanitizeInput = {
  text: (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  },
  
  tags: (tags: string[]): string[] => {
    return tags
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
      .filter((tag, index, array) => array.indexOf(tag) === index); // Remove duplicates
  },
  
  emotions: (emotions: string[]): string[] => {
    const validEmotions = EMOTIONS.map(e => e.key);
    return emotions.filter(emotion => validEmotions.includes(emotion));
  }
};
```

---

## 🔮 Future Enhancements

### Advanced Data Models

#### User Preferences
```typescript
interface UserPreferences {
  id: string;
  notificationSettings: {
    dailyCheckIn: boolean;
    reflection: boolean;
    timeTracking: boolean;
  };
  displaySettings: {
    theme: 'light' | 'dark' | 'system';
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY';
    timeFormat: '12h' | '24h';
  };
  privacySettings: {
    dataRetention: number; // days
    shareAnonymousData: boolean;
  };
}
```

#### Analytics Data
```typescript
interface AnalyticsData {
  id: string;
  userId: string;
  eventType: string;
  eventData: Record<string, any>;
  timestamp: string;
  sessionId: string;
}
```

### API Integration

#### Cloud Sync
```typescript
interface SyncState {
  lastSync: string;
  pendingChanges: string[];
  conflicts: SyncConflict[];
}

interface SyncConflict {
  id: string;
  type: 'emotional_checkin' | 'reflection' | 'time_entry';
  localData: any;
  remoteData: any;
  resolution: 'local' | 'remote' | 'merge';
}
```

#### External Integrations
```typescript
interface CalendarIntegration {
  provider: 'google' | 'outlook' | 'apple';
  accessToken: string;
  refreshToken: string;
  calendarId: string;
  syncEnabled: boolean;
}
``` 