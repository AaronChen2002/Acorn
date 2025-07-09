# Acorn - Technical Implementation Plan

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: React Native with Expo (cross-platform: web, iOS, Android)
- **State Management**: Zustand (lightweight, performant)
- **Database**: SQLite (expo-sqlite) for local-first storage
- **UI Components**: Custom component library with warm morning theme
- **Calendar Engine**: Custom-built Google Calendar-style grid system
- **AI Integration**: OpenAI API for natural language processing and pattern analysis
- **Charts**: Custom data visualization components
- **Authentication**: Local-first with optional cloud sync

### Project Structure
```
acorn/
├── src/
│   ├── components/
│   │   ├── calendar/                 # Calendar system (Phase 6-7)
│   │   │   ├── CalendarTimeGrid.tsx
│   │   │   ├── TimeSlotSelector.tsx
│   │   │   ├── ActivityCreationModal.tsx
│   │   │   └── ActivityCard.tsx
│   │   ├── morning/                  # Morning check-in system ✅
│   │   │   ├── MorningCheckInModal.tsx
│   │   │   ├── MoodSlider.tsx
│   │   │   ├── EmotionButton.tsx
│   │   │   └── CheckInReviewPanel.tsx
│   │   ├── navigation/               # App navigation ✅
│   │   │   ├── TopNavigation.tsx
│   │   │   ├── SideMenu.tsx
│   │   │   └── HamburgerButton.tsx
│   │   └── analytics/                # Data visualization (Phase 8)
│   │       ├── TimeBreakdownChart.tsx
│   │       ├── MoodTrendChart.tsx
│   │       └── InsightCard.tsx
│   ├── screens/
│   │   ├── TimeTrackingScreen.tsx    # Primary interface ✅
│   │   └── AnalyticsScreen.tsx       # Future analytics dashboard
│   ├── services/
│   │   ├── database.ts               # SQLite operations ✅
│   │   ├── aiInsights.ts             # OpenAI integration (Phase 9)
│   │   └── analytics.ts              # Data processing (Phase 8)
│   ├── stores/
│   │   ├── appStore.ts               # Main Zustand store ✅
│   │   ├── calendarStore.ts          # Calendar state (Phase 6)
│   │   └── analyticsStore.ts         # Analytics state (Phase 8)
│   ├── types/
│   │   ├── index.ts                  # Core types ✅
│   │   ├── calendar.ts               # Calendar-specific types
│   │   └── analytics.ts              # Analytics types
│   ├── constants/
│   │   └── index.ts                  # Theme, emotions, prompts ✅
│   └── utils/
│       ├── morningDetection.ts       # Time-based logic ✅
│       ├── calendarUtils.ts          # Calendar calculations
│       └── aiUtils.ts                # AI processing helpers
├── assets/                           # Static assets
├── database/                         # SQLite files
└── docs/                             # Comprehensive documentation
```

## 📋 Development Phases

### Phase 1-5: Foundation & Morning Check-in System ✅ COMPLETE

#### Phase 1: Project Setup & Architecture ✅
- ✅ React Native Expo project with TypeScript
- ✅ SQLite database with initial schema
- ✅ Zustand stores for state management
- ✅ Basic navigation structure
- ✅ Component library foundation

#### Phase 2: Morning Check-in Modal ✅
- ✅ Time-based modal appearing after 5 AM
- ✅ Mood slider components (energy & positivity)
- ✅ Emotion button grid with emojis
- ✅ Daily reflection prompts system
- ✅ Data persistence to SQLite

#### Phase 3: Navigation Restructure ✅
- ✅ Time tracking as primary interface
- ✅ Hamburger side menu implementation
- ✅ Check-in review panel
- ✅ Removed tab navigation for cleaner UX

#### Phase 4: Polish & Accessibility ✅
- ✅ Screen reader support and accessibility labels
- ✅ Loading states and smooth animations
- ✅ Cross-platform compatibility (web, iOS, Android)
- ✅ Warm morning color palette

#### Phase 5: Validation & User Experience ✅
- ✅ Form validation requiring minimum engagement
- ✅ Beautiful visual design with sunrise theme
- ✅ Error handling and edge case management
- ✅ Performance optimization

