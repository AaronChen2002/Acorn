import { MorningCheckInData } from '../types';
import { CalendarTimeEntry } from '../types/calendar';

// Helper function to get a random value within a range
const randomInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to get a random float within a range
const randomFloatInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Helper function to get a date X days ago
const getDaysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  // Use local date instead of ISO to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Sample emotions pool
const SAMPLE_EMOTIONS = [
  'motivated', 'optimistic', 'focused', 'determined', 'grateful',
  'peaceful', 'excited', 'confident', 'creative', 'energized',
  'content', 'inspired', 'curious', 'hopeful', 'relaxed',
  'stressed', 'tired', 'overwhelmed', 'anxious', 'frustrated'
];

// Sample goals pool
const SAMPLE_GOALS = [
  'Focus on personal growth and learning',
  'Maintain work-life balance',
  'Practice mindfulness and gratitude',
  'Complete important project milestones',
  'Build stronger relationships',
  'Improve physical fitness and health',
  'Develop new skills and knowledge',
  'Organize and declutter living space',
  'Save money and budget better',
  'Spend more time in nature'
];

// Sample activities with realistic durations
const SAMPLE_ACTIVITIES = [
  { name: 'Morning workout', category: 'Self Care', baseMinutes: 45, variance: 15 },
  { name: 'Team meeting', category: 'Work', baseMinutes: 60, variance: 30 },
  { name: 'Focused work session', category: 'Work', baseMinutes: 120, variance: 60 },
  { name: 'Lunch break', category: 'Self Care', baseMinutes: 30, variance: 15 },
  { name: 'Reading', category: 'Self Care', baseMinutes: 45, variance: 30 },
  { name: 'Cooking dinner', category: 'Other', baseMinutes: 40, variance: 20 },
  { name: 'Walk in park', category: 'Self Care', baseMinutes: 30, variance: 15 },
  { name: 'Video call with family', category: 'Social', baseMinutes: 45, variance: 30 },
  { name: 'Meditation', category: 'Self Care', baseMinutes: 20, variance: 10 },
  { name: 'Creative writing', category: 'Self Care', baseMinutes: 60, variance: 45 },
  { name: 'House cleaning', category: 'Other', baseMinutes: 90, variance: 30 },
  { name: 'Learning new skill', category: 'Self Care', baseMinutes: 75, variance: 45 },
  { name: 'Movie night', category: 'Self Care', baseMinutes: 120, variance: 30 },
  { name: 'Grocery shopping', category: 'Other', baseMinutes: 45, variance: 15 },
  { name: 'Yoga class', category: 'Self Care', baseMinutes: 60, variance: 15 },
  { name: 'Networking event', category: 'Side Work', baseMinutes: 90, variance: 30 },
  { name: 'Freelance project', category: 'Side Work', baseMinutes: 120, variance: 60 },
  { name: 'Coffee with colleague', category: 'Side Work', baseMinutes: 45, variance: 15 }
];

// Emotional tags for activities
const ACTIVITY_EMOTIONAL_TAGS = [
  'productive', 'focused', 'energized', 'stressed', 'collaborative',
  'creative', 'peaceful', 'challenged', 'satisfied', 'motivated',
  'tired', 'inspired', 'social', 'solitary', 'accomplishment'
];

/**
 * Generate realistic morning check-in data for the past N days
 */
export const generateSampleMorningCheckIns = (days: number = 14): MorningCheckInData[] => {
  const checkIns: MorningCheckInData[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = getDaysAgo(i);
    const dateStr = formatDate(date);
    
    // Create some weekly patterns
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isMondayBlues = date.getDay() === 1;
    const isHumpDay = date.getDay() === 3;
    
    // Energy patterns - slightly lower on Mondays, higher mid-week
    let baseEnergy = 3;
    if (isMondayBlues) baseEnergy = 2.5;
    if (isHumpDay) baseEnergy = 4;
    if (isWeekend) baseEnergy = 3.5;
    
    // Add some random variation
    const energyLevel = Math.min(5, Math.max(1, Math.round(baseEnergy + randomFloatInRange(-0.8, 0.8))));
    
    // Positivity tends to correlate with energy but can vary
    const positivityLevel = Math.min(5, Math.max(1, 
      Math.round(energyLevel + randomFloatInRange(-1, 1))
    ));
    
    // Focus and sleep have their own patterns
    const focusLevel = randomInRange(2, 5);
    const sleepQuality = randomInRange(2, 5);
    const yesterdayCompletion = randomInRange(2, 5);
    
    // Select 2-4 emotions
    const numEmotions = randomInRange(2, 4);
    const emotions = [];
    const emotionPool = [...SAMPLE_EMOTIONS];
    
    for (let j = 0; j < numEmotions; j++) {
      const randomIndex = randomInRange(0, emotionPool.length - 1);
      emotions.push(emotionPool.splice(randomIndex, 1)[0]);
    }
    
    // Generate realistic reflection responses
    const reflectionResponses = [
      "Focusing on staying organized and maintaining momentum on my key projects.",
      "Feeling grateful for the opportunities I have and excited about upcoming challenges.",
      "Working on better time management and setting clearer boundaries.",
      "Prioritizing self-care while staying productive on important tasks.",
      "Building stronger habits around exercise and healthy eating.",
      "Balancing ambitious goals with realistic expectations for myself.",
      "Cultivating more mindfulness and presence in my daily activities.",
      "Strengthening relationships and making time for meaningful connections."
    ];
    
    const checkIn: MorningCheckInData = {
      id: `sample-checkin-${i}`,
      date: dateStr,
      energyLevel,
      positivityLevel,
      focusLevel,
      sleepQuality,
      yesterdayCompletion,
      emotions,
      reflectionPrompt: "What's your main focus for creating a fulfilling day today?",
      reflectionResponse: reflectionResponses[randomInRange(0, reflectionResponses.length - 1)],
      mainGoal: SAMPLE_GOALS[randomInRange(0, SAMPLE_GOALS.length - 1)],
      notes: Math.random() > 0.7 ? "Additional thoughts about the day ahead." : "",
      completedAt: new Date(date.getTime() + randomInRange(6, 9) * 60 * 60 * 1000) // 6-9 AM
    };
    
    checkIns.push(checkIn);
  }
  
  return checkIns;
};

