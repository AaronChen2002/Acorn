// Core data structures for Acorn app

export interface EmotionalCheckIn {
  id: string;
  date: Date;
  energyLevel: number; // 1-10 scale (standardized naming)
  positivityLevel: number; // 1-10 scale (standardized naming)
  emotions: string[]; // ['stressed', 'energized', etc.]
  description?: string;
  created_at: Date;
}

export interface Reflection {
  id: string;
  date: Date;
  type: 'daily_prompt';
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
  content: string;
  type: 'trend' | 'pattern' | 'correlation' | 'habit' | 'energy' | 'productivity';
  icon: string;
  timePeriod: 'week' | 'month' | 'quarter' | 'year';
  periodStart: Date;
  periodEnd: Date;
  dataHash: string;
  dataVersion: number;
  generatedAt: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Morning Check-in Types (New)
export interface MorningCheckInData {
  id: string;
  date: string; // YYYY-MM-DD format
  energyLevel: number; // 1-5 scale
  positivityLevel: number; // 1-5 scale
  focusLevel: number; // 1-5 scale
  sleepQuality: number; // 1-5 scale
  yesterdayCompletion: number; // 1-5 scale
  emotions: string[]; // Array of emotion keys
  reflectionPrompt: string; // The prompt shown to user
  reflectionResponse: string; // User's response to prompt
  mainGoal: string; // Main goal for today
  notes?: string; // Optional additional notes
  completedAt: Date; // When the check-in was completed
}

export interface MorningCheckInState {
  isCompleted: boolean; // Has today's check-in been completed?
  completedAt: Date | null; // When was it completed?
  data: MorningCheckInData | null; // The actual check-in data
  shouldShowModal: boolean; // Should we show the modal?
  currentPromptIndex: number; // Current prompt in the cycle (fallback)
  lastPromptDate: string | null; // Last date we cycled the prompt (YYYY-MM-DD)
  aiGeneratedPrompt: string | null; // Today's AI-generated prompt
  aiPromptDate: string | null; // Date the AI prompt was generated (YYYY-MM-DD)
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

// Navigation Types (Updated - removing tab-based navigation)
export type RootStackParamList = {
  TimeTracking: undefined;
  CheckInReview: undefined;
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

// New Component Props for Morning Check-in
export interface MorningCheckInModalProps {
  isVisible: boolean;
  onComplete: (data: Omit<MorningCheckInData, 'id' | 'completedAt'>) => void;
  onCancel: () => void;
  currentPrompt: string;
}

export interface SideMenuProps {
  isVisible: boolean;
  onClose: () => void;
  hasCompletedCheckIn: boolean;
  onViewCheckIn: () => void;
}

export interface HamburgerButtonProps {
  onPress: () => void;
  isMenuOpen: boolean;
}

export interface CheckInReviewPanelProps {
  checkInData: MorningCheckInData;
  onBack: () => void;
}

// Re-export calendar types for convenience
export * from './calendar';
