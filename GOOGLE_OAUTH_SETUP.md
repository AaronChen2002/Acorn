# Google OAuth2 Setup Guide

To enable Google Calendar integration, you need to set up OAuth2 credentials:

## 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Calendar API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

## 2. Create OAuth2 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Add authorized redirect URIs:
   - For development: `http://localhost:8081`
   - For production: Your app's domain

## 3. Environment Variables

Create a `.env.local` file in your project root:

```env
# Google OAuth2 Configuration
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your_client_secret_here

# OpenAI API Key (if using AI features)
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

## 4. Security Notes

- **Never commit your `.env.local` file** to version control
- The `.env.local` file is already in `.gitignore`
- For production, use secure environment variable management
- Consider using separate credentials for development and production

## 5. Testing

Once configured:
1. Restart your development server
2. Open the app and navigate to the side menu
3. Look for "Google Calendar Integration"
4. Click "Connect Google Calendar"
5. Complete the OAuth2 flow

## 6. Features Enabled

After successful setup:
- ✅ Real OAuth2 authentication
- ✅ Automatic sync every 5 minutes  
- ✅ Background sync (even when app is closed)
- ✅ Events appear in your calendar views
- ✅ Manual sync option
- ✅ Secure token storage

## 7. Troubleshooting

**Authentication fails:**
- Check your client ID and secret
- Verify redirect URIs match exactly
- Ensure Google Calendar API is enabled

**No events syncing:**
- Check console logs for errors
- Verify the user has calendar events
- Try manual sync first

**Background sync not working:**
- Check browser console for errors
- Ensure app has focus for web version
- For mobile, ensure background processing is enabled 