/**
 * Generate realistic calendar time entries for the past N days
 */
export const generateSampleCalendarEntries = (days: number = 14): CalendarTimeEntry[] => {
  const entries: CalendarTimeEntry[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = getDaysAgo(i);
    const dateStr = formatDate(date);
    
    // Generate 3-7 activities per day
    const numActivities = randomInRange(3, 7);
    let currentTime = 8 * 60; // Start at 8 AM (in minutes)
    
    for (let j = 0; j < numActivities; j++) {
      const activity = SAMPLE_ACTIVITIES[randomInRange(0, SAMPLE_ACTIVITIES.length - 1)];
      
      // Calculate duration with variance
      const duration = Math.max(15, 
        activity.baseMinutes + randomInRange(-activity.variance, activity.variance)
      );
      
      // Create start and end times
      const startTime = new Date(date);
      startTime.setHours(Math.floor(currentTime / 60), currentTime % 60, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);
      
      // Generate mood rating (1-6 scale)
      const moodRating = randomInRange(3, 6); // Slightly biased toward positive
      
      // Select 1-3 emotional tags
      const numTags = randomInRange(1, 3);
      const emotionalTags = [];
      const tagPool = [...ACTIVITY_EMOTIONAL_TAGS];
      
      for (let k = 0; k < numTags; k++) {
        const randomIndex = randomInRange(0, tagPool.length - 1);
        emotionalTags.push(tagPool.splice(randomIndex, 1)[0]);
      }
      
      // Generate reflection
      const reflections = [
        "Went well, felt productive and focused throughout.",
        "Challenging but rewarding, learned something new.",
        "Enjoyed the process and felt accomplished afterward.",
        "Could have been better organized, but still valuable.",
        "Great energy and collaboration with others.",
        "Felt a bit distracted but managed to make progress.",
        "Very satisfying to complete this task.",
        "Good use of time, aligned with my goals."
      ];
      
      const entry: CalendarTimeEntry = {
        id: `sample-entry-${i}-${j}`,
        date: dateStr,
        activity: activity.name,
        category: activity.category,
        startTime,
        endTime,
        duration,
        moodRating,
        emotionalTags,
        reflection: Math.random() > 0.3 ? reflections[randomInRange(0, reflections.length - 1)] : "",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      entries.push(entry);
      
      // Move to next time slot with some buffer
      currentTime += duration + randomInRange(0, 30); // 0-30 minute buffer
      
      // Don't go past 10 PM
      if (currentTime > 22 * 60) break;
    }
  }
  
  return entries;
};

/**
 * Get sample insights for development
 */
export const generateSampleInsights = () => {
  return [
    {
      content: "Your energy levels peak on Tuesdays and Wednesdays (avg 4.2/5). Consider scheduling important tasks during these days.",
      type: "pattern" as const,
      icon: "⚡"
    },
    {
      content: "You're 40% more productive after morning workouts. Your post-exercise activities show higher satisfaction ratings.",
      type: "correlation" as const,
      icon: "💡"
    },
    {
      content: "Your focus levels have improved by 15% over the past two weeks, especially during morning hours.",
      type: "trend" as const,
      icon: "📈"
    },
    {
      content: "Reading sessions consistently boost your mood by an average of 1.5 points. Consider daily reading time.",
      type: "habit" as const,
      icon: "🔄"
    }
  ];
}; 