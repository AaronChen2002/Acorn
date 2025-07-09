# Component Documentation

This document provides detailed information about all UI components in the Acorn app, including their purpose, API, and usage examples.

## 📋 Table of Contents

1. [Navigation Components](#navigation-components)
2. [Form Components](#form-components)
3. [Input Components](#input-components)
4. [Data Display Components](#data-display-components)
5. [Screen Components](#screen-components)

## 🧭 Navigation Components

### TopNavigation

The main navigation component that provides tab-based navigation between screens.

#### Props
```typescript
interface TopNavigationProps {
  currentScreen: string;
  onScreenChange: (screen: string) => void;
}
```

#### Features
- Three-tab navigation: Check-In, Reflection, Time Tracking
- Visual active state indication
- Consistent styling across platforms
- Touch/click handling for both web and mobile

#### Usage
```typescript
<TopNavigation 
  currentScreen={currentScreen}
  onScreenChange={setCurrentScreen}
/>
```

#### Styling
- Uses theme colors for consistent appearance
- Active tab highlighted with primary color
- Responsive design with flex layout

---

## 📝 Form Components

### MoodSlider

A custom slider component for mood tracking using numbered buttons instead of traditional sliders for cross-platform compatibility.

#### Props
```typescript
interface MoodSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  showLabels?: boolean;
}
```

#### Features
- Numbered button interface (1-10 scale)
- Cross-platform compatibility
- Visual feedback for selected value
- Customizable range and labels
- Accessible design with proper touch targets

#### Usage
```typescript
<MoodSlider 
  value={energyLevel}
  onValueChange={setEnergyLevel}
  label="Energy Level"
  min={1}
  max={10}
  showLabels={true}
/>
```

#### Design Pattern
- Uses TouchableOpacity for universal touch handling
- Visual state management with selected/unselected styles
- Consistent spacing and typography

### EmotionButton

A button component for selecting emotions with emoji representations.

#### Props
```typescript
interface EmotionButtonProps {
  emotion: string;
  emoji: string;
  isSelected: boolean;
  onPress: () => void;
}
```

#### Features
- Emoji-based emotion representation
- Multi-select capability
- Visual selection state
- Accessible labeling
- Consistent styling with other buttons

#### Usage
```typescript
<EmotionButton 
  emotion="happy"
  emoji="😊"
  isSelected={selectedEmotions.includes('happy')}
  onPress={() => toggleEmotion('happy')}
/>
```

#### Implementation Details
- Uses conditional styling for selected state
- Emoji rendering consistent across platforms
- Proper touch feedback with activeOpacity

---

## 🔤 Input Components

### TagInput

A sophisticated input component for tag selection with auto-completion and suggestions.

#### Props
```typescript
interface TagInputProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: string[];
  placeholder?: string;
  maxTags?: number;
  label?: string;
}
```

#### Features
- Auto-completion with filtered suggestions
- Tag creation from input
- Visual tag display with removal capability
- Suggestion filtering based on input
- Maximum tag limit enforcement

#### Usage
```typescript
<TagInput 
  selectedTags={selectedTags}
  onTagsChange={setSelectedTags}
  availableTags={ALL_TAGS}
  placeholder="Type to add tags..."
  maxTags={10}
  label="Tags"
/>
```

#### Advanced Features
- Real-time filtering of suggestions
- Keyboard navigation support
- Visual feedback for tag addition/removal
- Duplicate tag prevention

### CategoryDropdown

A dropdown component for selecting activity categories with visual color indicators.

#### Props
```typescript
interface CategoryDropdownProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  label?: string;
}
```

#### Features
- Color-coded category indicators
- Dropdown with scroll support
- Modal-style overlay to prevent z-index issues
- Touch/click outside to close
- Visual selection state

#### Usage
```typescript
<CategoryDropdown 
  selectedCategory={selectedCategory}
  onCategorySelect={setSelectedCategory}
  label="Activity Category"
/>
```

#### Implementation Details
- Uses overlay pattern for proper stacking
- ScrollView for long category lists
- Consistent color indicators from theme
- Platform-optimized touch handling

### TimePicker

A time selection component with 15-minute intervals for time tracking.

#### Props
```typescript
interface TimePickerProps {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  label?: string;
  format?: '12h' | '24h';
}
```

#### Features
- 15-minute interval selection
- 12/24 hour format support
- Visual time display
- Cross-platform time formatting
- Consistent styling with other inputs

#### Usage
```typescript
<TimePicker 
  selectedTime={startTime}
  onTimeSelect={setStartTime}
  label="Start Time"
  format="12h"
/>
```

---

## 📊 Data Display Components

### CalendarTimeSlotPicker

A visual calendar component showing time slots for activity scheduling.

#### Props
```typescript
interface CalendarTimeSlotPickerProps {
  selectedSlots: string[];
  onSlotsChange: (slots: string[]) => void;
  availableSlots?: string[];
  weekOffset?: number;
}
```

#### Features
- 7-day week view
- 15-minute time slots (9 AM - 5 PM)
- Visual slot availability indication
- Multi-select capability
- Color-coded slot states (available, selected, unavailable)

#### Usage
```typescript
<CalendarTimeSlotPicker 
  selectedSlots={selectedSlots}
  onSlotsChange={setSelectedSlots}
  availableSlots={availableSlots}
  weekOffset={0}
/>
```

#### Visual Design
- Grid layout for time slots
- Color coding for different states
- Responsive design for different screen sizes
- Touch-friendly slot selection

#### Future Integration
- Placeholder for calendar integration
- Designed for easy extension to full calendar
- Consistent API for external calendar services

---

## 🖥️ Screen Components

### CheckInScreen

The main screen for daily emotional check-ins.

#### Features
- Mood slider integration
- Emotion selection grid
- Notes input for detailed feelings
- Form validation and submission
- Success feedback

#### Components Used
- `MoodSlider` for energy and positivity
- `EmotionButton` for emotion selection
- `TagInput` for additional tags
- Standard React Native inputs

#### Data Flow
```typescript
User Input → Local State → Validation → Store Action → Database
```

#### User Experience
- Progressive disclosure of form elements
- Clear visual feedback for required fields
- Accessible form labels and instructions
- Smooth transitions between form sections

### DailyPromptScreen

Screen for daily reflection prompts and journaling.

#### Features
- Random daily prompt selection
- Rich text input with character limit
- Tag selection for categorization
- Response history display
- Auto-save functionality

#### Components Used
- `TagInput` for response categorization
- Custom prompt display
- Text input with character counter
- Response history list

#### Prompt System
- 15 comprehensive daily prompts
- Rotation system for variety
- Prompt-specific guidance
- Context-aware tag suggestions

### TimeTrackingScreen

Comprehensive time tracking with emotional context.

#### Features
- Activity description input
- Category selection dropdown
- Time slot picker
- Emotional context questions
- Activity history display

#### Components Used
- `CategoryDropdown` for activity categorization
- `CalendarTimeSlotPicker` for time selection
- `TimePicker` for precise timing
- Activity list display

#### Workflow
1. Activity description input
2. Category selection
3. Time slot picking
4. Emotional context capture
5. Activity logging and history

---

## 🎨 Design System

### Theme Integration

All components use the centralized theme system:

```typescript
// Theme constants used throughout components
THEME = {
  colors: {
    primary: '#007AFF',
    secondary: '#5AC8FA',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
  },
  fontSize: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
};
```

### Responsive Design Patterns

#### Flexible Layouts
- All components use Flexbox for responsive behavior
- Consistent spacing using theme constants
- Platform-appropriate touch targets

#### Cross-Platform Styling
- No platform-specific styles
- Universal color scheme
- Consistent typography across devices

#### Accessibility
- Proper touch target sizes (minimum 44px)
- Accessible color contrast ratios
- Screen reader compatible labels
- Keyboard navigation support

---

## 🔧 Development Patterns

### Component Structure

All components follow a consistent structure:

```typescript
// 1. Imports
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { THEME } from '../constants';

// 2. Interface definitions
interface ComponentProps {
  // Props definition
}

// 3. Component implementation
export const Component: React.FC<ComponentProps> = ({ props }) => {
  // Component logic
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

### Testing Patterns

#### Unit Testing
- Component prop validation
- Event handler testing
- State management testing
- Visual regression testing

#### Integration Testing
- Component interaction testing
- Screen-level functionality
- Cross-platform compatibility
- Performance testing

### Performance Optimization

#### React Optimization
- `React.memo` for expensive components
- `useCallback` for event handlers
- `useMemo` for expensive calculations
- Proper dependency arrays

#### Cross-Platform Performance
- Efficient re-renders
- Memory management
- Platform-specific optimizations
- Bundle size optimization

---

## 🚀 Future Enhancements

### Component Roadmap

#### Enhanced Calendar Integration
- Full calendar view
- Event scheduling
- Calendar sync capabilities
- Advanced time management

#### Advanced Form Components
- Rich text editor
- File attachment support
- Advanced validation
- Multi-step forms

#### Data Visualization
- Chart components
- Progress indicators
- Analytics dashboards
- Export functionality

#### Accessibility Improvements
- Enhanced screen reader support
- Keyboard navigation
- High contrast mode
- Voice control integration

### Extension Points

#### Plugin System
- Custom component registration
- Theme customization
- Feature toggles
- Third-party integrations

#### API Integration
- External service connections
- Real-time data sync
- Cloud backup
- Social features 