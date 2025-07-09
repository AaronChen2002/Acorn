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

// Tag suggestions for daily reflections
export const REFLECTION_TAGS = [
  'Work',
  'Relationships',
  'Health',
  'Personal Growth',
  'Family',
  'Stress Management',
  'Goals',
  'Creativity',
  'Finances',
  'Career',
  'Learning',
  'Fitness',
  'Mental Health',
  'Time Management',
  'Habits',
  'Productivity',
  'Social',
  'Self-Care',
  'Future Planning',
  'Values',
];

// Daily reflection prompts for deeper insights
export const DAILY_PROMPTS = [
  "What's occupying most of your mental energy today, and how is that affecting your well-being?",
  "What patterns in your thoughts or emotions have you noticed lately that you'd like to explore?",
  "If you could redesign your daily routine to better support your mental health, what would you change?",
  "What accomplishment or moment from this week made you feel most aligned with your values?",
  "What's one area of your life where you feel stuck, and what small step could help you move forward?",
  "How has your relationship with stress or pressure evolved recently, and what strategies are working for you?",
  "What's something you've been avoiding that might actually bring you clarity or peace if addressed?",
  "When do you feel most authentic and energized, and how can you create more of those moments?",
  "What limiting belief or self-talk pattern would you like to challenge or reframe?",
  "How are you balancing your personal needs with your responsibilities to others right now?",
  "What's one thing you're grateful for that you might have taken for granted recently?",
  "If your current emotional state could teach you something important, what would that lesson be?",
  "What does 'taking care of yourself' look like for you today, and are you actually doing it?",
  "What's one fear or anxiety that's been holding you back, and what would courage look like in that situation?",
  "How are you growing or changing lately, and what support do you need for that process?",
];

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
