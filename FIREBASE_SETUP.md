# Firebase Setup Guide

This guide will help you set up Firebase for user authentication and cloud data storage in your Acorn app.

## 🔥 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" 
3. Enter project name: `acorn-productivity-app`
4. Choose whether to enable Google Analytics (recommended: Yes)
5. Click "Create project"

## 🌐 Step 2: Configure Web App

1. In your Firebase project, click "Add app" → Web (</> icon)
2. Register app with nickname: `Acorn Web App`
3. ✅ **Check "Also set up Firebase Hosting"** (optional but recommended)
4. Click "Register app"
5. Copy the Firebase configuration object (you'll need this for .env.local)

## 🔐 Step 3: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Enable **Google** sign-in provider:
   - Click on "Google"
   - Toggle "Enable" 
   - Add your project's support email
   - Click "Save"

## 📊 Step 4: Set up Firestore Database

1. In Firebase Console, go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (we'll secure it later)
3. Select a location close to your users (e.g., `us-central1`)
4. Click "Done"

## 🔒 Step 5: Configure Security Rules

Update your Firestore security rules to ensure user data isolation:

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow access to user's subcollections
      match /{subcollection}/{document} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## ⚙️ Step 6: Environment Configuration

Create or update your `.env.local` file with your Firebase configuration:

```env
# Existing Google OAuth (keep these)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_existing_client_id
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your_existing_client_secret
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key

# New Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 🔍 Where to find these values:

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click on your web app
4. Copy the config values from the `firebaseConfig` object

## 🔄 Step 7: OAuth Integration

Since you already have Google OAuth set up, we'll reuse those credentials for Firebase:

1. In Firebase Console, go to **Authentication** → **Sign-in method** → **Google**
2. **Important**: Make sure the "Web SDK configuration" section shows your existing Google OAuth client ID
3. If not, add your existing `EXPO_PUBLIC_GOOGLE_CLIENT_ID` to the "Web client ID" field

## 🧪 Step 8: Test the Integration

1. Restart your development server:
   ```bash
   npm run web -- --clear
   ```

2. Open the app and navigate to the hamburger menu
3. Look for the "🔐 Authentication" section
4. Try signing in with your Google account
5. Verify that user data appears correctly

## 📊 Step 9: Verify Data Storage

After signing in and using the app:

1. Go to Firebase Console → **Firestore Database**
2. You should see a `users` collection with your user document
3. Under your user document, you'll see subcollections like:
   - `morningCheckIns`
   - `calendarTimeEntries` 
   - `insights`

## 🔧 Troubleshooting

### ❌ "Firebase not configured" message
- Check that all `EXPO_PUBLIC_FIREBASE_*` environment variables are set
- Restart your development server after adding env vars

### ❌ Authentication fails
- Verify your Google OAuth client ID matches between Google Cloud Console and Firebase
- Check that your domain is authorized in both Google Cloud Console and Firebase

### ❌ "Permission denied" in Firestore
- Check your Firestore security rules
- Ensure the user is properly authenticated
- Verify the document paths match the security rules

### ❌ Data not syncing
- Check the browser console for error messages
- Verify Firebase configuration is correct
- Test with a fresh user account

## 🎯 Next Steps

Once Firebase is configured, you'll have:

✅ **User Authentication**: Sign in/out with Google accounts  
✅ **Data Isolation**: Each user's data is completely separate  
✅ **Cloud Sync**: Local SQLite data syncs to Firestore  
✅ **Longitudinal Analysis**: User data persists across sessions  
✅ **Multi-Device Access**: Same account works across devices  

## 📚 Additional Resources

- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth/web/google-signin)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Console](https://console.firebase.google.com/)

---

**Need help?** Check the console logs in your browser's developer tools for detailed error messages and debugging information. 