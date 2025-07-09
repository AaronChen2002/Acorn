// Core data structures for Acorn app

export interface EmotionalCheckIn {
  id: string;
  date: Date;
  mood_energy: number; // 1-10 scale
  mood_positivity: number; // 1-10 scale
  emotions: string[]; // ['stressed', 'energized', etc.]
  description?: string;
  created_at: Date;
}

export interface Reflection {
  id: string;
  date: Date;
  type: 'worry' | 'priority';
  content: string;
  tags: string[];
  created_at: Date;
}

export interface TimeEntry {
  id: string;
  date: Date;
  activity: string;
  category: string;
  start_time: Date;
  end_time: Date;
  tags: string[];
  created_at: Date;
}

export interface Insight {
  id: string;
  type: 'theme' | 'pattern' | 'correlation';
  content: string;
  metadata: Record<string, any>;
  date_range_start: Date;
  date_range_end: Date;
  created_at: Date;
}

// UI Types
export interface AppTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
}

// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  CheckIn: undefined;
  Reflection: { type: 'worry' | 'priority' };
  TimeEntry: undefined;
  Calendar: undefined;
  Insights: undefined;
  Settings: undefined;
};

// Component Props
export interface MoodSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
}

export interface EmotionButtonProps {
  emotion: string;
  emoji: string;
  selected: boolean;
  onPress: () => void;
}

export interface TagInputProps {
  tags: string[];
  suggestions: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}
