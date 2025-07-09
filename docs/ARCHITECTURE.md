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
Acorn follows a layered architecture:

┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   CheckIn       │  │  DailyPrompt    │  │  TimeTracking   │ │
│  │    Screen       │  │     Screen      │  │     Screen      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                               │
│                     Component Layer                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Reusable UI Components (MoodSlider, TagInput, etc.)   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                               │
│                     Business Logic Layer                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           Zustand Store (appStore.ts)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                               │
│                     Data Layer                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           SQLite Database (database.ts)                │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Single Page Application**: Uses tab navigation instead of stack navigation for simplicity
2. **State-First Design**: UI components are primarily controlled by Zustand store
3. **Cross-Platform First**: All components designed for web and mobile compatibility
4. **Type-Safe**: Comprehensive TypeScript usage throughout the application
5. **Modular Components**: Reusable, self-contained components with clear interfaces

## 🔄 State Management

### Zustand Store Pattern

```typescript
// appStore.ts structure
interface AppState {
  // Data state
  emotionalCheckIns: EmotionalCheckIn[];
  reflections: Reflection[];
  timeEntries: TimeEntry[];
  
  // UI state
  currentScreen: string;
  
  // Actions
  addEmotionalCheckIn: (checkIn: EmotionalCheckIn) => void;
  addReflection: (reflection: Reflection) => void;
  addTimeEntry: (entry: TimeEntry) => void;
  
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
// Database Tables
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│  emotional_checkins │    │    reflections      │    │    time_entries     │
├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤
│ id (PRIMARY KEY)    │    │ id (PRIMARY KEY)    │    │ id (PRIMARY KEY)    │
│ date                │    │ date                │    │ date                │
│ energyLevel         │    │ type                │    │ activity            │
│ positivityLevel     │    │ prompt              │    │ category            │
│ emotions            │    │ response            │    │ startTime           │
│ notes               │    │ tags                │    │ endTime             │
│ createdAt           │    │ createdAt           │    │ tags                │
│ updatedAt           │    │ updatedAt           │    │ createdAt           │
└─────────────────────┘    └─────────────────────┘    │ updatedAt           │
                                                       └─────────────────────┘
```

### Data Models

1. **EmotionalCheckIn**: Daily mood and emotion tracking
2. **Reflection**: Journaling responses to daily prompts
3. **TimeEntry**: Activity tracking with emotional context
4. **Insight**: AI-generated patterns and recommendations (future)

### Data Flow

```
User Input → Component → Store Action → Database Service → SQLite
                                    ↓
UI Update ← Component ← Store State ← Database Response
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