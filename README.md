# 🌱 Acorn - Emotional Awareness & Productivity App

A personal productivity and emotional awareness app that helps users understand how they feel, what they care about, and how they spend their time — all in a lightweight, non-intrusive way.

## 🎯 Vision

Acorn is designed to build clarity, emotional awareness, and productivity insights over time through:
- Daily emotional check-ins
- Self-reflection prompts  
- Time tracking & visualization
- AI-powered pattern recognition

## 🚀 Features (MVP)

### ✅ Completed
- [x] Project setup with React Native + Expo
- [x] TypeScript configuration
- [x] State management with Zustand
- [x] SQLite database structure
- [x] Core data models and types
- [x] Development environment

### 🔄 In Progress
- [ ] Daily Emotional Check-In interface
- [ ] Self-Reflection Prompts
- [ ] Time Tracking functionality
- [ ] Calendar visualization

### 📋 Planned
- [ ] AI insights and clustering
- [ ] Data export functionality
- [ ] Cloud sync (optional)
- [ ] Advanced analytics

## 🏗️ Technical Stack

- **Frontend**: React Native with Expo
- **State Management**: Zustand
- **Database**: SQLite (local-first)
- **UI Components**: Custom components with consistent theming
- **Calendar**: React Native Calendars
- **Charts**: Victory Native (planned)
- **AI/ML**: OpenAI API (planned)

## 📁 Project Structure

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

## 🛠️ Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (via npx)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Acorn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npx expo start
   ```

4. **Run on different platforms**
   ```bash
   # Web
   npx expo start --web
   
   # iOS Simulator (macOS only)
   npx expo start --ios
   
   # Android Emulator
   npx expo start --android
   ```

## 🎨 Design Principles

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
- **Offline-first** - works without internet connection

## 📊 Data Models

### Core Entities

**Emotional Check-In**
- Mood sliders (energy, positivity)
- Emotion selection (multiple choice)
- Optional text description

**Reflection**
- Type: worry or priority
- Free-text content
- Auto-suggested tags

**Time Entry**
- Activity name and category
- Start/end times
- Custom tags

**Insight**
- AI-generated themes and patterns
- Date range associations
- Metadata for correlations

## 🔧 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write descriptive component and function names
- Use meaningful commit messages

### State Management
- Zustand for global state
- Local component state for UI-only data
- Persistent storage via SQLite

### Component Architecture
- Atomic Design approach (atoms, molecules, organisms)
- Custom hooks for business logic
- Error boundaries for graceful error handling

## 🚀 Deployment

### Development
- Expo Development Build for testing
- Hot reloading for rapid iteration

### Production (Planned)
- Expo Application Services (EAS) for building
- Desktop apps via Electron
- Progressive Web App option

## 🛣️ Roadmap

### Phase 1: Foundation (Week 1) ✅
- [x] Basic app structure and navigation
- [x] Data persistence with SQLite
- [x] State management setup

### Phase 2: Core Features (Week 2-3)
- [ ] Daily emotional check-in interface
- [ ] Self-reflection prompts
- [ ] Time tracking foundation

### Phase 3: Visualization (Week 4)
- [ ] Calendar integration
- [ ] Data visualization charts
- [ ] Timeline views

### Phase 4: Intelligence (Week 5-6)
- [ ] AI text analysis
- [ ] Pattern recognition
- [ ] Insights generation

### Phase 5: Polish (Week 7)
- [ ] UI/UX refinement
- [ ] Performance optimization
- [ ] Export functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Expo team for the excellent React Native framework
- Zustand for lightweight state management
- React Native community for amazing libraries 