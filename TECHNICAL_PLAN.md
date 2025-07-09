# Acorn - Technical Implementation Plan

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: React Native with Expo (cross-platform desktop support)
- **Backend**: Node.js + Express with SQLite (local-first) + optional Supabase sync
- **State Management**: Zustand (lightweight, modular)
- **Database**: SQLite (local) + Supabase (cloud sync)
- **UI Components**: NativeBase or Tamagui
- **Charts/Visualization**: Victory Native or React Native Chart Kit
- **Calendar**: React Native Calendars
- **AI/ML**: OpenAI API for text analysis and clustering

### Project Structure
```
acorn/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Main app screens
│   ├── stores/             # Zustand state stores
│   ├── services/           # API and data services
│   ├── utils/              # Helper functions
│   ├── types/              # TypeScript definitions
│   └── constants/          # App constants
├── assets/                 # Images, fonts, etc.
├── database/              # SQLite schema and migrations
└── docs/                  # Documentation
```

## 📋 Development Phases

### Phase 1: Foundation Setup (Week 1)
**Goal**: Basic app structure with navigation and data persistence

#### Step 1.1: Environment Setup
- [x] Initialize React Native Expo project
- [x] Set up TypeScript configuration
- [x] Install essential dependencies
- [x] Configure ESLint/Prettier
- [x] Set up GitHub repository

#### Step 1.2: Core Architecture
- [ ] Set up SQLite database with initial schema
- [ ] Implement Zustand stores for state management
- [ ] Create basic navigation structure
- [ ] Set up component library and theming

#### Step 1.3: Data Models
```typescript
// Core data structures
interface EmotionalCheckIn {
  id: string;
  date: Date;
  mood_energy: number; // 1-10 scale
  mood_positivity: number; // 1-10 scale
  emotions: string[]; // ['stressed', 'energized', etc.]
  description?: string;
}

interface Reflection {
  id: string;
  date: Date;
  type: 'worry' | 'priority';
  content: string;
  tags: string[];
}

interface TimeEntry {
  id: string;
  date: Date;
  activity: string;
  category: string;
  start_time: Date;
  end_time: Date;
  tags: string[];
}
```

### Phase 2: Core Features (Week 2-3)
**Goal**: Implement the three main MVP features

#### Step 2.1: Daily Emotional Check-In
- [ ] Create mood slider components
- [ ] Implement emotion button grid with emojis
- [ ] Add optional text input
- [ ] Save to local database
- [ ] Basic form validation

#### Step 2.2: Self-Reflection Prompts
- [ ] Create prompt screens for worries and priorities
- [ ] Implement tag suggestion system
- [ ] Add free-text input with auto-tagging
- [ ] Category management (Work, Health, Focus, etc.)

#### Step 2.3: Time Tracking Foundation
- [ ] Create activity logging interface
- [ ] Implement time picker components
- [ ] Category and tag management
- [ ] Basic list view of time entries

### Phase 3: Visualization & Calendar (Week 4)
**Goal**: Beautiful data visualization and calendar integration

#### Step 3.1: Calendar Integration
- [ ] Implement React Native Calendars
- [ ] Show mood indicators on calendar dates
- [ ] Display time entries as timeline
- [ ] Interactive date selection

#### Step 3.2: Data Visualization
- [ ] Mood trends over time (line charts)
- [ ] Time allocation pie charts
- [ ] Activity category breakdowns
- [ ] Weekly/monthly summary views

### Phase 4: Insights & Intelligence (Week 5-6)
**Goal**: Basic AI insights and pattern recognition

#### Step 4.1: Text Analysis
- [ ] Implement OpenAI API integration
- [ ] Cluster worry/priority text into themes
- [ ] Extract keywords from descriptions
- [ ] Basic sentiment analysis

#### Step 4.2: Pattern Recognition
- [ ] Correlate mood with activities
- [ ] Identify stress patterns
- [ ] Time vs. mood correlations
- [ ] Weekly insights generation

