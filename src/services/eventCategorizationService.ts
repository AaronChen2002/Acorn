import { AIService } from './aiService';
import { CalendarTimeEntry } from '../types/calendar';
import { GoogleCalendarEvent } from './googleCalendarService';

interface CategorizationRule {
  pattern: RegExp;
  category: string;
  confidence: number;
}

class EventCategorizationService {
  private static instance: EventCategorizationService;

  static getInstance(): EventCategorizationService {
    if (!EventCategorizationService.instance) {
      EventCategorizationService.instance = new EventCategorizationService();
    }
    return EventCategorizationService.instance;
  }

  // Rule-based categorization patterns
  private categorizationRules: CategorizationRule[] = [
    // Interview patterns (highest priority - check first)
    { pattern: /interview|screening|onsite|technical|behavioral|phone screen|intern/i, category: 'interview', confidence: 0.9 },
    
    // Deep work patterns
    { pattern: /deep work|focused work|coding|programming|writing|analysis|research/i, category: 'deep-work', confidence: 0.9 },
    { pattern: /meeting|call|standup|sync|review|presentation|conference|workshop/i, category: 'deep-work', confidence: 0.8 },
    { pattern: /sprint|scrum|retrospective|planning|demo/i, category: 'deep-work', confidence: 0.9 },
    
    // Networking patterns (check after interview to avoid conflicts)
    { pattern: /<>|<->|x|with|meet|catch up|coffee|drinks|lunch|dinner/i, category: 'networking', confidence: 0.8 },
    { pattern: /networking|connect|introduction|referral|mentor|advisor/i, category: 'networking', confidence: 0.9 },
    
    // Social patterns
    { pattern: /party|birthday|celebration|date|hangout|friend|family/i, category: 'social', confidence: 0.8 },
    
    // Travel patterns
    { pattern: /flight|trip|vacation|travel|hotel|airport|commute|drive/i, category: 'travel', confidence: 0.9 },
    
    // Reading/Emails patterns
    { pattern: /email|inbox|reading|newsletter|article|document|report/i, category: 'reading-emails', confidence: 0.8 },
    
    // Break patterns
    { pattern: /break|rest|pause|lunch break|coffee break/i, category: 'break', confidence: 0.8 },
    
    // Exercise patterns  
    { pattern: /gym|workout|exercise|run|bike|yoga|fitness|training|sports/i, category: 'exercise', confidence: 0.9 },
    { pattern: /basketball|tennis|swimming|hiking|climbing/i, category: 'exercise', confidence: 0.8 },
    
    // Learning patterns
    { pattern: /class|course|training|workshop|seminar|lecture|study|tutorial|certification|exam/i, category: 'learning', confidence: 0.8 },
    
    // Creative patterns
    { pattern: /creative|design|art|music|writing|drawing|painting|photography/i, category: 'creative', confidence: 0.8 },
  ];

  // Rule-based categorization (fast fallback)
  private ruleBasedCategorization(title: string, description?: string, location?: string): { category: string; confidence: number } {
    const combinedText = [title, description, location].filter(Boolean).join(' ');
    
    for (const rule of this.categorizationRules) {
      if (rule.pattern.test(combinedText)) {
        console.log(`📝 Rule matched: "${combinedText}" → ${rule.category} (${rule.confidence})`);
        return { category: rule.category, confidence: rule.confidence };
      }
    }
    
    return { category: 'other', confidence: 0.1 };
  }

