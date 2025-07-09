# Acorn - Personal Productivity & Emotional Awareness App

A React Native + Expo cross-platform application designed to help users track their emotional state, complete daily reflections, and manage time effectively through mindful activity tracking.

## 🌟 Project Overview

Acorn is a comprehensive wellness and productivity app that combines:
- **Daily Emotional Check-ins**: Track mood, energy levels, and emotions
- **Reflective Journaling**: Deep daily prompts for self-awareness and growth
- **Mindful Time Tracking**: Activity logging with emotional context
- **AI-Ready Data Collection**: Structured data for future AI insights and recommendations

## 🎯 Core Features

### 1. Daily Emotional Check-In
- Mood tracking with 1-10 scale sliders for energy and positivity
- Multi-select emotion grid with emoji representations
- Free-form notes capturing priorities, concerns, excitement, and challenges
- Cross-platform compatible interface

### 2. Daily Reflection Prompts
- 15 comprehensive prompts covering mental health, productivity, and personal growth
- 2000-character response limit for detailed reflection
- Tag-based categorization system with 20+ categories
- Auto-suggestion and completion for consistent tagging

### 3. Time Tracking with Emotional Context
- Activity description and categorization
- Visual calendar time slot picker (placeholder for future calendar integration)
- Dual emotional tracking: task-specific feelings and general mood
- Comprehensive activity history with duration and emotional data

## 🛠️ Technical Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **State Management**: Zustand
- **Database**: SQLite (expo-sqlite)
- **UI Components**: React Native core components
- **Cross-platform**: Web and mobile compatible

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
npx expo start

# For web development
npx expo start --web

# For mobile development
npx expo start --tunnel
```

### Development Commands
```bash
# Start with cache clear
npx expo start --clear

# Web-specific development
npx expo start --web --clear

# Mobile testing
npx expo start --tunnel
```

## 🏗️ Project Structure

```
Acorn/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── CalendarTimeSlotPicker.tsx
│   │   ├── CategoryDropdown.tsx
│   │   ├── EmotionButton.tsx
│   │   ├── MoodSlider.tsx
│   │   ├── TagInput.tsx
│   │   ├── TimePicker.tsx
│   │   └── TopNavigation.tsx
│   ├── screens/             # Main application screens
│   │   ├── CheckInScreen.tsx
│   │   ├── DailyPromptScreen.tsx
│   │   └── TimeTrackingScreen.tsx
│   ├── stores/              # Zustand state management
│   │   └── appStore.ts
│   ├── services/            # External integrations
│   │   └── database.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── constants/           # App constants and theme
│   │   └── index.ts
│   └── utils/               # Utility functions
├── docs/                    # Documentation
├── database/                # Database files
├── assets/                  # Static assets
└── App.tsx                  # Main application component
```

## 📱 App Navigation

The app uses a simple 3-tab navigation system:
1. **Check-In**: Daily emotional state recording
2. **Reflection**: Deep prompt-based journaling
3. **Time Tracking**: Activity logging with emotional context

## 🔧 Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Consistent component structure and naming
- Cross-platform compatibility maintained

### Component Architecture
- Functional components with React hooks
- Zustand for state management
- Consistent prop typing with TypeScript
- Reusable component design patterns

### Data Management
- SQLite database for persistent storage
- Zustand store for application state
- Conditional database loading for web compatibility
- Structured data collection for AI analysis

## 🚀 Deployment

### Web Deployment
```bash
npx expo export --platform web
# Deploy the generated web-build folder
```

### Mobile Deployment
```bash
# Build for production
npx expo build:android
npx expo build:ios
```

## 🔮 Future Enhancements

- AI-powered insights and recommendations
- Calendar integration for time tracking
- Data visualization and analytics
- Social features and sharing capabilities
- Advanced notification system
- Export and backup functionality

## 📚 Additional Documentation

- [Architecture Guide](docs/ARCHITECTURE.md) - Detailed code structure and patterns
- [Component Documentation](docs/COMPONENTS.md) - Individual component guides
- [Development Workflow](docs/DEVELOPMENT.md) - Development best practices
- [Technical Plan](TECHNICAL_PLAN.md) - Original technical specifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the existing code style and patterns
4. Test cross-platform compatibility
5. Submit a pull request with detailed description

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions, issues, or contributions, please refer to the documentation in the `docs/` directory or open an issue on the repository. 