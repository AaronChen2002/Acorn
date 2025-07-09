import { AppTheme } from '../types';

// Emotion options for check-ins
export const EMOTIONS = [
  { key: 'stressed', emoji: '😩', label: 'Stressed' },
  { key: 'energized', emoji: '🔋', label: 'Energized' },
  { key: 'low', emoji: '😔', label: 'Low' },
  { key: 'calm', emoji: '😊', label: 'Calm' },
  { key: 'anxious', emoji: '😰', label: 'Anxious' },
  { key: 'happy', emoji: '😄', label: 'Happy' },
  { key: 'focused', emoji: '🎯', label: 'Focused' },
  { key: 'tired', emoji: '😴', label: 'Tired' },
  { key: 'excited', emoji: '🤩', label: 'Excited' },
  { key: 'overwhelmed', emoji: '🤯', label: 'Overwhelmed' },
];

// Activity categories for time tracking
export const ACTIVITY_CATEGORIES = [
  { key: 'deep-work', label: 'Deep Work', color: '#6366f1' },
  { key: 'meetings', label: 'Meetings', color: '#f59e0b' },
  { key: 'break', label: 'Break', color: '#10b981' },
  { key: 'social', label: 'Social', color: '#ec4899' },
  { key: 'errands', label: 'Errands', color: '#8b5cf6' },
  { key: 'exercise', label: 'Exercise', color: '#ef4444' },
  { key: 'learning', label: 'Learning', color: '#06b6d4' },
  { key: 'creative', label: 'Creative', color: '#f97316' },
  { key: 'personal', label: 'Personal', color: '#84cc16' },
  { key: 'other', label: 'Other', color: '#6b7280' },
];

// Tag suggestions for reflections
export const REFLECTION_TAGS = {
  worry: [
    'Work',
    'Deadlines',
    'Health',
    'Finances',
    'Relationships',
    'Future',
    'Family',
    'Performance',
    'Time Management',
    'Goals',
  ],
  priority: [
    'Work',
    'Health',
    'Focus',
    'Relationships',
    'Learning',
    'Personal Growth',
    'Family',
    'Fitness',
    'Career',
    'Creativity',
  ],
};

// App theme
export const THEME: AppTheme = {
  colors: {
    primary: '#6366f1', // Indigo
    secondary: '#06b6d4', // Cyan
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
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
};

// Database configuration
export const DB_CONFIG = {
  name: 'acorn.db',
  version: 1,
};

// API endpoints (for future use)
export const API_ENDPOINTS = {
  openai: 'https://api.openai.com/v1',
  // Add other endpoints as needed
};

// App settings
export const APP_SETTINGS = {
  reminderTime: '18:00', // Default reminder time
  backupFrequency: 'weekly',
  dataRetentionDays: 365,
};