  // AI-powered categorization
  async aiCategorization(title: string, description?: string, location?: string): Promise<{ category: string; confidence: number }> {
    const validCategories = [
      'deep-work', 'social', 'networking', 'interview', 'travel', 'reading-emails', 
      'break', 'exercise', 'learning', 'creative', 'other'
    ];

    const prompt = `Categorize this calendar event into ONE of these categories:
${validCategories.join(', ')}

Event Title: "${title}"
${description ? `Description: "${description}"` : ''}
${location ? `Location: "${location}"` : ''}

Consider the context carefully. For example:
- "Mike x Aaron - Intern Interview" = interview (interview takes priority)
- "Aaron <> Franklin" or "Aaron x Mike" = networking
- "Coffee with Sarah" = social
- "Technical Interview" = interview
- "Flight to NYC" = travel
- "Email catchup" = reading-emails
- "Team Standup" = deep-work
- "Gym Session" = exercise
- "Creative writing" = creative

IMPORTANT: If the title contains "interview" or "intern", categorize as "interview" regardless of other patterns.

Return ONLY the category name, nothing else.`;

    try {
      const response = await AIService.getInstance().generateResponse(prompt);
      const category = response.trim();
      
      if (validCategories.includes(category)) {
        console.log(`🤖 AI categorized: "${title}" → ${category}`);
        return { category, confidence: 0.9 };
      } else {
        console.log(`❌ AI returned invalid category: ${category}, falling back to rules`);
        return this.ruleBasedCategorization(title, description, location);
      }
    } catch (error) {
      console.log('❌ AI categorization failed, using rules:', error);
      return this.ruleBasedCategorization(title, description, location);
    }
  }

  // Main categorization method
  async categorizeEvent(event: GoogleCalendarEvent): Promise<string> {
    const title = event.summary || 'Untitled Event';
    const description = event.description;
    const location = event.location;

    // Try AI categorization first, fall back to rules
    const result = await this.aiCategorization(title, description, location);
    
    return result.category;
  }

  // Transform Google Calendar event to Acorn format
  async transformCalendarEvent(event: GoogleCalendarEvent): Promise<CalendarTimeEntry> {
    const startTime = new Date(event.start.dateTime || event.start.date || '');
    const endTime = new Date(event.end.dateTime || event.end.date || '');
    
    // Handle all-day events
    const duration = event.start.date 
      ? 24 * 60 // All-day event = 24 hours
      : Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // Duration in minutes

    const category = await this.categorizeEvent(event);

    // CRITICAL: Calendar views need the date field in YYYY-MM-DD format
    // Use local date instead of ISO to avoid timezone issues
    const year = startTime.getFullYear();
    const month = String(startTime.getMonth() + 1).padStart(2, '0');
    const day = String(startTime.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    return {
      id: `gcal-${event.id}`,
      date: dateKey, // Required for calendar views to display the entry
      title: event.summary || 'Untitled Event',
      activity: event.summary || 'Untitled Event', // Calendar views use this for display
      startTime,
      endTime,
      duration,
      category,
      description: event.description || '',
      location: event.location || '',
      isFromCalendar: true,
      source: 'google-calendar',
      emotionalTags: [], // Start with empty tags, user can add later
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Learn from user corrections (for future ML improvements)
  async learnFromCorrection(eventTitle: string, originalCategory: string, correctedCategory: string): Promise<void> {
    console.log(`📚 Learning: "${eventTitle}" ${originalCategory} → ${correctedCategory}`);
    
    // For now, just log it. In the future, we could:
    // 1. Store in database for ML training
    // 2. Update rule patterns
    // 3. Create few-shot examples for AI prompts
  }

  // Batch categorize multiple events
  async categorizeEvents(events: GoogleCalendarEvent[]): Promise<CalendarTimeEntry[]> {
    console.log(`📊 Categorizing ${events.length} calendar events...`);
    
    const transformedEvents: CalendarTimeEntry[] = [];
    
    for (const event of events) {
      try {
        const transformed = await this.transformCalendarEvent(event);
        transformedEvents.push(transformed);
      } catch (error) {
        console.error(`❌ Failed to transform event: ${event.summary}`, error);
      }
    }
    
    console.log(`✅ Successfully categorized ${transformedEvents.length} events`);
    return transformedEvents;
  }
}

export const eventCategorizationService = EventCategorizationService.getInstance(); 