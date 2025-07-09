# Implementation Plan: Morning Check-in Restructure

## 📋 Overview

**Project**: Acorn Morning Check-in Restructure  
**Approach**: Methodical, phased development with testing at each stage  
**Goal**: Transform from tab-based to morning ritual + time tracking focus  

## 🎯 Requirements Summary

Based on discussion, here are the confirmed requirements:

1. **Check-in access**: Side menu with hamburger navigation
2. **Reflection prompts**: Cycle through different prompts daily
3. **Skip behavior**: No skips allowed - completion is required
4. **Editing**: No editing capability (future: end-of-day reflection)
5. **Navigation**: Hamburger menu for future extensibility

## 🚀 Development Phases

### Phase 1: Core Infrastructure & Data Models
**Goal**: Set up the foundation without breaking existing functionality

#### 1.1 Data Model Updates
- [ ] Create `MorningCheckInData` interface
- [ ] Add morning check-in state to Zustand store
- [ ] Update database schema with new table
- [ ] Create prompt cycling logic

#### 1.2 Basic Components
- [ ] Create `MorningCheckInModal` component (non-functional shell)
- [ ] Create `SideMenu` component structure
- [ ] Create `HamburgerButton` component
- [ ] Test components in isolation

#### 1.3 Testing Checkpoint
- [ ] Verify new data models work correctly
- [ ] Test prompt cycling logic
- [ ] Ensure existing functionality still works
- [ ] Database migrations work properly

---

### Phase 2: Morning Check-in Modal Implementation
**Goal**: Build and test the consolidated check-in form

#### 2.1 Modal Content
- [ ] Build mood sliders (reuse existing `MoodSlider`)
- [ ] Build emotion grid (reuse existing `EmotionButton`)
- [ ] Create reflection prompt display
- [ ] Create reflection text input
- [ ] Add optional notes input

#### 2.2 Modal Logic
- [ ] Implement form validation (no skips allowed)
- [ ] Add completion handling
- [ ] Connect to Zustand store
- [ ] Add database persistence

#### 2.3 Testing Checkpoint
- [ ] Test modal form validation
- [ ] Verify data persistence
- [ ] Test prompt cycling
- [ ] Ensure responsive design works
- [ ] Test accessibility features

---

### Phase 3: Time-based Logic & Triggers
**Goal**: Add morning detection and daily reset functionality

#### 3.1 Morning Detection
- [ ] Create time-based trigger logic (5 AM cutoff)
- [ ] Implement daily reset mechanism
- [ ] Add completion tracking by date
- [ ] Handle edge cases (timezone, date changes)

#### 3.2 App Launch Logic
- [ ] Integrate modal trigger into App.tsx
- [ ] Add loading states
- [ ] Handle offline scenarios
- [ ] Test across different launch times

#### 3.3 Testing Checkpoint
- [ ] Test morning detection accuracy
- [ ] Verify daily reset works at 5 AM
- [ ] Test edge cases (midnight, timezone changes)
- [ ] Ensure modal only shows when appropriate

---

### Phase 4: Interface Restructuring
**Goal**: Remove tabs and make time tracking the primary interface

#### 4.1 Navigation Changes
- [ ] Remove tab navigation from App.tsx
- [ ] Implement hamburger menu
- [ ] Add side menu with check-in access
- [ ] Update TopNavigation component

#### 4.2 Primary Interface
- [ ] Make time tracking the default screen
- [ ] Add subtle check-in access in side menu
- [ ] Create check-in review panel
- [ ] Implement back navigation

#### 4.3 Testing Checkpoint
- [ ] Test new navigation flow
- [ ] Verify time tracking as primary interface
- [ ] Test side menu functionality
- [ ] Ensure check-in review works properly

---

### Phase 5: Polish & Optimization
**Goal**: Refine user experience and performance

#### 5.1 Visual Polish
- [ ] Add warm morning colors to modal
- [ ] Implement smooth transitions
- [ ] Add loading animations
- [ ] Refine typography and spacing

#### 5.2 Performance & Accessibility
- [ ] Optimize modal rendering
- [ ] Add accessibility labels
- [ ] Test screen reader compatibility
- [ ] Optimize for different screen sizes

#### 5.3 Final Testing
- [ ] End-to-end user flow testing
- [ ] Performance testing
- [ ] Cross-platform compatibility
- [ ] Accessibility audit

