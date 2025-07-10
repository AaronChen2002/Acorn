import { MorningCheckInData } from '../types';
import { CalendarTimeEntry } from '../types/calendar';

export interface CachedInsightResult {
  insights: Array<{
    id: number;
    content: string;
    type: string;
    icon: string;
  }>;
  dataHash: string;
  timePeriod: 'week' | 'month' | 'quarter';
  periodStart: Date;
  periodEnd: Date;
}

/**
 * Generate a hash from data to detect changes
 */
export function generateDataHash(
  checkIns: MorningCheckInData[],
  activities: CalendarTimeEntry[],
  goals: string[]
): string {
  // Create a deterministic string from the data
  const dataString = [
    // Check-ins: date, levels, emotions, main goals
    ...checkIns.map(c => `${c.date}-${c.energyLevel}-${c.positivityLevel}-${c.focusLevel}-${c.sleepQuality}-${c.emotions.join(',')}-${c.mainGoal}`),
    // Activities: date, activity, category, duration
    ...activities.map(a => `${a.date}-${a.activity}-${a.category}-${a.duration}`),
    // Goals
    ...goals.sort(), // Sort to ensure consistent ordering
  ].join('|');
  
  // Simple hash function (for production, consider using crypto.subtle.digest)
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Get the start and end dates for a given time period
 */
export function getTimePeriodBounds(
  date: Date,
  period: 'week' | 'month' | 'quarter'
): { start: Date; end: Date } {
  const start = new Date(date);
  const end = new Date(date);
  
  switch (period) {
    case 'week':
      // Week starts on Sunday (0) and ends on Saturday (6)
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
      
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      
      end.setMonth(end.getMonth() + 1);
      end.setDate(0); // Last day of current month
      end.setHours(23, 59, 59, 999);
      break;
      
    case 'quarter':
      const quarter = Math.floor(start.getMonth() / 3);
      start.setMonth(quarter * 3);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      
      end.setMonth(quarter * 3 + 3);
      end.setDate(0); // Last day of quarter
      end.setHours(23, 59, 59, 999);
      break;
  }
  
  return { start, end };
}

/**
 * Determine if cached insights are still valid
 */
export function areCachedInsightsValid(
  cachedDataHash: string,
  currentDataHash: string,
  cacheGeneratedAt: Date,
  maxCacheAgeHours: number = 24
): boolean {
  // Check if data has changed
  if (cachedDataHash !== currentDataHash) {
    return false;
  }
  
  // Check if cache is too old
  const now = new Date();
  const cacheAgeHours = (now.getTime() - cacheGeneratedAt.getTime()) / (1000 * 60 * 60);
  if (cacheAgeHours > maxCacheAgeHours) {
    return false;
  }
  
  return true;
}

/**
 * Get current week period for insights
 */
export function getCurrentWeekPeriod(): { start: Date; end: Date } {
  return getTimePeriodBounds(new Date(), 'week');
}

/**
 * Get current month period for insights
 */
export function getCurrentMonthPeriod(): { start: Date; end: Date } {
  return getTimePeriodBounds(new Date(), 'month');
}

/**
 * Check if we have enough data to generate meaningful insights
 */
export function hasEnoughDataForInsights(
  checkIns: MorningCheckInData[],
  activities: CalendarTimeEntry[],
  minCheckIns: number = 3,
  minActivities: number = 5
): boolean {
  return checkIns.length >= minCheckIns && activities.length >= minActivities;
}

/**
 * Filter data for specific time period
 */
export function filterDataForPeriod(
  checkIns: MorningCheckInData[],
  activities: CalendarTimeEntry[],
  periodStart: Date,
  periodEnd: Date
): {
  checkIns: MorningCheckInData[];
  activities: CalendarTimeEntry[];
} {
  const startStr = periodStart.toISOString().split('T')[0];
  const endStr = periodEnd.toISOString().split('T')[0];
  
  const filteredCheckIns = checkIns.filter(c => c.date >= startStr && c.date <= endStr);
  const filteredActivities = activities.filter(a => a.date >= startStr && a.date <= endStr);
  
  return {
    checkIns: filteredCheckIns,
    activities: filteredActivities,
  };
}

/**
 * Create a cache key for insights
 */
export function createInsightCacheKey(
  timePeriod: 'week' | 'month' | 'quarter',
  periodStart: Date,
  periodEnd: Date
): string {
  const startStr = periodStart.toISOString().split('T')[0];
  const endStr = periodEnd.toISOString().split('T')[0];
  return `${timePeriod}-${startStr}-${endStr}`;
} 