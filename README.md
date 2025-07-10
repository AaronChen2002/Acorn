# Acorn - Personal Productivity & Emotional Awareness App

A React Native + Expo cross-platform application designed to help users start their day with intention through morning rituals, track time with rich emotional context, and gain AI-powered insights about their mood and behavior patterns.

## 🌟 Project Overview

Acorn is a **morning ritual and mindful productivity app** that combines:
- **🌅 Morning Check-in Ritual**: Daily emotional awareness modal with reflection prompts
- **⏰ Visual Time Tracking**: Google Calendar-style interface for activity logging
- **📊 Mood & Behavior Analytics**: Correlations between activities, emotions, and productivity
- **🤖 AI-Powered Insights**: Contextual analysis of quantitative and qualitative data for personalized recommendations

## ✅ Current Features (Phases 1-6 Complete)

### 🌅 Morning Ritual System
- **Time-based modal** that appears after 5 AM daily
- **Warm sunrise theme** with beautiful visual design
- **Mood tracking** with custom slider components (energy & positivity levels)
- **Emotion selection** with emoji-based grid interface
- **AI-powered personalized reflection prompts** that adapt to your patterns
- **Smart validation** requiring minimum engagement for meaningful data
- **Test mode toggle** for development and privacy control

### 📅 Interactive Calendar Time Tracking
- **Google Calendar-style visual interface** with 24-hour day view
- **Drag-to-select time slots** for intuitive activity creation
- **Real-time activity modal** with rich emotional context capture
- **Activity categorization** with AI-powered suggestions
- **Mood rating and emotional tags** for each activity
- **Quick reflection text** to capture context and insights
- **Smart conflict detection** preventing overlapping activities
- **Multiple view modes**: Week and Month views with dynamic width calculations

### 🤖 AI-Powered Insights with Long-term Caching
- **Intelligent pattern recognition** analyzing your check-ins and activities
- **Personalized weekly insights** with trend analysis and correlations
- **Smart caching system** for instant loading and performance optimization
- **Data hash validation** to detect changes and refresh insights when needed
- **Long-term analysis** supporting weekly, monthly, and quarterly periods
- **Test mode support** using sample data for development and privacy
- **Dynamic insight generation** showing 1-10+ insights based on actual patterns

### 🍃 Streamlined Navigation
- **Time tracking as primary interface** - focus on daily productivity
- **Hamburger side menu** - clean, minimal navigation with developer settings
- **Check-in review panel** - access completed morning rituals
- **Insights screen** - dedicated space for AI-generated pattern analysis
- **No tabs** - reduced cognitive load with single-screen focus

### ♿ Accessibility & Polish
- **Full screen reader support** with comprehensive accessibility labels
- **Smooth animations** with loading states and transitions
- **Cross-platform compatibility** (web, iOS, Android)
- **Performance optimized** with database indexing and efficient queries
- **Warm morning color palette** for calming, intentional experience

## 🚀 Upcoming Features (Phases 7-9 Roadmap)

### Phase 7: Enhanced Calendar Features (Next 2-3 weeks)
**Goal**: Professional-grade calendar functionality

- **✋ Drag and drop**: Resize and move existing activities
- **🔍 Activity management**: Edit, delete, search, and filter
- **📋 Activity templates** for quick entry of common tasks
- **⏰ Current time indicator** showing real-time progress
- **🎯 Smart scheduling suggestions** based on energy patterns
- **📱 Enhanced mobile interactions** with gesture support

### Phase 8: Advanced Data Visualization (Weeks 4-6)
**Goal**: Beautiful analytics and behavioral insights

- **📈 Time allocation analytics** with interactive pie charts and breakdowns
- **😊 Mood correlation charts** showing how activities affect emotional state
- **⚡ Energy level trends** throughout different times of day
- **🧠 Productivity patterns** identifying peak performance windows
- **📊 Weekly/monthly comparisons** and progress tracking
- **🎨 Activity heatmaps** for visual pattern recognition
- **🔄 Insight trend analysis** showing how patterns evolve over time

### Phase 9: Enhanced AI & Personalization (Weeks 7-9)
**Goal**: Deeper intelligence and contextual recommendations