### Phase 6: Interactive Calendar Time Tracking (Next 2-3 weeks)
**Goal**: Google Calendar-style visual time tracking

#### Step 6.1: Calendar Grid Foundation
- [ ] Create 24-hour day view component with 15-minute increments
- [ ] Implement grid layout with proper time labels
- [ ] Add current time indicator
- [ ] Responsive design for mobile and web

#### Step 6.2: Time Slot Selection
- [ ] Drag-to-select functionality for time ranges
- [ ] Visual feedback during selection
- [ ] Touch-optimized interactions for mobile
- [ ] Conflict detection for overlapping times

#### Step 6.3: Activity Creation Modal
- [ ] Rich activity creation interface
- [ ] Category selection and management
- [ ] "How did it go?" mood rating (1-6 scale with emojis)
- [ ] Emotional tags (focused, stressed, collaborative, etc.)
- [ ] Quick reflection text input

#### Step 6.4: Data Integration
- [ ] Time entry database schema updates
- [ ] Calendar store implementation
- [ ] Activity CRUD operations
- [ ] Real-time calendar updates

### Phase 7: Enhanced Calendar Features (Weeks 4-6)
**Goal**: Professional-grade calendar functionality

#### Step 7.1: Multiple View Modes
- [ ] Day view (current implementation)
- [ ] Week view with 7-day layout
- [ ] Month view with activity density indicators
- [ ] Smooth transitions between views

#### Step 7.2: Drag and Drop
- [ ] Resize existing activities
- [ ] Move activities to different time slots
- [ ] Drag from one day to another
- [ ] Conflict resolution during moves

#### Step 7.3: Activity Management
- [ ] Edit existing activities
- [ ] Delete activities with confirmation
- [ ] Search and filter activities
- [ ] Bulk operations for multiple activities

#### Step 7.4: Templates & Efficiency
- [ ] Activity templates for common tasks
- [ ] Quick-add shortcuts
- [ ] Recurring activity support
- [ ] Keyboard shortcuts for power users

### Phase 8: Data Visualization & Pattern Recognition (Weeks 7-9)
**Goal**: Beautiful analytics and behavioral insights

#### Step 8.1: Time Analytics
- [ ] Interactive pie charts for time allocation
- [ ] Category breakdowns with drill-down
- [ ] Weekly/monthly time comparison
- [ ] Productivity metrics dashboard

#### Step 8.2: Mood Correlation Analysis
- [ ] Mood vs. activity type correlations
- [ ] Energy level trends throughout the day
- [ ] Emotional state patterns by day of week
- [ ] Before/after activity mood comparisons

#### Step 8.3: Visual Pattern Recognition
- [ ] Activity heatmaps for time patterns
- [ ] Productivity peak identification
- [ ] Stress pattern visualization
- [ ] Weekly habit tracking charts

#### Step 8.4: Insights Dashboard
- [ ] Personalized insights cards
- [ ] Trend analysis with explanations
- [ ] Goal tracking and progress indicators
- [ ] Exportable reports

### Phase 9: AI-Powered Contextual Insights (Weeks 10-12)
**Goal**: Intelligent analysis of quantitative and qualitative data

#### Step 9.1: AI Data Processing Pipeline
- [ ] OpenAI API integration setup
- [ ] Data anonymization and privacy controls
- [ ] Batch processing for efficiency
- [ ] Local caching of insights

#### Step 9.2: Natural Language Processing
- [ ] Reflection text analysis for emotional patterns
- [ ] Activity description clustering
- [ ] Keyword extraction and themes
- [ ] Sentiment analysis over time

#### Step 9.3: Behavioral Pattern Detection
- [ ] Temporal productivity patterns
- [ ] Activity-mood correlations
- [ ] Stress trigger identification
- [ ] Optimal scheduling recommendations

#### Step 9.4: Intelligent Recommendations
- [ ] Personalized scheduling suggestions
- [ ] Mood-based activity recommendations
- [ ] Break timing optimization
- [ ] Weekly reflection summaries

#### Step 9.5: Smart Notifications
- [ ] Context-aware gentle nudges
- [ ] Optimal timing for check-ins
- [ ] Pattern-based reminders
- [ ] Achievement celebrations