## 🔧 Technical Implementation Details

### Phase 1 Implementation

#### New Data Models
```typescript
// types/index.ts additions
interface MorningCheckInData {
  id: string;
  date: string; // YYYY-MM-DD format
  energyLevel: number;
  positivityLevel: number;
  emotions: string[];
  reflectionPrompt: string;
  reflectionResponse: string;
  notes?: string;
  completedAt: Date;
}

interface MorningCheckInState {
  isCompleted: boolean;
  completedAt: Date | null;
  data: MorningCheckInData | null;
  shouldShowModal: boolean;
  currentPromptIndex: number;
}
```

#### Store Updates
```typescript
// stores/appStore.ts additions
interface AppState {
  // ... existing state
  morningCheckIn: MorningCheckInState;
  
  // New actions
  completeMorningCheckIn: (data: Omit<MorningCheckInData, 'id' | 'completedAt'>) => void;
  shouldShowMorningModal: () => boolean;
  resetMorningCheckIn: () => void;
  getCurrentPrompt: () => string;
  cycleToNextPrompt: () => void;
}
```

#### Database Schema
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
  UNIQUE(date)
);
```

### Component Architecture

#### New Components Structure
```
src/components/
├── MorningCheckInModal.tsx       # Main modal component
├── SideMenu.tsx                  # Navigation side menu
├── HamburgerButton.tsx           # Menu toggle button
├── CheckInReviewPanel.tsx        # Read-only check-in view
└── TimeTrackingMainScreen.tsx    # Enhanced time tracking
```

#### Modified Components
```
App.tsx                           # Remove tabs, add modal logic
src/components/TopNavigation.tsx  # Convert to hamburger menu
src/screens/TimeTrackingScreen.tsx # Enhance as main interface
```

## 🧪 Testing Strategy

### Phase-by-Phase Testing

#### Phase 1 Tests
- [ ] Unit tests for new data models
- [ ] Integration tests for store updates
- [ ] Database migration tests
- [ ] Prompt cycling logic tests

#### Phase 2 Tests
- [ ] Component testing for modal
- [ ] Form validation tests
- [ ] Data persistence tests
- [ ] User interaction tests

#### Phase 3 Tests
- [ ] Time-based logic tests
- [ ] Daily reset functionality
- [ ] Edge case handling
- [ ] Cross-timezone tests

#### Phase 4 Tests
- [ ] Navigation flow tests
- [ ] Interface integration tests
- [ ] Side menu functionality
- [ ] User experience tests

#### Phase 5 Tests
- [ ] Performance tests
- [ ] Accessibility tests
- [ ] Cross-platform tests
- [ ] End-to-end user flow tests

## 📋 Definition of Done

### Each Phase Completion Criteria
- [ ] All planned features implemented
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No regression in existing functionality
- [ ] Performance remains acceptable

### Overall Project Completion
- [ ] Morning check-in modal working perfectly
- [ ] Time tracking as primary interface
- [ ] Side menu navigation functional
- [ ] All data properly persisted
- [ ] Smooth user experience
- [ ] Cross-platform compatibility
- [ ] Accessibility compliance
- [ ] Performance optimized

## 🎯 Success Metrics

### Technical Metrics
- [ ] Modal load time < 200ms
- [ ] No memory leaks
- [ ] Database queries optimized
- [ ] Accessibility score > 90%

### User Experience Metrics
- [ ] Modal completion rate > 95%
- [ ] Time tracking usage increases
- [ ] User session duration improves
- [ ] No usability issues reported

## 📅 Estimated Timeline

- **Phase 1**: 2-3 days (infrastructure)
- **Phase 2**: 3-4 days (modal implementation)
- **Phase 3**: 2-3 days (time logic)
- **Phase 4**: 3-4 days (interface restructuring)
- **Phase 5**: 2-3 days (polish)

**Total Estimated Time**: 12-17 days

## 🚀 Next Steps

1. **Review this plan** and confirm approach
2. **Start Phase 1** with data model updates
3. **Test incrementally** at each phase
4. **Iterate based on feedback** after each phase
5. **Document learnings** for future development

---

*This phased approach ensures we can test and validate each component before building the next layer, minimizing risk and ensuring a solid foundation.* 