#### 🤖 **Advanced AI Features**
- **Predictive insights**: Forecast energy levels and productivity patterns
- **Contextual recommendations**: Personalized suggestions based on current state
- **Natural language queries**: "How do I feel after morning workouts?"
- **Smart scheduling**: AI-suggested optimal timing for different activities
- **Habit formation tracking**: Monitor and encourage positive behavioral changes

#### 🧠 **Enhanced Insights Engine**
- **Cross-period analysis**: Compare patterns across weeks, months, and seasons
- **Goal achievement correlation**: Link daily habits to long-term objective completion
- **Stress pattern recognition**: Identify and suggest mitigation strategies
- **Productivity optimization**: Personalized recommendations for peak performance
- **Emotional intelligence**: Deep understanding of mood triggers and patterns

#### 📱 **Intelligent Notifications**
- **Gentle nudges** based on behavioral patterns (not intrusive)
- **Optimal scheduling suggestions** for different activity types
- **Mood-based recommendations** for break timing and activity selection
- **Weekly reflection summaries** with AI-generated insights
- **Proactive wellness suggestions** based on detected patterns

## 🛠️ Technical Stack

- **Framework**: React Native + Expo (cross-platform)
- **Language**: TypeScript (strict mode)
- **State Management**: Zustand (lightweight, performant)
- **Database**: SQLite (expo-sqlite) with optimized schemas and indexing
- **UI Components**: Custom component library with warm morning theme
- **Calendar Engine**: Custom-built Google Calendar-style grid system
- **AI Integration**: OpenAI API with intelligent caching and pattern analysis
- **Caching System**: Long-term insight caching with data hash validation
- **Charts**: Custom data visualization components
- **Performance**: Database indexing, efficient queries, and smart caching

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd Acorn

# Install dependencies
npm install

# Start development server
npm run web          # For web development (recommended)
npm run start        # For mobile development

# Access the app
# Web: http://localhost:8081
# Mobile: Scan QR code with Expo Go app
```

### Development Commands
```bash
# Clear cache and restart
npm run web -- --clear

# Mobile testing with tunnel
npm run start -- --tunnel