## 🗄️ Database Schema

### Current SQLite Tables ✅
```sql
-- Morning check-ins
CREATE TABLE morning_checkins (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
    positivity_level INTEGER NOT NULL CHECK (positivity_level >= 1 AND positivity_level <= 10),
    emotions TEXT NOT NULL, -- JSON array
    reflection_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Time tracking entries (enhanced for calendar)
CREATE TABLE time_entries (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    activity TEXT NOT NULL,
    category TEXT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    description TEXT,
    mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 6),
    emotional_tags TEXT, -- JSON array
    reflection_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Activity templates (Phase 7)
CREATE TABLE activity_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    default_duration INTEGER, -- minutes
    emotional_tags TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI insights (Phase 9)
CREATE TABLE ai_insights (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'pattern', 'recommendation', 'correlation'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    confidence_score REAL,
    data_points TEXT, -- JSON array of supporting data
    date_range_start DATE,
    date_range_end DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME
);
```

## 🎨 UI/UX Design Principles

### Visual Design
- **Warm morning theme** with sunrise-inspired colors
- **Clean, minimal interface** focused on essential interactions
- **Accessible design** with full screen reader support
- **Smooth animations** that feel natural and responsive

### Color Palette
```css
/* Warm morning colors */
--sunrise-orange: #ff8c42;
--warm-yellow: #ffd662;
--soft-blue: #4ecdc4;
--calm-green: #45b7d1;
--warm-white: #faf8f3;
--soft-gray: #8e8e93;
```

### Interaction Design
- **Drag-to-select** for intuitive time selection
- **Touch-optimized** components for mobile devices
- **Keyboard shortcuts** for power users
- **Contextual feedback** for all user actions

## 🤖 AI Integration Strategy

### Data Collection
- **Quantitative metrics**: Mood scores, activity duration, time patterns
- **Qualitative text**: Reflection content, activity descriptions
- **Behavioral patterns**: App usage, feature engagement, consistency
- **Contextual data**: Time of day, day of week, seasonal patterns

### Privacy & Ethics
- **Local-first processing**: All data stored locally with user control
- **Anonymized AI analysis**: Personal identifiers removed before API calls
- **Transparent recommendations**: Clear explanation of insight generation
- **User control**: Full opt-out capabilities and data deletion

### Processing Pipeline
```
User Input → SQLite Storage → Data Aggregation → 
Privacy Filter → OpenAI API → Pattern Analysis → 
Personalized Insights → Local Cache → User Interface
```

## 📱 Cross-Platform Strategy

### Web (Primary Development)
- **Responsive design** for desktop and mobile browsers
- **PWA capabilities** for offline functionality
- **Fast development iteration** with hot reload

### Mobile (iOS & Android)
- **Native feel** with platform-specific optimizations
- **Touch interactions** optimized for mobile gestures
- **Performance optimization** for smooth scrolling and animations

### Desktop (Future)
- **Electron wrapper** for native desktop experience
- **Keyboard shortcuts** for productivity workflows
- **Multi-window support** for power users

## 🔄 Development Workflow

### Daily Development
1. **Morning check-in** (dogfooding our own app)
2. **Feature development** with test-driven approach
3. **Cross-platform testing** on web and mobile
4. **Documentation updates** for new features

### Weekly Sprints
- **Sprint planning** with user story prioritization
- **Mid-sprint check-ins** for course correction
- **Sprint reviews** with stakeholder feedback
- **Retrospectives** for continuous improvement

### Quality Assurance
- **TypeScript strict mode** for type safety
- **ESLint/Prettier** for code consistency
- **Cross-platform testing** before merges
- **Performance monitoring** with metrics

## 🚀 Deployment Strategy

### Web Deployment
- **Expo web build** for static site generation
- **Vercel deployment** for fast global distribution
- **Progressive Web App** for offline capabilities

### Mobile Deployment
- **Expo EAS Build** for cloud-based builds
- **App Store Connect** for iOS distribution
- **Google Play Console** for Android distribution

### Future Considerations
- **Desktop distribution** via Electron
- **Enterprise deployment** for organizational use
- **API backend** for advanced features and sync 