### Phase 5: Polish & Enhancement (Week 7)
**Goal**: UI polish, performance optimization, and extensibility prep

#### Step 5.1: UI/UX Refinement
- [ ] Implement beautiful animations
- [ ] Dark/light theme support
- [ ] Accessibility improvements
- [ ] Performance optimization

#### Step 5.2: Data Management
- [ ] Export functionality (JSON/CSV)
- [ ] Data backup and restore
- [ ] Optional cloud sync with Supabase
- [ ] Data privacy controls

## 🗄️ Database Schema

### SQLite Tables
```sql
-- Emotional check-ins
CREATE TABLE check_ins (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    mood_energy INTEGER,
    mood_positivity INTEGER,
    emotions TEXT, -- JSON array
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reflections (worries/priorities)
CREATE TABLE reflections (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    type TEXT NOT NULL, -- 'worry' or 'priority'
    content TEXT NOT NULL,
    tags TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Time tracking entries
CREATE TABLE time_entries (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    activity TEXT NOT NULL,
    category TEXT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    tags TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insights and clusters
CREATE TABLE insights (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'theme', 'pattern', etc.
    content TEXT NOT NULL,
    metadata TEXT, -- JSON
    date_range_start DATE,
    date_range_end DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 UI/UX Design Principles

### Visual Design
- **Clean, minimal interface** with plenty of white space
- **Calming color palette** (soft blues, greens, warm neutrals)
- **Consistent iconography** using Expo Icons
- **Smooth animations** for state transitions
- **Typography hierarchy** with clear readability

### User Experience
- **Quick input flows** - minimize friction for daily check-ins
- **Smart defaults** - remember user preferences
- **Progressive disclosure** - advanced features don't clutter main flow
- **Contextual help** - tooltips and onboarding guidance
- **Offline-first** - works without internet connection

## 🔧 Technical Implementation Details

### State Management Pattern
```typescript
// Zustand store example
interface AppStore {
  // Data
  checkIns: EmotionalCheckIn[];
  reflections: Reflection[];
  timeEntries: TimeEntry[];
  
  // UI State
  selectedDate: Date;
  activeScreen: string;
  
  // Actions
  addCheckIn: (checkIn: EmotionalCheckIn) => void;
  addReflection: (reflection: Reflection) => void;
  addTimeEntry: (entry: TimeEntry) => void;
  setSelectedDate: (date: Date) => void;
}
```

### Component Architecture
- **Atomic Design** approach (atoms, molecules, organisms)
- **Compound components** for complex interactions
- **Custom hooks** for business logic
- **Error boundaries** for graceful error handling

### Performance Considerations
- **Lazy loading** for charts and heavy components
- **Virtualized lists** for large datasets
- **Optimized re-renders** with React.memo and useMemo
- **Background sync** for cloud operations

## 🚀 Deployment & Distribution

### Development
- **Expo Development Build** for testing
- **Hot reloading** for rapid iteration
- **TypeScript strict mode** for type safety

### Production
- **Expo Application Services (EAS)** for building
- **Desktop apps** via Electron or native compilation
- **Progressive Web App** fallback option

## 📊 Success Metrics

### Technical Metrics
- App startup time < 2 seconds
- Smooth 60fps animations
- Local data access < 100ms
- Crash-free rate > 99.5%

### User Experience Metrics
- Daily check-in completion rate
- Time to complete check-in < 30 seconds
- User retention after 1 week
- Feature adoption rates

## 🔮 Future Extensibility

### Architecture Decisions for Future Features
- **Plugin architecture** for new tracking types
- **Modular AI services** for different analysis types
- **Flexible theming system** for customization
- **API-ready** for team/social features
- **Export/import standards** for data portability

### Planned Extensions (Post-MVP)
- Pomodoro timer integration
- Weekly AI-generated summaries
- Guided journaling prompts
- Habit tracking
- Goal setting and progress tracking
- Mood-based activity recommendations
- Team/partner sharing features 