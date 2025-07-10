import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for Expo web
});

// Predefined activity categories
export const ACTIVITY_CATEGORIES = [
  'Work',
  'Exercise',
  'Social',
  'Learning',
  'Creative',
  'Health',
  'Household',
  'Entertainment',
  'Travel',
  'Personal Care',
  'Family',
  'Hobbies',
  'Spiritual',
  'Volunteer',
  'General'
] as const;

export type ActivityCategory = typeof ACTIVITY_CATEGORIES[number];

interface ActivityCategorizationResult {
  category: ActivityCategory;
  confidence: number;
  reasoning?: string;
}

interface PersonalizedPromptResult {
  prompt: string;
  context: string;
}

interface InsightResult {
  insights: string[];
  patterns: string[];
  recommendations: string[];
}

interface CachedInsight {
  content: string;
  type: 'trend' | 'pattern' | 'correlation' | 'habit' | 'energy' | 'productivity';
  icon: string;
}

export class AIService {
  private static instance: AIService;
  private isConfigured: boolean = false;

  private constructor() {
    this.isConfigured = !!process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public isAvailable(): boolean {
    return this.isConfigured;
  }

  /**
   * Categorize an activity using AI
   */
  public async categorizeActivity(
    activityName: string,
    description?: string,
    testMode: boolean = false
  ): Promise<ActivityCategorizationResult> {
    if (!this.isAvailable()) {
      // Fallback to simple keyword matching
      return this.fallbackCategorization(activityName, description);
    }

    // In test mode, use sample activities instead of real user data
    if (testMode) {
      const sampleActivities = [
        'Sample workout session',
        'Reading development book',
        'Team meeting',
        'Cooking dinner'
      ];
      const randomActivity = sampleActivities[Math.floor(Math.random() * sampleActivities.length)];
      return this.categorizationInternal(randomActivity, 'Sample description for testing');
    }

    return this.categorizationInternal(activityName, description);
  }

  private async categorizationInternal(
    activityName: string,
    description?: string
  ): Promise<ActivityCategorizationResult> {
    try {
      const prompt = `
Categorize this activity into one of these categories: ${ACTIVITY_CATEGORIES.join(', ')}.

Activity: "${activityName}"
${description ? `Description: "${description}"` : ''}

Please respond with a JSON object containing:
- category: the most appropriate category from the list above
- confidence: a number between 0 and 1 indicating how confident you are
- reasoning: a brief explanation of why you chose this category

Example response:
{
  "category": "Exercise",
  "confidence": 0.9,
  "reasoning": "This appears to be a physical fitness activity"
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that categorizes activities. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 200
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(content) as ActivityCategorizationResult;
      
      // Validate that the category is in our predefined list
      if (!ACTIVITY_CATEGORIES.includes(result.category)) {
        result.category = 'General';
      }

      return result;
    } catch (error) {
      console.error('AI categorization failed:', error);
      return this.fallbackCategorization(activityName, description);
    }
  }

  /**
   * Generate personalized reflection prompt based on recent check-in data
   */
  public async generatePersonalizedPrompt(
    recentCheckIns: any[],
    currentGoals: string[],
    testMode: boolean = false
  ): Promise<PersonalizedPromptResult> {
    if (!this.isAvailable()) {
      return this.fallbackPrompt();
    }

    // In test mode, use sample data instead of real user data
    if (testMode) {
      const sampleCheckIns = [
        { energyLevel: 4, focusLevel: 3, sleepQuality: 4, emotions: ['motivated', 'optimistic'], mainGoal: 'Focus on personal growth' },
        { energyLevel: 3, focusLevel: 4, sleepQuality: 3, emotions: ['focused', 'determined'], mainGoal: 'Practice mindfulness' }
      ];
      const sampleGoals = ['Personal development', 'Wellness'];
      
      return this.generatePersonalizedPromptInternal(sampleCheckIns, sampleGoals);
    }

    return this.generatePersonalizedPromptInternal(recentCheckIns, currentGoals);
  }

  private async generatePersonalizedPromptInternal(
    checkIns: any[],
    goals: string[]
  ): Promise<PersonalizedPromptResult> {
    try {
      const prompt = `
Generate a thoughtful reflection prompt for someone's morning check-in routine that will help gather insights about their productivity, focus, time management, and personal patterns.

The prompt should be:
1. Generic and universal (not specific to any particular profession, life situation, or goals)
2. Creative and varied (approach reflection from different angles)
3. Designed to reveal patterns about productivity, focus, energy, time management, habits, or personal effectiveness
4. 1-2 sentences long
5. Supportive and motivating
6. Elicit responses that can be analyzed for insights about what works/doesn't work for the user

Focus on themes that reveal insights about:
- Energy patterns and management
- Focus and attention strategies
- Time management approaches
- Productivity habits and routines
- Challenges and obstacles
- What helps vs. hinders performance
- Decision-making patterns
- Stress management and well-being

DO NOT reference:
- Specific jobs, professions, or career situations
- Specific life circumstances or personal situations
- Specific goals or milestones
- Specific activities or hobbies

Good examples:
- "What time of day do you feel most mentally sharp, and how could you leverage that energy today?"
- "What's one habit or routine that consistently helps you stay focused, and how might you strengthen it?"
- "When you feel overwhelmed, what's your go-to strategy for regaining clarity and control?"

Respond with JSON:
{
  "prompt": "Your reflection question",
  "context": "Brief explanation of what insights this could reveal"
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a mindfulness coach who creates thoughtful, generic reflection prompts. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 300
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content) as PersonalizedPromptResult;
    } catch (error) {
      console.error('AI prompt generation failed:', error);
      return this.fallbackPrompt();
    }
  }

  /**
   * Generate insights and patterns from check-in data (legacy format)
   */
  public async generateInsights(
    checkInData: any[],
    timeRange: string = 'last 7 days',
    testMode: boolean = false
  ): Promise<InsightResult> {
    if (!this.isAvailable()) {
      return this.fallbackInsights();
    }

    // In test mode, use sample data instead of real user data
    if (testMode) {
      const sampleData = [
        { date: '2024-01-15', energyLevel: 4, focusLevel: 3, sleepQuality: 4, positivityLevel: 4, yesterdayCompletion: 3, emotions: ['motivated', 'optimistic'], mainGoal: 'Focus on personal growth' },
        { date: '2024-01-14', energyLevel: 3, focusLevel: 4, sleepQuality: 3, positivityLevel: 3, yesterdayCompletion: 4, emotions: ['focused', 'determined'], mainGoal: 'Practice mindfulness' }
      ];
      
      return this.generateInsightsInternal(sampleData, timeRange);
    }

    return this.generateInsightsInternal(checkInData, timeRange);
  }

  /**
   * Generate insights for caching system (new format)
   */
  public async generateCachedInsights(
    checkInData: any[],
    activityData: any[],
    goals: string[],
    testMode: boolean = false
  ): Promise<CachedInsight[]> {
    if (!this.isAvailable()) {
      return this.fallbackCachedInsights();
    }

    // In test mode, use sample data instead of real user data
    if (testMode) {
      const sampleCheckIns = [
        { date: '2024-01-15', energyLevel: 4, focusLevel: 3, sleepQuality: 4, positivityLevel: 4, yesterdayCompletion: 3, emotions: ['motivated', 'optimistic'], mainGoal: 'Focus on personal growth' },
        { date: '2024-01-14', energyLevel: 3, focusLevel: 4, sleepQuality: 3, positivityLevel: 3, yesterdayCompletion: 4, emotions: ['focused', 'determined'], mainGoal: 'Practice mindfulness' }
      ];
      const sampleActivities = [
        { activity: 'Morning workout', category: 'Exercise', duration: 45 },
        { activity: 'Reading', category: 'Learning', duration: 30 },
        { activity: 'Project work', category: 'Work', duration: 120 }
      ];
      const sampleGoals = ['Personal development', 'Wellness'];
      
      return this.generateCachedInsightsInternal(sampleCheckIns, sampleActivities, sampleGoals);
    }

    return this.generateCachedInsightsInternal(checkInData, activityData, goals);
  }

  private async generateInsightsInternal(
    data: any[],
    timeRange: string
  ): Promise<InsightResult> {
    try {
      const prompt = `
Analyze this user's check-in data from the ${timeRange} and provide insights.

Check-in data:
${data.map(checkIn => `
Date: ${checkIn.date}
Energy: ${checkIn.energyLevel}/5, Focus: ${checkIn.focusLevel}/5, Sleep: ${checkIn.sleepQuality}/5
Positivity: ${checkIn.positivityLevel}/5, Yesterday completion: ${checkIn.yesterdayCompletion}/5
Emotions: ${checkIn.emotions.join(', ')}
Goal: ${checkIn.mainGoal}
`).join('')}

Provide insights in JSON format:
{
  "insights": ["Key observation 1", "Key observation 2", ...],
  "patterns": ["Pattern 1", "Pattern 2", ...],
  "recommendations": ["Actionable suggestion 1", "Actionable suggestion 2", ...]
}

Focus on:
- Sleep-energy correlations
- Mood patterns
- Goal achievement patterns
- Emotional trends
- Actionable recommendations for improvement`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a data analyst specializing in wellness and productivity patterns. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 600
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content) as InsightResult;
    } catch (error) {
      console.error('AI insights generation failed:', error);
      return this.fallbackInsights();
    }
  }

