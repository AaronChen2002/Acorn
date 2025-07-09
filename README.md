# Acorn - Personal Productivity & Emotional Awareness App

A React Native + Expo cross-platform application designed to help users start their day with intention through morning rituals, track time with rich emotional context, and gain AI-powered insights about their mood and behavior patterns.

## 🌟 Project Overview

Acorn is a **morning ritual and mindful productivity app** that combines:
- **🌅 Morning Check-in Ritual**: Daily emotional awareness modal with reflection prompts
- **⏰ Visual Time Tracking**: Google Calendar-style interface for activity logging
- **📊 Mood & Behavior Analytics**: Correlations between activities, emotions, and productivity
- **🤖 AI-Powered Insights**: Contextual analysis of quantitative and qualitative data for personalized recommendations

## ✅ Current Features (Phases 1-5 Complete)

### 🌅 Morning Ritual System
- **Time-based modal** that appears after 5 AM daily
- **Warm sunrise theme** with beautiful visual design
- **Mood tracking** with custom slider components (energy & positivity levels)
- **Emotion selection** with emoji-based grid interface
- **Daily reflection prompts** with cycling questions for deeper self-awareness
- **Smart validation** requiring minimum engagement for meaningful data

### 🍃 Streamlined Navigation
- **Time tracking as primary interface** - focus on daily productivity
- **Hamburger side menu** - clean, minimal navigation
- **Check-in review panel** - access completed morning rituals
- **No tabs** - reduced cognitive load with single-screen focus

### ♿ Accessibility & Polish
- **Full screen reader support** with comprehensive accessibility labels
- **Smooth animations** with loading states and transitions
- **Cross-platform compatibility** (web, iOS, Android)
- **No external dependencies** for core functionality
- **Warm morning color palette** for calming, intentional experience

## 🚀 Upcoming Features (Phases 6-9 Roadmap)

### Phase 6: Interactive Calendar Time Tracking (Next 2-3 weeks)
**Goal**: Google Calendar-style visual time tracking

- **📅 Calendar grid component** with 24-hour day view in 15-minute increments
- **🖱️ Drag-to-select time slots** for intuitive activity creation
- **⚡ Real-time activity modal** with rich emotional context capture:
  - Activity description and category
  - "How did it go?" mood rating (1-6 scale with emojis)
  - Emotional tags (focused, stressed, collaborative, etc.)
  - Quick reflection text
- **🎯 Smart conflict detection** preventing overlapping activities
- **📱 Mobile-optimized** touch interactions

### Phase 7: Enhanced Calendar Features (Weeks 4-6)
**Goal**: Professional-grade calendar functionality

- **📊 Multiple view modes**: Day, Week, Month views
- **✋ Drag and drop**: Resize and move existing activities
- **🔍 Activity management**: Edit, delete, search, and filter
- **📋 Activity templates** for quick entry of common tasks
- **⏰ Current time indicator** showing real-time progress

### Phase 8: Data Visualization & Pattern Recognition (Weeks 7-9)
**Goal**: Beautiful analytics and behavioral insights

- **📈 Time allocation analytics** with interactive pie charts and breakdowns
- **😊 Mood correlation charts** showing how activities affect emotional state
- **⚡ Energy level trends** throughout different times of day
- **🧠 Productivity patterns** identifying peak performance windows
- **📊 Weekly comparisons** and progress tracking
- **🎨 Activity heatmaps** for visual pattern recognition

### Phase 9: AI-Powered Contextual Insights (Weeks 10-12)
**Goal**: Intelligent analysis of quantitative and qualitative data

#### 🤖 **AI Data Integration**
- **Quantitative analysis**: Time patterns, mood scores, activity duration
- **Qualitative analysis**: Natural language processing of reflection text and activity descriptions
- **Behavioral pattern detection**: Correlation between emotions, activities, and productivity
- **Contextual recommendations**: Personalized suggestions based on individual patterns

#### 🧠 **Smart Insights Engine**
- **"You're most creative on Tuesday mornings"** - temporal productivity patterns
- **"Meetings after lunch tend to lower your energy"** - activity-mood correlations  
- **"Your reflection mentions 'stress' 60% more on Mondays"** - emotional pattern detection
- **"You have 2 unscheduled hours during your peak focus time"** - optimization suggestions
- **"Your energy peaks when you complete morning check-ins"** - ritual effectiveness tracking

#### 📱 **Intelligent Notifications**
- **Gentle nudges** based on behavioral patterns (not intrusive)
- **Optimal scheduling suggestions** for different activity types
- **Mood-based recommendations** for break timing and activity selection
- **Weekly reflection summaries** with AI-generated insights

## 🛠️ Technical Stack

- **Framework**: React Native + Expo (cross-platform)
- **Language**: TypeScript (strict mode)
- **State Management**: Zustand (lightweight, performant)
- **Database**: SQLite (expo-sqlite) for local-first storage
- **UI Components**: Custom component library with warm morning theme
- **Calendar Engine**: Custom-built Google Calendar-style grid system
- **AI Integration**: OpenAI API for natural language processing and pattern analysis
- **Charts**: Custom data visualization components

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
├── docs/                             # Comprehensive documentation
│   ├── ARCHITECTURE.md               # System design
│   ├── COMPONENTS.md                 # Component documentation
│   ├── DATA_MODELS.md                # Database schemas
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

### AI Processing Pipeline
```
User Input → Local Database → Privacy-First Processing → OpenAI API → 
Pattern Analysis → Personalized Insights → Gentle Recommendations
```

### Privacy & Ethics
- **Local-first**: All data stored locally with optional cloud sync
- **Anonymized processing**: Personal identifiers removed before AI analysis
- **User control**: Full data export, deletion, and AI opt-out capabilities
- **Transparent insights**: Clear explanation of how recommendations are generated

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