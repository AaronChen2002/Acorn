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
│   │   ├── calendar/                 # Calendar system ✅
│   │   │   ├── CalendarGrid.tsx
│   │   │   ├── CalendarWeekView.tsx
│   │   │   ├── CalendarMonthView.tsx
│   │   │   ├── ActivityCreationModal.tsx
│   │   │   ├── CategorySelector.tsx
│   │   │   └── TimePicker.tsx
│   │   ├── morning/                  # Morning check-in system ✅
│   │   │   ├── MorningCheckInModal.tsx
│   │   │   ├── MoodSlider.tsx
│   │   │   ├── EmotionButton.tsx
│   │   │   └── CheckInReviewPanel.tsx
│   │   ├── navigation/               # App navigation ✅
│   │   │   ├── TopNavigation.tsx
│   │   │   ├── SideMenu.tsx
│   │   │   └── HamburgerButton.tsx
│   │   ├── google/                   # Google Calendar integration ✅
│   │   │   ├── GoogleCalendarIntegration.tsx
│   │   │   └── GoogleCalendarTest.tsx
│   │   └── analytics/                # Data visualization (Phase 9)
│   │       ├── TimeBreakdownChart.tsx
│   │       ├── MoodTrendChart.tsx
│   │       └── InsightCard.tsx
│   ├── screens/
│   │   ├── TimeTrackingScreen.tsx    # Primary interface ✅
│   │   ├── CheckInScreen.tsx         # Morning check-in ✅
│   │   ├── InsightsScreen.tsx        # AI insights dashboard ✅
│   │   └── DailyPromptScreen.tsx     # Daily prompts ✅
│   ├── services/
│   │   ├── database.ts               # SQLite operations ✅
│   │   ├── webDatabase.ts            # Web-compatible database ✅
│   │   ├── aiService.ts              # OpenAI integration ✅
│   │   ├── googleAuthService.ts      # Google OAuth 2.0 ✅
│   │   ├── googleCalendarService.ts  # Google Calendar API ✅
│   │   ├── backgroundSyncService.ts  # Background sync ✅
│   │   └── eventCategorizationService.ts # AI event categorization ✅
│   ├── stores/
│   │   ├── appStore.ts               # Main Zustand store ✅
│   │   └── calendarStore.ts          # Calendar state management ✅
│   ├── types/
│   │   ├── index.ts                  # Core types ✅
│   │   └── calendar.ts               # Calendar-specific types ✅
│   ├── constants/
│   │   └── index.ts                  # Theme, emotions, prompts ✅
│   └── utils/
│       ├── morningDetection.ts       # Time-based logic ✅
│       ├── database.ts               # Database utilities ✅
│       ├── insightCache.ts           # AI insight caching ✅
│       └── sampleDataGenerator.ts    # Sample data for testing ✅
├── assets/                           # Static assets
├── database/                         # SQLite files
└── docs/                             # Comprehensive documentation
```

## 📋 Development Phases

### Phase 1-7: Foundation & Core Features ✅ COMPLETE

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

#### Phase 6: Interactive Calendar Time Tracking ✅
- ✅ Google Calendar-style 24-hour day view with 15-minute increments
- ✅ Drag-to-select time slot functionality
- ✅ Activity creation modal with rich emotional context
- ✅ Category management and mood rating system
- ✅ Multiple view modes (day, week, month)
- ✅ Real-time calendar updates and conflict detection

#### Phase 7: Google Calendar Integration ✅
- ✅ OAuth 2.0 authentication with PKCE security
- ✅ Google Calendar API integration with event fetching
- ✅ Background sync service (every 5 minutes)
- ✅ AI-powered event categorization using OpenAI
- ✅ First-time user experience improvements
- ✅ Progressive onboarding and graceful degradation
- ✅ Optional setup - app works without Google Calendar

### Phase 8: Advanced Calendar Features (Next 2-3 weeks)
**Goal**: Professional-grade calendar functionality with drag-and-drop interactions

#### Step 8.1: Advanced Interactions
- [ ] Drag and drop to resize existing activities
- [ ] Move activities to different time slots
- [ ] Cross-day activity management
- [ ] Intelligent conflict resolution during moves

#### Step 8.2: Activity Management
- [ ] In-place editing of existing activities
- [ ] Delete activities with confirmation dialogs
- [ ] Search and filter activities by category/tags
- [ ] Bulk operations for multiple activities

#### Step 8.3: Efficiency Features
- [ ] Activity templates for common tasks
- [ ] Quick-add shortcuts and keyboard navigation
- [ ] Recurring activity support
- [ ] Power user keyboard shortcuts

#### Step 8.4: Enhanced Calendar Views
- [ ] Current time indicator showing real-time progress
- [ ] Improved week/month view navigation
- [ ] Zoom controls for time granularity
- [ ] Multi-select for bulk operations

### Phase 9: Interactive Data Visualization (Weeks 4-6)
**Goal**: Beautiful analytics and behavioral insights

#### Step 9.1: Chart Library Integration
- [ ] Add Recharts or Victory Native for cross-platform charting
- [ ] Create base chart components (LineChart, BarChart, PieChart)
- [ ] Implement responsive chart layouts
- [ ] Add smooth animations and transitions

#### Step 9.2: Core Visualizations
- [ ] Interactive pie charts for time allocation
- [ ] Energy trends line chart showing levels over time
- [ ] Mood correlation heatmaps (weekly/monthly)
- [ ] Google Calendar integration visual status
- [ ] Weekly overview dashboard with multiple metrics

#### Step 9.3: Interactive Features
- [ ] Tap to explore data points with details
- [ ] Time range picker (week/month/quarter views)
- [ ] Drill-down navigation from overview to specific days
- [ ] Comparison mode ("This week vs last week")
- [ ] Export insights as shareable images

#### Step 9.4: Enhanced Insights Screen
- [ ] Replace text insights with visual stories
- [ ] "At a Glance" dashboard with key metrics
- [ ] Insight cards with embedded mini-charts
- [ ] Smooth scrolling between visualization sections

### Phase 10: Learning AI with Feedback Loops (Weeks 7-9)
**Goal**: AI that learns from user behavior and improves recommendations

#### Step 10.1: Insight Feedback System
- [ ] Star rating system for insight helpfulness
- [ ] Action tracking ("Did you act on this insight?")
- [ ] Outcome feedback system
- [ ] Dismissal tracking for ignored insights

#### Step 10.2: Behavioral Learning Engine
- [ ] Feedback database for user ratings and actions
- [ ] Learning algorithms that weight future insights
- [ ] Personal insight scoring based on user preferences
- [ ] Continuous recommendation quality improvement

#### Step 10.3: Advanced Pattern Recognition
- [ ] Correlation engine for unexpected data connections
- [ ] Seasonal analysis for monthly/yearly patterns
- [ ] Anomaly detection for unusual weeks
- [ ] Trigger identification for mood/energy changes

#### Step 10.4: Proactive Intelligence
- [ ] Predictive insights based on user patterns
- [ ] Optimal timing suggestions for activities
- [ ] Risk detection for burnout or overwork
- [ ] Personalized morning prompts that evolve
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