  private async generateCachedInsightsInternal(
    checkInData: any[],
    activityData: any[],
    goals: string[]
  ): Promise<CachedInsight[]> {
    try {
      const prompt = `
Analyze this user's data and generate 3-7 specific insights about their patterns and trends.

Check-in data:
${checkInData.map(checkIn => `
Date: ${checkIn.date}
Energy: ${checkIn.energyLevel}/5, Focus: ${checkIn.focusLevel}/5, Sleep: ${checkIn.sleepQuality}/5
Positivity: ${checkIn.positivityLevel}/5, Yesterday completion: ${checkIn.yesterdayCompletion}/5
Emotions: ${checkIn.emotions.join(', ')}
Goal: ${checkIn.mainGoal}
`).join('')}

Activity data:
${activityData.map(activity => `
Activity: ${activity.activity}
Category: ${activity.category}
Duration: ${activity.duration} minutes
`).join('')}

Goals: ${goals.join(', ')}

Generate insights in JSON format:
{
  "insights": [
    {
      "content": "Specific insight about a trend or pattern (1-2 sentences)",
      "type": "trend|pattern|correlation|habit|energy|productivity",
      "icon": "📈|📊|💡|🔄|⚡|🎯"
    },
    ...
  ]
}

Each insight should be:
- Specific and actionable
- Based on the actual data patterns
- Include relevant numbers/percentages when possible
- Focus on correlations between sleep, energy, activities, and goals
- Provide clear value to the user

Types:
- trend: Changes over time
- pattern: Recurring behaviors
- correlation: Relationships between variables
- habit: Consistent behaviors
- energy: Energy-related insights
- productivity: Goal achievement insights

Icons:
- 📈: Trends and growth
- 📊: Data patterns
- 💡: Correlations and insights
- 🔄: Habits and routines
- ⚡: Energy patterns
- 🎯: Productivity and goals`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a data analyst specializing in wellness and productivity patterns. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(content);
      return result.insights as CachedInsight[];
    } catch (error) {
      console.error('AI cached insights generation failed:', error);
      return this.fallbackCachedInsights();
    }
  }

