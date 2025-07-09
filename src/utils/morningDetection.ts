// Morning detection utilities for Acorn app
// Phase 3: Time-based Logic & Triggers

import { MorningCheckInState } from '../types';

export interface MorningDetectionConfig {
  morningStartHour: number; // Hour when morning period starts (24-hour format)
  debugMode: boolean; // Enable debug logging
  testMode: boolean; // Allow time simulation for testing
}

export interface TimeInfo {
  currentTime: Date;
  formattedDate: string;
  hour: number;
  minute: number;
  isMorning: boolean;
  timezone: string;
  dayOfWeek: string;
}

// Default configuration
const DEFAULT_CONFIG: MorningDetectionConfig = {
  morningStartHour: 5,
  debugMode: __DEV__ || false,
  testMode: false,
};

class MorningDetectionService {
  private config: MorningDetectionConfig;
  private simulatedTime: Date | null = null;

  constructor(config: Partial<MorningDetectionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Get current time (real or simulated for testing)
  private getCurrentTime(): Date {
    return this.simulatedTime || new Date();
  }

  // Format date consistently across the app
  formatDate(date: Date = this.getCurrentTime()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Get comprehensive time information
  getTimeInfo(): TimeInfo {
    const currentTime = this.getCurrentTime();
    return {
      currentTime,
      formattedDate: this.formatDate(currentTime),
      hour: currentTime.getHours(),
      minute: currentTime.getMinutes(),
      isMorning: this.isMorningTime(currentTime),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dayOfWeek: currentTime.toLocaleDateString('en-US', { weekday: 'long' }),
    };
  }

  // Check if it's morning time (after configured start hour)
  isMorningTime(date: Date = this.getCurrentTime()): boolean {
    return date.getHours() >= this.config.morningStartHour;
  }

  // Check if it's a new day since last check-in
  isNewDay(lastCheckInDate: string | null): boolean {
    if (!lastCheckInDate) return true;
    
    const today = this.formatDate();
    const isNew = lastCheckInDate !== today;
    
    if (this.config.debugMode) {
      console.log('New day check:', {
        lastCheckInDate,
        today,
        isNewDay: isNew,
      });
    }
    
    return isNew;
  }

  // Determine if morning modal should be shown
  shouldShowMorningModal(state: MorningCheckInState): boolean {
    const timeInfo = this.getTimeInfo();
    
    // Don't show if already completed today
    if (state.isCompleted && state.data?.date === timeInfo.formattedDate) {
      this.log('Modal not shown: Already completed today');
      return false;
    }
    
    // Don't show if it's before morning time
    if (!timeInfo.isMorning) {
      this.log('Modal not shown: Before morning time', {
        currentHour: timeInfo.hour,
        morningStartHour: this.config.morningStartHour,
      });
      return false;
    }
    
    // Don't show if manually hidden and not a new day
    if (!state.shouldShowModal && state.data?.date === timeInfo.formattedDate) {
      this.log('Modal not shown: Manually hidden for today');
      return false;
    }
    
    // Show if it's a new day and after morning time
    const shouldShow = this.isNewDay(state.data?.date || null);
    
    this.log('Modal decision:', {
      shouldShow,
      timeInfo,
      state: {
        isCompleted: state.isCompleted,
        lastDate: state.data?.date,
        shouldShowModal: state.shouldShowModal,
      },
    });
    
    return shouldShow;
  }

  // Test different times to verify logic
  testMorningDetection(testCases: Array<{ time: Date; description: string }>) {
    if (!this.config.testMode) {
      console.warn('Test mode not enabled');
      return;
    }

    console.log('🧪 Testing Morning Detection Logic\n');
    
    testCases.forEach(({ time, description }, index) => {
      this.simulatedTime = time;
      const timeInfo = this.getTimeInfo();
      
      console.log(`Test ${index + 1}: ${description}`);
      console.log(`  Time: ${time.toLocaleString()}`);
      console.log(`  Hour: ${timeInfo.hour}`);
      console.log(`  Is Morning: ${timeInfo.isMorning}`);
      console.log(`  Formatted Date: ${timeInfo.formattedDate}`);
      console.log('');
    });
    
    this.simulatedTime = null; // Reset
  }

  // Simulate a specific time for testing
  simulateTime(time: Date): void {
    if (!this.config.testMode) {
      console.warn('Test mode not enabled');
      return;
    }
    
    this.simulatedTime = time;
    this.log('Time simulated:', time.toLocaleString());
  }

  // Reset to real time
  resetTime(): void {
    this.simulatedTime = null;
    this.log('Time reset to real time');
  }

  // Debug logging
  private log(message: string, data?: any): void {
    if (this.config.debugMode) {
      console.log(`[MorningDetection] ${message}`, data || '');
    }
  }

  // Get debug information
  getDebugInfo(): any {
    const timeInfo = this.getTimeInfo();
    return {
      config: this.config,
      timeInfo,
      isSimulated: !!this.simulatedTime,
      simulatedTime: this.simulatedTime?.toLocaleString(),
    };
  }
}

// Create singleton instance
export const morningDetection = new MorningDetectionService();

// Export utility functions for direct use
export const formatDate = (date?: Date) => morningDetection.formatDate(date);
export const isMorningTime = (date?: Date) => morningDetection.isMorningTime(date);
export const isNewDay = (lastDate: string | null) => morningDetection.isNewDay(lastDate);
export const shouldShowMorningModal = (state: MorningCheckInState) => 
  morningDetection.shouldShowMorningModal(state);

// Test cases for common scenarios
export const createTestCases = () => [
  {
    time: new Date(2024, 0, 15, 4, 30), // 4:30 AM
    description: 'Early morning before 5 AM',
  },
  {
    time: new Date(2024, 0, 15, 5, 0), // 5:00 AM
    description: 'Exactly 5:00 AM',
  },
  {
    time: new Date(2024, 0, 15, 7, 30), // 7:30 AM
    description: 'Morning time',
  },
  {
    time: new Date(2024, 0, 15, 12, 0), // 12:00 PM
    description: 'Midday',
  },
  {
    time: new Date(2024, 0, 15, 18, 0), // 6:00 PM
    description: 'Evening',
  },
  {
    time: new Date(2024, 0, 15, 23, 59), // 11:59 PM
    description: 'Late night',
  },
  {
    time: new Date(2024, 0, 16, 6, 0), // Next day 6:00 AM
    description: 'Next day morning',
  },
];

// Enable test mode for development
export const enableTestMode = () => {
  morningDetection['config'].testMode = true;
  morningDetection['config'].debugMode = true;
};

export default morningDetection; 