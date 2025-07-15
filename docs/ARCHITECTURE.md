# Architecture Guide

This document provides a detailed overview of the Acorn app architecture, design patterns, and technical decisions.

## 📋 Table of Contents

1. [Overall Architecture](#overall-architecture)
2. [State Management](#state-management)
3. [Data Layer](#data-layer)
4. [Component Structure](#component-structure)
5. [Cross-Platform Compatibility](#cross-platform-compatibility)
6. [Type System](#type-system)
7. [Design Patterns](#design-patterns)

## 🏗️ Overall Architecture

### Application Structure

```
Acorn follows a layered architecture with AI integration, caching, and Google Calendar sync:

┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   CheckIn       │  │  TimeTracking   │  │   Insights      │ │
│  │    Screen       │  │     Screen      │  │    Screen       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                               │
│                     Component Layer                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Calendar Components, Morning Check-in, Navigation     │   │
│  │  (MoodSlider, TagInput, CalendarGrid, SideMenu, etc.)  │   │
│  │  + Google Calendar Integration Components               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                               │
│                     Business Logic Layer                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │     Zustand Store (appStore.ts) + Calendar Store       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                               │
│                   External Service Layer                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │   Google OAuth Service + Google Calendar API Service   │   │
│  │   + Background Sync Service + Event Categorization     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                               │
│                     AI & Caching Layer                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │   AI Service + Insight Cache + Data Hash Validation    │   │
│  │   + AI Event Categorization + Smart Caching            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                               │
│                     Data Layer                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │      SQLite Database with Optimized Schemas            │   │
│  │      + Google Calendar Event Storage                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Hamburger Menu Navigation**: Uses side menu instead of tabs for clean, minimal interface
2. **State-First Design**: UI components are primarily controlled by Zustand store
3. **Cross-Platform First**: All components designed for web and mobile compatibility
4. **Type-Safe**: Comprehensive TypeScript usage throughout the application
5. **Modular Components**: Reusable, self-contained components with clear interfaces
6. **AI Integration**: OpenAI API with intelligent caching and pattern analysis
7. **Performance Optimization**: Database indexing, data hashing, and smart caching
8. **Privacy-First**: Local data storage with test mode for development
9. **Optional External Services**: Google Calendar integration is completely optional
10. **Graceful Degradation**: App functions fully without external service configuration
11. **Progressive Enhancement**: Features unlock as users engage with the app

### Google Calendar Integration Architecture

The Google Calendar integration follows a secure, optional architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                  Google Calendar Flow                       │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐ │
│  │   Environment   │    │  OAuth Service  │    │  Calendar API   │ │
│  │   Validation    │───▶│   (PKCE)        │───▶│   Service       │ │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘ │
│           │                       │                       │         │
│           ▼                       ▼                       ▼         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐ │
│  │ Graceful        │    │ Secure Token    │    │ Background      │ │
│  │ Degradation     │    │ Management      │    │ Sync Service    │ │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘ │
│                                                           │         │
│                                                           ▼         │
│                                        ┌─────────────────────────┐ │
│                                        │  AI Event              │ │
│                                        │  Categorization        │ │
│                                        └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Key Integration Principles:**

1. **Environment Variable Validation**: Checks for required OAuth credentials with user-friendly error messages
2. **OAuth 2.0 with PKCE**: Secure authentication flow with proof key for code exchange
3. **Background Sync**: Automatic event synchronization every 5 minutes when authenticated
4. **AI-Powered Categorization**: Intelligent event categorization using OpenAI API
5. **Graceful Degradation**: Complete app functionality without Google Calendar configured
6. **Progressive Enhancement**: Optional features that enhance the core experience
7. **Robust Error Handling**: Comprehensive error handling with user-friendly feedback

## 🔄 State Management

### Zustand Store Pattern

```typescript
// appStore.ts structure
interface AppState {
  // Data state
  checkIns: EmotionalCheckIn[];
  reflections: Reflection[];
  timeEntries: TimeEntry[];
  insights: Insight[];
  
  // Morning Check-in State
  morningCheckIn: MorningCheckInState;
  
  // UI state
  selectedDate: Date;
  currentScreen: string;
  isLoading: boolean;
  error: string | null;
  
  // Settings
  theme: 'light' | 'dark';
  testMode: boolean;
  
  // Actions
  addCheckIn: (checkIn: Omit<EmotionalCheckIn, 'id' | 'created_at'>) => void;
  addReflection: (reflection: Omit<Reflection, 'id' | 'created_at'>) => void;
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'created_at'>) => void;
  
  // Morning Check-in Actions
  completeMorningCheckIn: (data: MorningCheckInData) => void;
  shouldShowMorningModal: () => boolean;
  generateTodaysPrompt: () => Promise<string>;
  
  // Insight caching actions
  getCachedInsights: (timePeriod: 'week' | 'month' | 'quarter') => Promise<Insight[]>;
  generateInsightsForPeriod: (timePeriod, start, end) => Promise<Insight[]>;
  invalidateInsightCache: (timePeriod?: string) => Promise<void>;
  
  // Database operations
  loadData: () => Promise<void>;
  initialize: () => Promise<void>;
}
```

### State Management Principles

1. **Single Source of Truth**: All application state lives in the Zustand store
2. **Immutable Updates**: State updates use immutable patterns
3. **Async Actions**: Database operations are handled as async actions
4. **Selective Subscriptions**: Components subscribe only to needed state slices

### Cross-Platform State Considerations

- **Web**: Uses sessionStorage for temporary data persistence
- **Mobile**: Uses SQLite database for persistent storage
- **Conditional Loading**: Database service conditionally imported based on platform

## 🗄️ Data Layer

### Database Architecture

```typescript
// Enhanced Database Tables with AI Caching
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│  check_ins          │    │    reflections      │    │    time_entries     │
├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤
│ id (PRIMARY KEY)    │    │ id (PRIMARY KEY)    │    │ id (PRIMARY KEY)    │
│ date                │    │ date                │    │ date                │
│ energy_level        │    │ type                │    │ activity            │
│ positivity_level    │    │ content             │    │ category            │
│ emotions            │    │ tags                │    │ start_time          │
│ description         │    │ created_at          │    │ end_time            │
│ created_at          │    └─────────────────────┘    │ tags                │
└─────────────────────┘                              │ created_at          │
                                                       └─────────────────────┘

┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│  morning_checkins   │    │ calendar_time_entries│    │      insights      │
├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤
│ id (PRIMARY KEY)    │    │ id (PRIMARY KEY)    │    │ id (PRIMARY KEY)    │
│ date (UNIQUE)       │    │ date                │    │ content             │
│ energy_level        │    │ activity            │    │ type                │
│ positivity_level    │    │ category            │    │ icon                │
│ emotions            │    │ start_time          │    │ time_period         │
│ reflection_prompt   │    │ end_time            │    │ period_start        │
│ reflection_response │    │ duration            │    │ period_end          │
│ notes               │    │ mood_rating         │    │ data_hash           │
│ completed_at        │    │ emotional_tags      │    │ data_version        │
└─────────────────────┘    │ reflection          │    │ generated_at        │
                           │ created_at          │    │ metadata            │
                           │ updated_at          │    │ created_at          │
                           └─────────────────────┘    └─────────────────────┘

// Database Indexes for Performance
CREATE INDEX idx_insights_period ON insights(time_period, period_start, period_end);
CREATE INDEX idx_insights_hash ON insights(data_hash, time_period);
CREATE INDEX idx_morning_checkins_date ON morning_checkins(date);
CREATE INDEX idx_calendar_entries_date ON calendar_time_entries(date);
```

### Data Models

1. **EmotionalCheckIn**: Daily mood and emotion tracking
2. **MorningCheckInData**: Comprehensive morning ritual data with AI prompts
3. **Reflection**: Journaling responses to daily prompts
4. **TimeEntry**: Activity tracking with emotional context
5. **CalendarTimeEntry**: Enhanced time tracking with mood ratings and emotional tags
6. **Insight**: AI-generated patterns and recommendations with caching metadata

### Data Flow

```
User Input → Component → Store Action → Database Service → SQLite
                                    ↓
UI Update ← Component ← Store State ← Database Response

// AI-Enhanced Data Flow
User Data → Data Hash → Cache Check → AI Service → Pattern Analysis → 
          ↓                        ↓             ↓
Database Cache ← Insight Storage ← OpenAI API ← Smart Caching
```

## 🧩 Component Structure

### Component Hierarchy

```
App.tsx
├── TopNavigation.tsx
├── CheckInScreen.tsx
│   ├── MoodSlider.tsx
│   ├── EmotionButton.tsx
│   └── TagInput.tsx
├── DailyPromptScreen.tsx
│   └── TagInput.tsx
└── TimeTrackingScreen.tsx
    ├── CategoryDropdown.tsx
    ├── CalendarTimeSlotPicker.tsx
    └── TimePicker.tsx
```

### Component Patterns

#### 1. Controlled Components
All form components are controlled by the parent screen:

```typescript
// Pattern: Parent manages state, child receives props
<MoodSlider 
  value={energyLevel} 
  onValueChange={setEnergyLevel}
  label="Energy Level"
/>
```

#### 2. Compound Components
Complex UI elements broken into smaller, focused components:

```typescript
// EmotionButton handles single emotion selection
// CheckInScreen coordinates multiple EmotionButtons
```

#### 3. Custom Hooks Pattern
Business logic extracted into reusable hooks:

```typescript
// Custom hook for data loading
const useLoadData = () => {
  const { loadData } = useAppStore();
  // Loading logic
};
```

## 🌐 Cross-Platform Compatibility

### Platform-Specific Code

#### Database Loading
```typescript
// Conditional import based on platform
const initializeDatabase = async () => {
  if (Platform.OS !== 'web') {
    const { initDB } = await import('./database');
    await initDB();
  }
};
```

#### Storage Strategy
- **Mobile**: SQLite database with expo-sqlite
- **Web**: SessionStorage fallback for temporary data
- **Shared**: Zustand store provides unified interface

### UI Compatibility

#### Touch vs Mouse Events
- Components use `TouchableOpacity` for universal touch/click handling
- `activeOpacity` provides consistent feedback across platforms

#### Responsive Design
- Flexible layouts using Flexbox
- No platform-specific styling
- Consistent spacing using theme constants

## 🔧 Type System

### TypeScript Architecture

```typescript
// Core type definitions in types/index.ts
export interface EmotionalCheckIn {
  id: string;
  date: string;
  energyLevel: number;
  positivityLevel: number;
  emotions: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Component prop types
interface MoodSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
}
```

### Type Safety Patterns

1. **Interface Segregation**: Small, focused interfaces
2. **Generic Components**: Reusable components with type parameters
3. **Strict Typing**: All function parameters and return types defined
4. **Enum Usage**: Constants defined as enums for type safety

## 🎨 Design Patterns

### 1. Provider Pattern
```typescript
// Zustand store acts as provider
const useAppStore = create<AppState>((set, get) => ({
  // State and actions
}));
```

### 2. Observer Pattern
```typescript
// Components subscribe to store updates
const checkIns = useAppStore((state) => state.emotionalCheckIns);
```

### 3. Strategy Pattern
```typescript
// Different storage strategies for different platforms
const storageStrategy = Platform.OS === 'web' ? 
  webStorageService : 
  databaseService;
```

### 4. Factory Pattern
```typescript
// Create entities with consistent structure
const createEmotionalCheckIn = (data: Partial<EmotionalCheckIn>): EmotionalCheckIn => ({
  id: generateId(),
  date: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...data
});
```

## 🚀 Performance Considerations

### State Management
- **Selective Subscriptions**: Components only subscribe to needed state slices
- **Batch Updates**: Multiple state changes batched together
- **Memoization**: Expensive computations memoized with useMemo

### Component Optimization
- **React.memo**: Prevent unnecessary re-renders
- **Callback Optimization**: useCallback for event handlers
- **Lazy Loading**: Components loaded only when needed

### Database
- **Batch Operations**: Multiple database operations combined
- **Indexing**: Proper indexing for query performance
- **Connection Pooling**: Efficient database connection management

## 🔒 Security Considerations

### Data Protection
- **Local Storage**: All data stored locally, no cloud transmission
- **Input Validation**: All user inputs validated before storage
- **SQL Injection Prevention**: Parameterized queries used throughout

### Platform Security
- **Expo Security**: Leverages Expo's security best practices
- **Web Security**: Standard web security practices for web builds
- **Mobile Security**: Native platform security features

## 🧪 Testing Strategy

### Unit Testing
- **Component Testing**: Individual component functionality
- **Store Testing**: State management logic
- **Utility Testing**: Helper function validation

### Integration Testing
- **Screen Testing**: End-to-end screen functionality
- **Database Testing**: Database operations
- **Cross-Platform Testing**: Platform-specific behavior

### Manual Testing
- **Cross-Platform**: Testing on both web and mobile
- **User Flows**: Complete user journey testing
- **Edge Cases**: Error handling and edge case validation

## 📈 Scalability Considerations

### Code Organization
- **Modular Structure**: Clear separation of concerns
- **Reusable Components**: DRY principle followed
- **Type Safety**: Reduces runtime errors

### Performance Scaling
- **State Management**: Efficient state updates
- **Database Design**: Optimized for growth
- **Component Architecture**: Scalable component patterns

### Feature Expansion
- **Plugin Architecture**: Easy to add new features
- **API Design**: Consistent interfaces for new integrations
- **Data Model**: Flexible data structures for evolution

## 🤖 AI Integration Architecture

### AI Service Layer

```typescript
// AI Service with caching capabilities
class AIService {
  // Activity categorization
  async categorizeActivity(activity: string, testMode: boolean): Promise<ActivityCategory>;
  
  // Personalized prompt generation
  async generatePersonalizedPrompt(checkIns: MorningCheckIn[], goals: string[], testMode: boolean): Promise<string>;
  
  // Insight generation with caching
  async generateCachedInsights(checkIns: MorningCheckIn[], activities: CalendarTimeEntry[], goals: string[], testMode: boolean): Promise<CachedInsight[]>;
}
```

### AI Data Pipeline

```
Raw User Data → Data Aggregation → Pattern Analysis → AI Processing → Insight Generation → Cache Storage
     ↓                ↓                 ↓              ↓               ↓              ↓
Morning Check-ins → Weekly Summary → OpenAI API → Structured Output → Database Cache → UI Display
Activity Data    → Trend Analysis  → Prompt Eng. → JSON Response   → Hash Validation → Loading States
Goal Tracking    → Correlation     → Test Mode   → Error Handling  → Performance   → User Experience
```

### AI Processing Patterns

1. **Data Aggregation**: Collect and structure user data for analysis
2. **Pattern Recognition**: Identify trends, correlations, and behavioral patterns
3. **Insight Generation**: Create actionable, personalized recommendations
4. **Caching Strategy**: Store results to minimize API calls and improve performance

## 📊 Insight Caching Architecture

### Caching Strategy

```typescript
// Cache validation with data hashing
interface CachedInsight {
  id: string;
  content: string;
  type: 'trend' | 'pattern' | 'correlation' | 'habit' | 'energy' | 'productivity';
  icon: string;
  timePeriod: 'week' | 'month' | 'quarter';
  periodStart: Date;
  periodEnd: Date;
  dataHash: string;
  dataVersion: number;
  generatedAt: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}
```

### Cache Invalidation Logic

```typescript
// Smart cache invalidation
const areCachedInsightsValid = (
  cachedDataHash: string,
  currentDataHash: string,
  cacheGeneratedAt: Date,
  maxCacheAgeHours: number = 24
): boolean => {
  // Check if data has changed
  if (cachedDataHash !== currentDataHash) return false;
  
  // Check if cache is too old
  const cacheAgeHours = (Date.now() - cacheGeneratedAt.getTime()) / (1000 * 60 * 60);
  return cacheAgeHours <= maxCacheAgeHours;
};
```

### Cache Performance Optimization

1. **Database Indexing**: Optimized queries with proper indexes
2. **Data Hashing**: Efficient change detection using hash functions
3. **Time-based Periods**: Structured weekly/monthly/quarterly analysis
4. **Cleanup Management**: Automatic removal of outdated cache entries

### Cache Flow Architecture

```
User Request → Cache Check → Hash Validation → Cache Hit/Miss Decision
     ↓              ↓            ↓                    ↓
UI Loading → Database Query → Data Comparison → Return Cached / Generate New
     ↓              ↓            ↓                    ↓
Loading State → Index Lookup → Hash Match → Instant Response / AI Processing
```

## 🎯 Test Mode Architecture

### Development vs Production Data

```typescript
// Test mode implementation
interface TestModeConfig {
  enabled: boolean;
  sampleCheckIns: MorningCheckInData[];
  sampleActivities: CalendarTimeEntry[];
  sampleGoals: string[];
}

// AI Service with test mode
if (testMode) {
  // Use sample data for AI processing
  const insights = await generateInsights(sampleData);
} else {
  // Use real user data
  const insights = await generateInsights(realUserData);
}
```

### Privacy Protection

1. **Data Isolation**: Test mode completely isolates sample data from real data
2. **AI Processing**: OpenAI API receives only sample data during development
3. **User Control**: Users can toggle test mode for privacy preferences
4. **Development Safety**: Prevents accidental processing of real user data

## 🔄 Performance Optimization Architecture

### Database Performance

```sql
-- Optimized indexes for insight queries
CREATE INDEX idx_insights_period ON insights(time_period, period_start, period_end);
CREATE INDEX idx_insights_hash ON insights(data_hash, time_period);
CREATE INDEX idx_morning_checkins_date ON morning_checkins(date);
CREATE INDEX idx_calendar_entries_date ON calendar_time_entries(date);
```

### Query Optimization

1. **Indexed Lookups**: All cache queries use database indexes
2. **Batch Operations**: Multiple database operations combined
3. **Selective Loading**: Only load data needed for current time period
4. **Connection Pooling**: Efficient database connection management

### UI Performance

```typescript
// Optimized component rendering
const InsightsScreen = React.memo(() => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Efficient data loading with caching
  useEffect(() => {
    const loadCachedInsights = async () => {
      const cachedInsights = await getCachedInsights('week');
      setInsights(cachedInsights);
      setLoading(false);
    };
    
    loadCachedInsights();
  }, []);
  
  // Prevent unnecessary re-renders
  return useMemo(() => (
    <InsightsList insights={insights} loading={loading} />
  ), [insights, loading]);
});
```

## 🚀 Deployment Architecture

### Cross-Platform Deployment

```typescript
// Platform-specific service initialization
const initializePlatformServices = async () => {
  if (Platform.OS === 'web') {
    // Web-specific initialization
    await webDatabaseService.initialize();
  } else {
    // Mobile-specific initialization
    await databaseService.initialize();
  }
  
  // Common AI service initialization
  await aiService.initialize();
};
```

### Build Optimization

1. **Code Splitting**: Lazy loading of non-essential components
2. **Bundle Analysis**: Regular monitoring of bundle size
3. **Tree Shaking**: Elimination of unused code
4. **Platform Builds**: Optimized builds for web and mobile 