import { GoogleCalendarEvent } from '../types/calendar';
import { googleAuthService } from './googleAuthService';

const GOOGLE_CALENDAR_BASE_URL = 'https://www.googleapis.com/calendar/v3';

class GoogleCalendarService {
  /**
   * Get events from Google Calendar using OAuth2 authentication
   */
  async getEvents(startDate: Date, endDate: Date): Promise<GoogleCalendarEvent[]> {
    try {
      // Get valid access token
      const accessToken = await googleAuthService.getValidAccessToken();
      
      if (!accessToken) {
        throw new Error('No valid access token available');
      }

      const timeMin = startDate.toISOString();
      const timeMax = endDate.toISOString();

      const url = `${GOOGLE_CALENDAR_BASE_URL}/calendars/primary/events?` +
        `timeMin=${encodeURIComponent(timeMin)}&` +
        `timeMax=${encodeURIComponent(timeMax)}&` +
        `singleEvents=true&` +
        `orderBy=startTime&` +
        `maxResults=250`; // Limit to avoid overwhelming the system

      console.log('🔄 Fetching Google Calendar events...');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          console.log('🔄 Token expired, attempting refresh...');
          const refreshed = await googleAuthService.refreshTokens();
          if (refreshed) {
            // Retry the request with new token
            const newAccessToken = await googleAuthService.getValidAccessToken();
            if (newAccessToken) {
              const retryResponse = await fetch(url, {
                headers: {
                  'Authorization': `Bearer ${newAccessToken}`,
                  'Content-Type': 'application/json',
                },
              });
              
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                console.log(`✅ Successfully fetched ${retryData.items?.length || 0} events (after refresh)`);
                return retryData.items || [];
              }
            }
          }
          throw new Error('Authentication failed');
        }
        
        throw new Error(`Google Calendar API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log(`✅ Successfully fetched ${data.items?.length || 0} events`);
      
      return data.items || [];
    } catch (error) {
      console.error('❌ Error fetching Google Calendar events:', error);
      throw error;
    }
  }

  /**
   * Get list of available calendars
   */
  async getCalendars(): Promise<any[]> {
    try {
      const accessToken = await googleAuthService.getValidAccessToken();
      
      if (!accessToken) {
        throw new Error('No valid access token available');
      }

      const url = `${GOOGLE_CALENDAR_BASE_URL}/users/me/calendarList`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.items || [];
    } catch (error) {
      console.error('❌ Error fetching calendars:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated and connected
   */
  async isConnected(): Promise<boolean> {
    return googleAuthService.isAuthenticated();
  }

  /**
   * Disconnect from Google Calendar
   */
  async disconnect(): Promise<void> {
    await googleAuthService.signOut();
  }

  /**
   * Generate sample events for testing (when not authenticated)
   */
  generateSampleEvents(): GoogleCalendarEvent[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return [
      {
        id: 'sample-1',
        summary: 'Daily Standup',
        description: 'Team sync meeting',
        start: {
          dateTime: new Date(today.getTime() + 9 * 60 * 60 * 1000).toISOString(), // 9 AM
        },
        end: {
          dateTime: new Date(today.getTime() + 9.5 * 60 * 60 * 1000).toISOString(), // 9:30 AM
        },
        location: 'Conference Room A',
      },
      {
        id: 'sample-2',
        summary: 'Product Review',
        description: 'Weekly product review session',
        start: {
          dateTime: new Date(today.getTime() + 14 * 60 * 60 * 1000).toISOString(), // 2 PM
        },
        end: {
          dateTime: new Date(today.getTime() + 15 * 60 * 60 * 1000).toISOString(), // 3 PM
        },
        location: 'Main Conference Room',
      },
      {
        id: 'sample-3',
        summary: 'Client Call',
        description: 'Monthly check-in with client',
        start: {
          dateTime: new Date(today.getTime() + 16 * 60 * 60 * 1000).toISOString(), // 4 PM
        },
        end: {
          dateTime: new Date(today.getTime() + 17 * 60 * 60 * 1000).toISOString(), // 5 PM
        },
        location: 'Virtual',
      },
    ];
  }
}

export const googleCalendarService = new GoogleCalendarService(); 