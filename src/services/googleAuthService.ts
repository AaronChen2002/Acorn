import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

// Google OAuth2 Configuration
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET;

// Validation for required environment variables
if (!GOOGLE_CLIENT_ID) {
  console.warn('⚠️ Google OAuth not configured: Missing EXPO_PUBLIC_GOOGLE_CLIENT_ID');
}
if (!GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️ Google OAuth not configured: Missing EXPO_PUBLIC_GOOGLE_CLIENT_SECRET');
}

// Check if Google Calendar integration is available
export const isGoogleCalendarAvailable = (): boolean => {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
};

// OAuth2 Endpoints
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';

// Scopes needed for Google Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
];

export interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  scope: string;
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

class GoogleAuthService {
  private tokens: GoogleTokens | null = null;
  private user: GoogleUser | null = null;
  private codeVerifier: string | null = null;

  constructor() {
    this.loadStoredTokens();
  }

  /**
   * Initialize OAuth2 authentication flow
   */
  async authenticate(): Promise<{ success: boolean; user?: GoogleUser; error?: string }> {
    try {
      console.log('🔐 Starting Google OAuth2 authentication...');

      // Check if Google Calendar integration is properly configured
      if (!isGoogleCalendarAvailable()) {
        return { 
          success: false, 
          error: 'Google Calendar integration is not configured. Please add your Google OAuth credentials to the .env.local file. See GOOGLE_OAUTH_SETUP.md for instructions.' 
        };
      }

      // For web, we need to handle the redirect differently to avoid page reload
      if (Platform.OS === 'web') {
        return await this.authenticateWeb();
      } else {
        return await this.authenticateMobile();
      }
    } catch (error) {
      console.error('❌ OAuth2 authentication error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Authentication failed' };
    }
  }