# Type checking
npx tsc --noEmit
```

## 🏗️ Project Structure

```
Acorn/
├── src/
│   ├── components/
│   │   ├── calendar/                 # Calendar system ✅
│   │   │   ├── CalendarGrid.tsx
│   │   │   ├── CalendarHeader.tsx
│   │   │   ├── CalendarMonthView.tsx
│   │   │   ├── CalendarWeekView.tsx
│   │   │   ├── CalendarTimeSlotPicker.tsx
│   │   │   ├── ActivityCreationModal.tsx
│   │   │   ├── CategorySelector.tsx
│   │   │   ├── CategoryDropdown.tsx
│   │   │   ├── TimePicker.tsx
│   │   │   └── ViewModeSwitcher.tsx
│   │   ├── morning/                  # Morning check-in system ✅
│   │   │   ├── MorningCheckInModal.tsx
│   │   │   ├── MoodSlider.tsx
│   │   │   ├── EmotionButton.tsx
│   │   │   └── CheckInReviewPanel.tsx
│   │   ├── navigation/               # App navigation ✅
│   │   │   ├── TopNavigation.tsx
│   │   │   ├── SideMenu.tsx
│   │   │   └── HamburgerButton.tsx
│   │   └── TagInput.tsx              # Shared components
│   ├── screens/
│   │   ├── TimeTrackingScreen.tsx    # Primary interface ✅
│   │   ├── CheckInScreen.tsx         # Morning check-in screen ✅
│   │   ├── DailyPromptScreen.tsx     # Daily prompts screen ✅
│   │   └── InsightsScreen.tsx        # AI insights dashboard ✅
│   ├── services/
│   │   ├── database.ts               # SQLite operations with caching ✅
│   │   ├── webDatabase.ts            # Web-compatible database ✅
│   │   └── aiService.ts              # OpenAI integration with caching ✅
│   ├── stores/
│   │   ├── appStore.ts               # Main Zustand store with caching ✅
│   │   └── calendarStore.ts          # Calendar state management ✅
│   ├── types/
│   │   ├── index.ts                  # Core types with insights ✅
│   │   └── calendar.ts               # Calendar-specific types ✅
│   ├── constants/
│   │   └── index.ts                  # Theme, emotions, prompts ✅
│   └── utils/
│       ├── morningDetection.ts       # Time-based logic ✅
│       ├── database.ts               # Database utilities ✅
│       ├── theme.ts                  # Theme utilities ✅
│       └── insightCache.ts           # Caching utilities ✅
├── docs/                             # Comprehensive documentation
│   ├── ARCHITECTURE.md               # System design
│   ├── COMPONENTS.md                 # Component documentation
│   ├── DATA_MODELS.md                # Database schemas
│   ├── DEVELOPMENT.md                # Development guide
│   ├── IMPLEMENTATION_PLAN.md        # Phase-by-phase plan
│   └── PRD_MORNING_CHECKIN_RESTRUCTURE.md
├── assets/                           # Static assets
├── database/                         # SQLite files
└── App.tsx                           # Main application entry ✅
```

## 🧠 AI Integration Strategy

### Data Collection for AI Analysis
- **Quantitative metrics**: Mood scores, activity duration, completion rates, time patterns
- **Qualitative text**: Morning reflections, activity descriptions, notes
- **Behavioral patterns**: App usage timing, feature engagement, ritual consistency
- **Contextual data**: Day of week, time of day, activity categories, emotional states
- **Goal tracking**: Daily intentions, completion rates, and pattern analysis

### Enhanced AI Processing Pipeline
```
User Input → Local Database → Data Hash Generation → Cache Check → 
AI Analysis (if needed) → Pattern Recognition → Personalized Insights → 
Long-term Caching → Intelligent Recommendations
```

### Smart Caching System
- **Data hash validation**: Detects changes to invalidate stale insights
- **Time-based periods**: Weekly, monthly, quarterly analysis with proper boundaries
- **Performance optimization**: Instant loading with 24-hour cache expiration
- **Database indexing**: Efficient queries with optimized schemas
- **Cleanup management**: Automatic removal of outdated insights

### AI-Powered Features
- **Activity categorization**: Intelligent classification of user activities
- **Personalized prompts**: Dynamic reflection questions based on patterns
- **Pattern recognition**: Correlations between sleep, energy, activities, and mood
- **Trend analysis**: Long-term behavior and productivity pattern identification
- **Contextual insights**: Specific, actionable recommendations with emoji icons

### Privacy & Ethics
- **Local-first**: All data stored locally with optional cloud sync
- **Test mode**: Sample data processing for development and privacy control
- **User control**: Full data export, deletion, and AI opt-out capabilities
- **Transparent insights**: Clear explanation of how recommendations are generated
- **No personal assumptions**: Generic insights that avoid specific life circumstances

## 📱 User Experience Philosophy

### 🌅 **Intentional Mornings**
- Start each day with mindful awareness
- Quick but meaningful emotional check-in
- Gentle prompts for self-reflection

### ⏰ **Mindful Productivity**
- Visual time tracking that feels natural
- Rich emotional context for activities
- Focus on understanding, not just measuring

### 🤖 **Intelligent Insights**
- AI that enhances self-awareness without being intrusive
- Patterns revealed through data, not assumptions
- Recommendations that respect individual differences

## 🔮 Future Vision

Acorn aims to become the **most thoughtful productivity app** - one that helps users understand not just what they do, but how they feel while doing it. Through the combination of intentional morning rituals, rich time tracking, and AI-powered insights, we're building a tool for genuine self-awareness and sustainable productivity.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch following our phase structure
3. Follow existing code patterns and TypeScript conventions
4. Test cross-platform compatibility (web and mobile)
5. Update relevant documentation
6. Submit a pull request with detailed description

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support & Documentation

- [Architecture Guide](docs/ARCHITECTURE.md) - Technical design patterns
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) - Phase-by-phase development
- [Component Documentation](docs/COMPONENTS.md) - Individual component guides
- [Data Models](docs/DATA_MODELS.md) - Database schemas and types

For questions or contributions, please open an issue or refer to the comprehensive documentation in the `docs/` directory. 