  // Fallback methods for when AI is not available
  private fallbackCategorization(activityName: string, description?: string): ActivityCategorizationResult {
    const text = `${activityName} ${description || ''}`.toLowerCase();
    
    // Simple keyword matching
    if (text.includes('work') || text.includes('meeting') || text.includes('office')) {
      return { category: 'Work', confidence: 0.6 };
    }
    if (text.includes('exercise') || text.includes('gym') || text.includes('run') || text.includes('yoga')) {
      return { category: 'Exercise', confidence: 0.6 };
    }
    if (text.includes('read') || text.includes('study') || text.includes('learn')) {
      return { category: 'Learning', confidence: 0.6 };
    }
    if (text.includes('cook') || text.includes('clean') || text.includes('house')) {
      return { category: 'Household', confidence: 0.6 };
    }
    if (text.includes('friend') || text.includes('family') || text.includes('social')) {
      return { category: 'Social', confidence: 0.6 };
    }
    
    return { category: 'General', confidence: 0.3 };
  }

  private fallbackPrompt(): PersonalizedPromptResult {
    const prompts = [
      'What are you most grateful for this morning?',
      'What would make today feel successful?',
      'What energy do you want to bring to your day?',
      'What challenge are you ready to tackle today?',
      'How can you show yourself kindness today?'
    ];
    
    return {
      prompt: prompts[Math.floor(Math.random() * prompts.length)],
      context: 'Random inspirational prompt'
    };
  }

  private fallbackInsights(): InsightResult {
    return {
      insights: ['AI insights are not available right now'],
      patterns: ['Enable AI features for pattern analysis'],
      recommendations: ['Set up OpenAI API key to unlock AI-powered insights']
    };
  }

  private fallbackCachedInsights(): CachedInsight[] {
    return [
      {
        content: 'AI insights are not available right now. Set up OpenAI API key to unlock AI-powered insights.',
        type: 'productivity',
        icon: '🔧'
      }
    ];
  }
}

export const aiService = AIService.getInstance(); 