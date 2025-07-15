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
  { key: 'social', label: 'Social', color: '#ec4899' },
  { key: 'networking', label: 'Networking', color: '#8b5cf6' },
  { key: 'interview', label: 'Interview', color: '#f59e0b' },
  { key: 'travel', label: 'Travel', color: '#06b6d4' },
  { key: 'reading-emails', label: 'Reading/Emails', color: '#10b981' },
  { key: 'break', label: 'Break', color: '#84cc16' },
  { key: 'exercise', label: 'Exercise', color: '#ef4444' },
  { key: 'learning', label: 'Learning', color: '#f97316' },
  { key: 'creative', label: 'Creative', color: '#06b6d4' },
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

// Light theme
export const LIGHT_THEME: AppTheme = {
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

// Dark theme (Google Calendar inspired)
export const DARK_THEME: AppTheme = {
  colors: {
    primary: '#5b82f3', // Slightly lighter blue for better contrast
    secondary: '#06d6f1', // Cyan adjusted for dark mode
    background: '#0f172a', // Very dark blue-gray (like Google Calendar)
    surface: '#1e293b', // Dark surface color
    text: '#f8fafc', // Light text for readability
    textSecondary: '#94a3b8', // Muted light gray for secondary text
    border: '#334155', // Subtle border color
    success: '#22c55e', // Slightly brighter green
    warning: '#fbbf24', // Adjusted amber
    error: '#f87171', // Softer red
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

// Default theme (can be switched)
export const THEME = LIGHT_THEME;

// Theme selector function
export const getTheme = (isDark: boolean) => isDark ? DARK_THEME : LIGHT_THEME;

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

// Development and testing configuration
export const DEV_CONFIG = {
  // Skip OAuth during development
  MOCK_GOOGLE_CALENDAR: __DEV__ && true,
  
  // Skip morning checklist during development  
  SKIP_MORNING_CHECKIN: __DEV__ && false, // Set to true when testing other features
  
  // Auto-populate with test data
  USE_SAMPLE_CALENDAR_DATA: __DEV__ && true,
  
  // Fast testing mode
  ENABLE_DEV_SHORTCUTS: __DEV__ && true,
};

// Mock calendar events for testing
export const MOCK_CALENDAR_EVENTS = [
  {
    id: 'mock-1',
    summary: 'Team Standup',
    start: { dateTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    end: { dateTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString() },
    description: 'Daily team sync meeting',
  },
  {
    id: 'mock-2', 
    summary: 'Gym Workout',
    start: { dateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    end: { dateTime: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString() },
    location: 'Fitness Center',
  },
  {
    id: 'mock-3',
    summary: 'Coffee with Sarah',
    start: { dateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    end: { dateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString() },
    location: 'Blue Bottle Coffee',
  },
  {
    id: 'mock-4',
    summary: 'Doctor Appointment', 
    start: { dateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    end: { dateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString() },
    description: 'Annual checkup',
  },
  {
    id: 'mock-5',
    summary: 'Grocery Shopping',
    start: { dateTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
    end: { dateTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString() },
    location: 'Whole Foods',
  }
];
