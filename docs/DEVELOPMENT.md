# Development Workflow

This document outlines the development workflow, best practices, and processes for contributing to the Acorn app.

## 📋 Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Code Standards](#code-standards)
3. [Development Process](#development-process)
4. [Testing Guidelines](#testing-guidelines)
5. [Deployment Process](#deployment-process)
6. [Troubleshooting](#troubleshooting)

## 🛠️ Development Environment Setup

### Prerequisites

#### Required Software
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or yarn equivalent)
- **Expo CLI**: Latest version
- **Git**: Latest version

#### Development Tools
- **VS Code** (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - React Native Tools
  - Expo Tools
  - ESLint
  - Prettier
  - Auto Import - ES6, TS, JSX, TSX

#### Platform-Specific Setup

##### macOS (iOS + Android + Web)
```bash
# Install Xcode (for iOS development)
# Install Android Studio (for Android development)
# Install Expo CLI
npm install -g @expo/cli

# Install iOS Simulator dependencies
npx expo install --ios

# Install Android Emulator dependencies  
npx expo install --android
```

##### Windows (Android + Web)
```bash
# Install Android Studio
# Install Expo CLI
npm install -g @expo/cli

# Install Android dependencies
npx expo install --android
```

##### Linux (Android + Web)
```bash
# Install Android Studio
# Install Expo CLI
npm install -g @expo/cli

# Install Android dependencies
npx expo install --android
```

### Project Setup

#### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd Acorn

# Install dependencies
npm install

# Initialize development environment
npm run setup

# Start development server
npm run dev
```

#### Environment Configuration
Create a `.env` file in the root directory:
```env
# Development settings
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_DEBUG=true

# Database settings
DB_NAME=acorn_dev.db
DB_VERSION=1

# Feature flags
ENABLE_AI_INSIGHTS=false
ENABLE_CLOUD_SYNC=false
```

---

## 📋 Code Standards

### TypeScript Standards

#### Type Definitions
```typescript
// Always use interfaces for object types
interface UserData {
  id: string;
  name: string;
  email: string;
}

// Use type aliases for unions and primitives
type Status = 'loading' | 'success' | 'error';
type UserId = string;

// Prefer explicit return types for functions
const fetchUserData = async (id: string): Promise<UserData> => {
  // Implementation
};
```

#### Component Typing
```typescript
// Always type component props
interface ComponentProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

// Use React.FC for functional components
export const MyComponent: React.FC<ComponentProps> = ({ 
  title, 
  onPress, 
  disabled = false 
}) => {
  // Component implementation
};
```

### Code Structure Standards

#### File Organization
```
src/
├── components/
│   ├── ComponentName.tsx          # Component implementation
│   ├── ComponentName.test.tsx     # Component tests
│   └── index.ts                   # Export definitions
├── screens/
│   ├── ScreenName.tsx            # Screen implementation
│   └── ScreenName.test.tsx       # Screen tests
├── hooks/
│   ├── useCustomHook.ts          # Custom hook
│   └── useCustomHook.test.ts     # Hook tests
└── utils/
    ├── utilityName.ts            # Utility functions
    └── utilityName.test.ts       # Utility tests
```

#### Component Structure
```typescript
// 1. Imports (external first, then internal)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppStore } from '../stores/appStore';
import { THEME } from '../constants';

// 2. Type definitions
interface ComponentProps {
  // Props definition
}

// 3. Component implementation
export const ComponentName: React.FC<ComponentProps> = ({ props }) => {
  // 3.1. Hooks
  const [localState, setLocalState] = useState();
  const { storeData } = useAppStore();

  // 3.2. Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // 3.3. Event handlers
  const handlePress = useCallback(() => {
    // Handler logic
  }, []);

  // 3.4. Render
  return (
    <View style={styles.container}>
      {/* Component JSX */}
    </View>
  );
};

// 4. Styles
const styles = StyleSheet.create({
  container: {
    // Styles using theme constants
  },
});
```

### Naming Conventions

#### Files and Directories
- **Components**: PascalCase (`MoodSlider.tsx`)
- **Screens**: PascalCase with Screen suffix (`CheckInScreen.tsx`)
- **Hooks**: camelCase with use prefix (`useEmotionData.ts`)
- **Utils**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`THEME.ts`)

#### Variables and Functions
- **Variables**: camelCase (`selectedEmotion`)
- **Functions**: camelCase (`handleEmotionSelect`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_EMOTIONS`)
- **Interfaces**: PascalCase (`EmotionData`)
- **Types**: PascalCase (`EmotionType`)

### ESLint Configuration

#### Rules
```json
{
  "extends": [
    "@expo/eslint-config-expo",
    "eslint:recommended",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "react-native/no-unused-styles": "error",
    "react-native/no-inline-styles": "error",
    "react-native/no-color-literals": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

---

## 🔄 Development Process

### Git Workflow

#### Branch Strategy
```bash
# Main branches
main                    # Production-ready code
develop                 # Integration branch

# Feature branches
feature/mood-slider     # New feature development
bugfix/dropdown-zindex  # Bug fixes
hotfix/critical-fix     # Critical production fixes
```

#### Commit Messages
Follow conventional commits format:
```bash
# Format: <type>(<scope>): <description>
feat(components): add MoodSlider component
fix(dropdown): resolve z-index overlay issue
docs(readme): update setup instructions
refactor(store): optimize state management
test(components): add MoodSlider tests
```

#### Pull Request Process
1. Create feature branch from `develop`
2. Implement changes with tests
3. Ensure all tests pass
4. Create PR with detailed description
5. Code review and feedback
6. Merge to `develop`
7. Deploy to staging for testing

### Development Workflow

#### Daily Development
```bash
# Start of day
git pull origin develop
npm run dev

# During development
npm run test:watch        # Run tests in watch mode
npm run lint:watch       # Run linting in watch mode
npm run type:check       # Check TypeScript types

# Before committing
npm run test             # Run all tests
npm run lint             # Run linting
npm run type:check       # Check types
npm run build:check      # Verify build works
```

#### Feature Development
1. **Planning**: Create GitHub issue with requirements
2. **Design**: Create component/screen mockups if needed
3. **Implementation**: 
   - Write component/screen code
   - Add comprehensive tests
   - Update documentation
4. **Testing**: 
   - Unit tests
   - Integration tests
   - Cross-platform testing
5. **Review**: Submit PR for code review
6. **Deployment**: Merge and deploy

### Code Review Guidelines

#### What to Review
- **Functionality**: Does the code work as expected?
- **Performance**: Are there any performance issues?
- **Security**: Are there any security vulnerabilities?
- **Maintainability**: Is the code easy to understand and maintain?
- **Testing**: Are there adequate tests?
- **Documentation**: Is the code properly documented?

#### Review Checklist
- [ ] Code follows project standards
- [ ] All tests pass
- [ ] Cross-platform compatibility maintained
- [ ] Performance impact acceptable
- [ ] Security best practices followed
- [ ] Documentation updated

---

## 🧪 Testing Guidelines

### Testing Strategy

#### Test Types
1. **Unit Tests**: Individual component/function testing
2. **Integration Tests**: Component interaction testing
3. **End-to-End Tests**: Full user flow testing
4. **Performance Tests**: Performance and memory testing
5. **Cross-Platform Tests**: Platform-specific testing

#### Test Structure
```typescript
// ComponentName.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MoodSlider } from './MoodSlider';

describe('MoodSlider', () => {
  const mockOnValueChange = jest.fn();
  
  beforeEach(() => {
    mockOnValueChange.mockClear();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <MoodSlider 
        value={5} 
        onValueChange={mockOnValueChange}
        label="Test Slider" 
      />
    );
    
    expect(getByText('Test Slider')).toBeTruthy();
  });

  it('handles value changes', () => {
    const { getByText } = render(
      <MoodSlider 
        value={5} 
        onValueChange={mockOnValueChange}
        label="Test Slider" 
      />
    );
    
    fireEvent.press(getByText('7'));
    expect(mockOnValueChange).toHaveBeenCalledWith(7);
  });
});
```

#### Test Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- ComponentName.test.tsx

# Run cross-platform tests
npm run test:ios
npm run test:android
npm run test:web
```

### Testing Best Practices

#### Component Testing
- Test component rendering
- Test prop handling
- Test user interactions
- Test error states
- Test accessibility

#### Store Testing
- Test state updates
- Test async actions
- Test error handling
- Test data persistence

#### Integration Testing
- Test component interactions
- Test screen navigation
- Test data flow
- Test API integrations

---

## 🚀 Deployment Process

### Build Process

#### Development Build
```bash
# Web development build
npm run build:web:dev

# Mobile development build
npx expo build:android --type apk
npx expo build:ios --type simulator
```

#### Production Build
```bash
# Web production build
npm run build:web:prod

# Mobile production build
npx expo build:android --type app-bundle
npx expo build:ios --type archive
```

### Deployment Environments

#### Development
- **Purpose**: Feature development and testing
- **Deploy**: Automatic on push to feature branches
- **URL**: `https://dev-acorn.example.com`

#### Staging
- **Purpose**: Integration testing and QA
- **Deploy**: Automatic on push to develop branch
- **URL**: `https://staging-acorn.example.com`

#### Production
- **Purpose**: Live application
- **Deploy**: Manual trigger from main branch
- **URL**: `https://acorn.example.com`

### Deployment Checklist

#### Pre-Deployment
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Documentation updated

#### Deployment Steps
1. Merge to appropriate branch
2. Automated build process
3. Deploy to environment
4. Run smoke tests
5. Monitor for issues

#### Post-Deployment
- [ ] Functionality verification
- [ ] Performance monitoring
- [ ] Error monitoring
- [ ] User feedback monitoring

---

## 🔧 Troubleshooting

### Common Issues

#### Build Issues

**Metro bundler cache issues:**
```bash
# Clear Metro cache
npx expo start --clear

# Clear npm cache
npm cache clean --force

# Clear node_modules
rm -rf node_modules
npm install
```

**TypeScript compilation errors:**
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Clear TypeScript cache
rm -rf .tsc-cache
```

#### Development Issues

**Hot reload not working:**
```bash
# Restart development server
npx expo start --clear

# Check network connectivity
# Ensure device/emulator is on same network
```

**Component not updating:**
```bash
# Check for infinite loops in useEffect
# Verify component key prop
# Check React DevTools for re-renders
```

#### Cross-Platform Issues

**Web-specific issues:**
```bash
# Check browser console for errors
# Verify web-compatible APIs used
# Test responsive design
```

**Mobile-specific issues:**
```bash
# Check device logs
# Verify platform-specific permissions
# Test on multiple devices
```

### Debugging Tools

#### React Native Debugger
```bash
# Install React Native Debugger
# Connect to development server
# Use Redux DevTools for state inspection
```

#### Expo DevTools
```bash
# Access via Expo CLI
# Use for performance profiling
# Check network requests
```

#### Browser DevTools
```bash
# For web development
# Use React DevTools extension
# Monitor network and performance
```

### Performance Optimization

#### Bundle Analysis
```bash
# Analyze bundle size
npx expo export --platform web --dev false
npx analyze-bundle web-build/static/js/*.js
```

#### Memory Profiling
```bash
# Use React Native performance monitor
# Check for memory leaks
# Optimize component re-renders
```

#### Database Optimization
```bash
# Check query performance
# Optimize database indexes
# Monitor database size
```

---

## 📚 Additional Resources

### Documentation Links
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Testing Library Documentation](https://testing-library.com/)

### Learning Resources
- [React Native Best Practices](https://github.com/facebook/react-native/blob/main/CONTRIBUTING.md)
- [Expo Best Practices](https://docs.expo.dev/guides/best-practices/)
- [TypeScript Best Practices](https://typescript-eslint.io/docs/linting/troubleshooting)

### Community Resources
- [React Native Community](https://reactnative.dev/community/overview)
- [Expo Community](https://expo.dev/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

### Tools and Extensions
- [React Native Tools](https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native)
- [Expo Tools](https://marketplace.visualstudio.com/items?itemName=expo.vscode-expo-tools)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) 