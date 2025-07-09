# Product Requirements Document: Morning Check-in Restructure

## 📋 Document Overview

**Project**: Acorn - Personal Productivity & Emotional Awareness App  
**Feature**: Morning Check-in Modal & Time Tracking Focus  
**Date**: January 2025  
**Status**: Planning Phase  

## 🎯 Executive Summary

This PRD outlines a significant UX restructuring that transforms Acorn from a tab-based interface to a morning ritual-focused experience. The core change consolidates the emotional check-in and daily reflection into a single morning popup modal, while positioning time tracking as the primary daily interface.

## 🔍 Current State Analysis

### Current Structure
- **3-tab navigation**: Check-in, Reflection, Time Tracking
- **Separate workflows**: Each feature exists in isolation
- **Equal prominence**: All features have equal visual weight
- **Anytime access**: Users can access check-in/reflection at any time

### Current User Flow
```
App Launch → Tab Selection → Feature Usage → Tab Switching → Repeat
```

### Pain Points Identified
1. **Cognitive overhead**: Too many choices upon app launch
2. **Lack of intentionality**: No guided morning routine
3. **Feature fragmentation**: Related emotional tracking split across tabs
4. **No temporal context**: Check-in doesn't feel tied to morning routine

## 🚀 Proposed Solution

### Vision Statement
Transform Acorn into a **morning ritual app** that guides users through a quick emotional check-in, then seamlessly transitions to time tracking as the primary daily interface.

### Core Principles
1. **Intentional morning routine**: Check-in becomes a deliberate daily ritual
2. **Reduced cognitive load**: Single primary interface (time tracking)
3. **Contextual access**: Completed check-in accessible but not prominent
4. **Seamless flow**: Morning ritual → productive day tracking

## 📱 Detailed Requirements

### 1. Morning Check-in Modal

#### 1.1 Trigger Conditions
- **Time-based**: Modal appears on first app launch after 5:00 AM
- **Daily reset**: Resets at 5:00 AM each day
- **Completion tracking**: Does not appear again until next day after completion
- **Skip handling**: User can skip, but modal reappears on next launch (max 3 times)

#### 1.2 Modal Content Structure
```
┌─────────────────────────────────────────────────────────────┐
│                    🌅 Good Morning!                        │
│                                                             │
│  How are you feeling today?                                 │
│                                                             │
│  Energy Level: [1][2][3][4][5][6][7][8][9][10]            │
│  Positivity: [1][2][3][4][5][6][7][8][9][10]              │
│                                                             │
│  Emotions: [😩][🔋][😔][😊][😰][😄][🎯][😴][🤩][🤯]     │
│                                                             │
│  Today's Reflection:                                        │
│  "What's occupying most of your mental energy today?"       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Your thoughtful response here...                    │   │
│  │                                                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Optional notes:                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Any additional thoughts...                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│        [Skip for now]           [Complete Check-in]        │
└─────────────────────────────────────────────────────────────┘
```

#### 1.3 Modal Behavior
- **Overlay**: Semi-transparent background, modal cannot be dismissed by tapping outside
- **Responsive**: Adapts to screen size (mobile/tablet/desktop)
- **Accessibility**: Proper focus management and screen reader support
- **Validation**: At minimum, mood levels and one emotion required
- **Skip option**: Available but discouraged through subtle styling

### 2. Post-Check-in Main Interface

#### 2.1 Time Tracking as Primary Screen
- **Default view**: Time tracking interface loads after check-in completion
- **Full functionality**: All existing time tracking features remain
- **Today's focus**: Emphasis on current day's activities

#### 2.2 Completed Check-in Access
- **Subtle indicator**: Small, grayed-out button or badge
- **Placement options** (to be decided):
  - Top-right corner icon
  - Bottom of time tracking screen
  - Side menu item
  - Floating action button (secondary)

### 3. Check-in Review Interface

#### 3.1 When Accessed
- **Read-only view**: Display completed check-in data
- **Visual design**: Softer, less prominent styling
- **Quick access**: Back to time tracking with single tap

#### 3.2 Content Display
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Time Tracking                                    │
│                                                             │
│  Today's Check-in ✓                                        │
│  Completed at 7:42 AM                                      │
│                                                             │
│  Energy: ████████░░ (8/10)                                 │
│  Positivity: ██████░░░░ (6/10)                             │
│                                                             │
│  Emotions: Energized, Focused, Excited                     │
│                                                             │
│  Reflection:                                                │
│  "What's occupying most of your mental energy today?"       │
│                                                             │
│  "I'm really focused on the product launch next week.      │
│  There's a lot of moving pieces but I feel energized       │
│  about the potential impact..."                             │
│                                                             │
│  Notes:                                                     │
│  "Need to follow up with the design team about the final   │
│  mockups and prepare for the stakeholder presentation."     │
│                                                             │
│  [Edit Check-in]                                           │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Technical Implementation

### 3.1 State Management Changes