  /**
   * Web-specific OAuth authentication that handles redirects properly
   */
  private async authenticateWeb(): Promise<{ success: boolean; user?: GoogleUser; error?: string }> {
    try {
      // Check if we're returning from OAuth redirect
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      console.log('🔍 OAuth Web Debug:');
      console.log('  Current URL:', window.location.href);
      console.log('  Code present:', !!code);
      console.log('  State present:', !!state);
      console.log('  Error present:', !!error);

      if (error) {
        console.error('❌ OAuth error in callback:', error);
        // Clean up URL
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        return { success: false, error: `OAuth error: ${error}` };
      }

      if (code && state) {
        console.log('🔄 Processing OAuth callback...');
        
        // Check if we have a valid code verifier
        if (Platform.OS === 'web' && !this.codeVerifier) {
          this.codeVerifier = localStorage.getItem('oauth_code_verifier');
        }
        
        if (!this.codeVerifier) {
          console.warn('⚠️ Code verifier missing - this might be a stale callback, starting fresh OAuth flow');
          
          // Clean up stale callback and start fresh
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          
          // Fall through to start new OAuth flow below
        } else {
          // We have a valid code verifier, proceed with token exchange
          const tokens = await this.exchangeCodeForTokens(code);
          
          if (tokens) {
            await this.storeTokens(tokens);
            this.tokens = tokens;
            
            // Fetch user info
            const user = await this.fetchUserInfo();
            if (user) {
              this.user = user;
              await this.storeUserInfo(user);
              console.log('✅ User authenticated:', user.email);
              
              // Clean up the URL after successful authentication
              const cleanUrl = window.location.origin + window.location.pathname;
              window.history.replaceState({}, document.title, cleanUrl);
              
              // Add a small delay to ensure state is properly set before returning
              await new Promise(resolve => setTimeout(resolve, 100));
              
              return { success: true, user };
            }
          }
          
          return { success: false, error: 'Failed to exchange tokens' };
        }
      }

      // If we get here, we're starting a new OAuth flow
      console.log('🚀 Starting new OAuth flow...');
      
      // Clean up any leftover OAuth state
      if (Platform.OS === 'web') {
        localStorage.removeItem('oauth_code_verifier');
      }
      this.codeVerifier = null;
      
      // Clean up URL before starting OAuth
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      // Start OAuth flow
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      const state_param = await this.generateState();
      const codeChallenge = await this.generateCodeChallenge();
      
      console.log('🔍 DETAILED OAuth Debug Info:');
      console.log('================================');
      console.log('Current URL:', window.location.href);
      console.log('Origin:', window.location.origin);
      console.log('Pathname:', window.location.pathname);
      console.log('Computed Redirect URI:', redirectUri);
      console.log('Client ID:', GOOGLE_CLIENT_ID);
      console.log('State:', state_param);
      console.log('Code Challenge:', codeChallenge);
      console.log('================================');
      
      const authUrl = new URL(GOOGLE_AUTH_URL);
      authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID!);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', SCOPES.join(' '));
      authUrl.searchParams.set('state', state_param);
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');
      
      console.log('🔄 FULL OAuth URL being sent to Google:');
      console.log(authUrl.toString());
      console.log('🔄 Redirecting to Google OAuth...');
      
      // Show alert with redirect URI before redirecting
      if (confirm(`About to redirect to Google OAuth.\n\nRedirect URI: ${redirectUri}\n\nMake sure this EXACT URI is in your Google Cloud Console!\n\nClick OK to continue, Cancel to abort.`)) {
        window.location.href = authUrl.toString();
      } else {
        return { success: false, error: 'OAuth cancelled by user' };
      }
      
      // This won't be reached as we're redirecting
      return { success: false, error: 'Redirecting to Google...' };
    } catch (error) {
      console.error('❌ Web OAuth error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Authentication failed' };
    }
  }

  /**
   * Mobile-specific OAuth authentication using expo-auth-session
   */
  private async authenticateMobile(): Promise<{ success: boolean; user?: GoogleUser; error?: string }> {
    try {
      // Create the OAuth2 request
      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID!,
        scopes: SCOPES,
        redirectUri: AuthSession.makeRedirectUri({
          useProxy: true,
        }),
        responseType: AuthSession.ResponseType.Code,
        state: await this.generateState(),
        codeChallenge: await this.generateCodeChallenge(),
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
      });

      // Start the OAuth2 flow
      const result = await request.promptAsync({
        authorizationEndpoint: GOOGLE_AUTH_URL,
      });

      if (result.type === 'success') {
        console.log('✅ OAuth2 authorization successful');
        
        // Exchange authorization code for tokens
        const tokens = await this.exchangeCodeForTokens(result.params.code);
        
        if (tokens) {
          await this.storeTokens(tokens);
          this.tokens = tokens;
          
          // Fetch user info
          const user = await this.fetchUserInfo();
          if (user) {
            this.user = user;
            await this.storeUserInfo(user);
            console.log('✅ User authenticated:', user.email);
            return { success: true, user };
          }
        }
      } else if (result.type === 'cancel') {
        console.log('❌ OAuth2 authentication cancelled by user');
        return { success: false, error: 'Authentication cancelled' };
      } else {
        console.log('❌ OAuth2 authentication failed:', result.type);
        return { success: false, error: 'Authentication failed' };
      }

      return { success: false, error: 'Unknown error' };
    } catch (error) {
      console.error('❌ Mobile OAuth error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Authentication failed' };
    }
  }

  /**
   * Exchange authorization code for access tokens
   */
  private async exchangeCodeForTokens(code: string): Promise<GoogleTokens | null> {
    try {
      // Use different redirect URIs for web vs mobile
      const redirectUri = Platform.OS === 'web' 
        ? `${window.location.origin}${window.location.pathname}`
        : AuthSession.makeRedirectUri({ useProxy: true });

      // For web, retrieve code verifier from localStorage if not in memory
      if (Platform.OS === 'web' && !this.codeVerifier) {
        this.codeVerifier = localStorage.getItem('oauth_code_verifier');
      }

      console.log('🔍 Token Exchange Debug Info:');
      console.log('  Code:', code);
      console.log('  Redirect URI:', redirectUri);
      console.log('  Client ID:', GOOGLE_CLIENT_ID);
      console.log('  Code Verifier:', this.codeVerifier ? 'Present' : 'Missing');

      if (!this.codeVerifier) {
        console.error('❌ Code verifier is missing!');
        return null;
      }

      const response = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID!,
          client_secret: GOOGLE_CLIENT_SECRET!,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code_verifier: this.codeVerifier,
        }),
      });

      const data = await response.json();
      
      console.log('🔍 Token Exchange Response:');
      console.log('  Status:', response.status);
      console.log('  Response:', data);
      
      if (response.ok) {
        const tokens: GoogleTokens = {
          ...data,
          expires_at: Date.now() + (data.expires_in * 1000),
        };
        
        // Clean up code verifier after successful exchange
        if (Platform.OS === 'web') {
          localStorage.removeItem('oauth_code_verifier');
        }
        this.codeVerifier = null;
        
        console.log('✅ Tokens exchanged successfully');
        return tokens;
      } else {
        console.error('❌ Token exchange failed:', data);
        return null;
      }
    } catch (error) {
      console.error('❌ Token exchange error:', error);
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(): Promise<boolean> {
    if (!this.tokens?.refresh_token) {
      console.error('❌ No refresh token available');
      return false;
    }

    try {
      console.log('🔄 Refreshing access token...');
      
      const response = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID!,
          client_secret: GOOGLE_CLIENT_SECRET!,
          refresh_token: this.tokens.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        const newTokens: GoogleTokens = {
          ...this.tokens,
          access_token: data.access_token,
          expires_in: data.expires_in,
          expires_at: Date.now() + (data.expires_in * 1000),
        };
        
        await this.storeTokens(newTokens);
        this.tokens = newTokens;
        console.log('✅ Tokens refreshed successfully');
        return true;
      } else {
        console.error('❌ Token refresh failed:', data);
        return false;
      }
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      return false;
    }
  }

  /**
   * Get valid access token (refresh if needed)
   */
  async getValidAccessToken(): Promise<string | null> {
    if (!this.tokens) {
      console.error('❌ No tokens available');
      return null;
    }

    // Check if token is expired (with 5-minute buffer)
    const now = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes
    
    if (now >= (this.tokens.expires_at - bufferTime)) {
      console.log('🔄 Token expired, refreshing...');
      const refreshed = await this.refreshTokens();
      if (!refreshed) {
        return null;
      }
    }

    return this.tokens.access_token;
  }

  /**
   * Fetch user information from Google
   */
  private async fetchUserInfo(): Promise<GoogleUser | null> {
    const accessToken = await this.getValidAccessToken();
    if (!accessToken) return null;

    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          picture: data.picture,
        };
      }
    } catch (error) {
      console.error('❌ Failed to fetch user info:', error);
    }

    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.tokens !== null && this.user !== null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): GoogleUser | null {
    return this.user;
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      console.log('🔐 Signing out user...');
      
      // Revoke tokens
      if (this.tokens?.access_token) {
        await fetch(GOOGLE_REVOKE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            token: this.tokens.access_token,
          }),
        });
      }

      // Clear stored data
      await this.clearStoredData();
      this.tokens = null;
      this.user = null;
      
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  }

  /**
   * Store tokens securely
   */
  private async storeTokens(tokens: GoogleTokens): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // For web, use localStorage (in production, consider more secure options)
        localStorage.setItem('google_tokens', JSON.stringify(tokens));
      } else {
        // For mobile, use secure storage
        await SecureStore.setItemAsync('google_tokens', JSON.stringify(tokens));
      }
    } catch (error) {
      console.error('❌ Failed to store tokens:', error);
    }
  }

  /**
   * Store user info securely
   */
  private async storeUserInfo(user: GoogleUser): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('google_user', JSON.stringify(user));
      } else {
        await SecureStore.setItemAsync('google_user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('❌ Failed to store user info:', error);
    }
  }

  /**
   * Load stored tokens and user info from secure storage
   */
  private async loadStoredTokens(): Promise<void> {
    try {
      console.log('🔄 Loading stored tokens...');
      
      let tokensJson: string | null = null;
      let userJson: string | null = null;

      if (Platform.OS === 'web') {
        tokensJson = localStorage.getItem('google_tokens');
        userJson = localStorage.getItem('google_user');
      } else {
        tokensJson = await SecureStore.getItemAsync('google_tokens');
        userJson = await SecureStore.getItemAsync('google_user');
      }

      if (tokensJson) {
        this.tokens = JSON.parse(tokensJson);
        console.log('✅ Loaded stored tokens');
      } else {
        console.log('⚠️ No stored tokens found');
      }
      
      if (userJson) {
        this.user = JSON.parse(userJson);
        console.log('✅ Loaded stored user:', this.user.email);
      } else {
        console.log('⚠️ No stored user found');
      }

      if (this.tokens && this.user) {
        console.log('✅ Stored authentication loaded for:', this.user.email);
      }
    } catch (error) {
      console.error('❌ Failed to load stored data:', error);
    }
  }

  /**
   * Clear all stored data
   */
  private async clearStoredData(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('google_tokens');
        localStorage.removeItem('google_user');
      } else {
        await SecureStore.deleteItemAsync('google_tokens');
        await SecureStore.deleteItemAsync('google_user');
      }
    } catch (error) {
      console.error('❌ Failed to clear stored data:', error);
    }
  }

  /**
   * Generate state parameter for OAuth2
   */
  private async generateState(): Promise<string> {
    return Crypto.randomUUID();
  }

  /**
   * Generate code challenge for PKCE
   */
  private async generateCodeChallenge(): Promise<string> {
    this.codeVerifier = Crypto.randomUUID();
    
    // Store code verifier in localStorage for web to persist across redirects
    if (Platform.OS === 'web') {
      localStorage.setItem('oauth_code_verifier', this.codeVerifier);
    }
    
    const challenge = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      this.codeVerifier,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );
    
    // Convert base64 to base64url
    return challenge
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}

export const googleAuthService = new GoogleAuthService(); 