#### New State Properties
```typescript
interface AppState {
  // New morning check-in properties
  morningCheckIn: {
    isCompleted: boolean;
    completedAt: Date | null;
    data: MorningCheckInData | null;
    shouldShowModal: boolean;
  };
  
  // Existing properties remain
  timeEntries: TimeEntry[];
  // ... other existing state
}
```

#### New Actions
```typescript
// Morning check-in actions
completeMorningCheckIn: (data: MorningCheckInData) => void;
skipMorningCheckIn: () => void;
resetMorningCheckIn: () => void;
shouldShowMorningModal: () => boolean;
```

### 3.2 Component Architecture

#### New Components
1. **MorningCheckInModal**: Main modal component
2. **CheckInReviewPanel**: Read-only check-in display
3. **TimeTrackingMainScreen**: Enhanced time tracking as primary interface

#### Modified Components
1. **App.tsx**: Remove tab navigation, add modal logic
2. **TopNavigation**: Remove or simplify significantly
3. **Existing check-in components**: Repurpose for modal use

### 3.3 Data Storage

#### Morning Check-in Data Model
```typescript
interface MorningCheckInData {
  id: string;
  date: Date;
  energyLevel: number;
  positivityLevel: number;
  emotions: string[];
  reflectionPrompt: string;
  reflectionResponse: string;
  notes?: string;
  completedAt: Date;
  skippedCount: number;
}
```

#### Database Schema Updates
```sql
-- New table for morning check-ins
CREATE TABLE morning_checkins (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  energy_level INTEGER NOT NULL,
  positivity_level INTEGER NOT NULL,
  emotions TEXT NOT NULL,
  reflection_prompt TEXT NOT NULL,
  reflection_response TEXT NOT NULL,
  notes TEXT,
  completed_at TEXT NOT NULL,
  skipped_count INTEGER DEFAULT 0,
  UNIQUE(date)
);
```

### 3.4 Time-based Logic

#### Morning Detection
```typescript
const isMorningTime = () => {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 5; // After 5 AM
};

const shouldShowMorningModal = () => {
  const today = new Date().toDateString();
  const lastCompleted = store.morningCheckIn.completedAt?.toDateString();
  
  return isMorningTime() && 
         !store.morningCheckIn.isCompleted && 
         lastCompleted !== today;
};
```

## 🎨 UI/UX Considerations

### 4.1 Visual Design Principles

#### Modal Design
- **Warm morning colors**: Soft oranges, light blues
- **Calming interaction**: Gentle animations, no harsh transitions
- **Clear hierarchy**: Prompt stands out, secondary elements subtle
- **Mobile-first**: Optimized for phone use in morning

#### Main Interface
- **Focus on functionality**: Time tracking gets full attention
- **Subtle check-in access**: Doesn't compete with main interface
- **Consistent theming**: Maintains current app design language

### 4.2 Interaction Patterns

#### Morning Ritual Flow
1. **App launch** → Modal appears (if conditions met)
2. **Quick completion** → Seamless transition to time tracking
3. **Optional skip** → Gentle reminder, not intrusive
4. **Daily reset** → Fresh start each morning

#### Daily Usage Flow
1. **Morning check-in** → Sets emotional context for day
2. **Time tracking focus** → Primary productive interface
3. **Occasional review** → Quick access to morning insights

## 📊 Success Metrics

### Primary Metrics
- **Morning completion rate**: % of users completing check-in when modal appears
- **Time tracking engagement**: Increased usage after check-in completion
- **User retention**: Daily active users completing morning routine

### Secondary Metrics
- **Skip rate**: How often users skip the morning check-in
- **Check-in review frequency**: How often users revisit completed check-ins
- **Session duration**: Time spent in app after morning check-in

## 🔄 Migration Strategy

### Phase 1: Core Implementation
1. Build morning check-in modal
2. Implement time-based trigger logic
3. Create consolidated check-in form
4. Add completion tracking

### Phase 2: Interface Restructuring
1. Remove tab navigation
2. Make time tracking the primary interface
3. Add subtle check-in access point
4. Implement check-in review panel

### Phase 3: Polish & Optimization
1. Refine modal timing and triggers
2. Optimize for different screen sizes
3. Add accessibility improvements
4. Performance optimization

## 🎯 Open Questions for Discussion

1. **Check-in access placement**: Where should the "view completed check-in" button be placed?
2. **Skip behavior**: How many times should we allow skipping before different handling?
3. **Reflection prompts**: Should we cycle through prompts or use the same one daily?
4. **Editing capability**: Should users be able to edit their morning check-in later?
5. **Side menu**: Do we want to implement a side menu for additional features?
6. **Offline handling**: How should the app behave if opened offline in the morning?

## 🏁 Next Steps

1. **Review and discuss**: This PRD with stakeholders
2. **Finalize UX decisions**: Resolve open questions
3. **Create implementation plan**: Break down into specific tickets
4. **Begin development**: Start with core modal functionality
5. **User testing**: Validate morning ritual concept with users

---

*This PRD represents a significant shift towards a more intentional, morning-focused user experience that reduces cognitive overhead while maintaining all core functionality.* 