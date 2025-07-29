import { User, onAuthStateChanged, signInWithCredential, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { googleAuthService, GoogleUser } from './googleAuthService';
import { auth, db, GoogleAuthProvider, isFirebaseAvailable } from './firebase';

export interface AcornUser {
  uid: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: Date;
  lastLoginAt: Date;
  isFirstTimeUser: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: AcornUser;
  error?: string;
}

class AuthService {
  private currentUser: AcornUser | null = null;
  private authStateListeners: ((user: AcornUser | null) => void)[] = [];

  constructor() {
    console.log('🔐 AuthService constructor called');
    console.log('  Firebase available:', isFirebaseAvailable());
    console.log('  Auth instance:', !!auth);
    
    if (isFirebaseAvailable() && auth) {
      console.log('🔐 Setting up Firebase auth state listener...');
      
      // Listen for Firebase auth state changes
      onAuthStateChanged(auth, async (firebaseUser) => {
        console.log('🔥 Firebase auth state changed:');
        console.log('  User:', firebaseUser ? firebaseUser.email : 'null');
        console.log('  UID:', firebaseUser?.uid || 'null');
        
        if (firebaseUser) {
          console.log('✅ Firebase user authenticated, creating AcornUser...');
          const acornUser = await this.createAcornUserFromFirebase(firebaseUser);
          this.currentUser = acornUser;
          console.log('✅ AcornUser created:', acornUser.email);
        } else {
          console.log('❌ Firebase user signed out, clearing currentUser');
          this.currentUser = null;
        }
        
        console.log('🔔 Notifying auth state listeners...');
        this.authStateListeners.forEach((listener, index) => {
          console.log(`  Listener ${index}:`, this.currentUser ? this.currentUser.email : 'null');
          listener(this.currentUser);
        });
      });
      
      console.log('✅ Firebase auth state listener set up successfully');
    } else {
      console.log('⚠️ Firebase not available, using local-only mode');
    }
  }

  /**
   * Sign in using Google OAuth and Firebase
   */
  async signIn(): Promise<AuthResult> {
    try {
      console.log('🔐 Starting authentication flow...');
      console.log('  Firebase available:', isFirebaseAvailable());
      console.log('  Auth instance:', !!auth);

      if (!isFirebaseAvailable()) {
        console.log('⚠️ Firebase not configured, using local-only mode');
        // Fall back to local-only authentication with Google OAuth
        const googleResult = await googleAuthService.authenticate();
        if (googleResult.success && googleResult.user) {
          const localUser: AcornUser = {
            uid: googleResult.user.id,
            email: googleResult.user.email,
            name: googleResult.user.name,
            picture: googleResult.user.picture,
            createdAt: new Date(),
            lastLoginAt: new Date(),
            isFirstTimeUser: false // For now, assume not first time in local mode
          };
          this.currentUser = localUser;
          this.notifyAuthStateListeners();
          return { success: true, user: localUser };
        }
        return { success: false, error: googleResult.error };
      }

      // Step 1: Get Google OAuth tokens
      console.log('🔐 Step 1: Starting Google OAuth...');
      const googleResult = await googleAuthService.authenticate();
      if (!googleResult.success || !googleResult.user) {
        console.log('❌ Google OAuth failed:', googleResult.error);
        return { success: false, error: googleResult.error || 'Google authentication failed' };
      }

      console.log('✅ Google OAuth successful:', googleResult.user.email);

      // Step 2: Get Google access token and sign in to Firebase
      console.log('🔐 Step 2: Getting Google access token...');
      const googleAccessToken = await googleAuthService.getValidAccessToken();
      if (!googleAccessToken) {
        console.log('❌ Failed to get Google access token');
        return { success: false, error: 'Failed to get Google access token' };
      }

      console.log('✅ Got Google access token, creating Firebase credential...');

      // Create Firebase credential from Google token
      const credential = GoogleAuthProvider.credential(null, googleAccessToken);
      console.log('✅ Firebase credential created, signing in...');
      
      const firebaseResult = await signInWithCredential(auth!, credential);
      console.log('✅ Firebase authentication successful:', firebaseResult.user.email);
      console.log('  Firebase UID:', firebaseResult.user.uid);

      // Step 3: Create or update user document in Firestore
      console.log('🔐 Step 3: Creating/updating user document...');
      const acornUser = await this.createOrUpdateUserDocument(firebaseResult.user, googleResult.user);
      
      console.log('✅ User document updated, setting currentUser...');
      this.currentUser = acornUser;
      console.log('✅ User authenticated:', acornUser.email);
      console.log('  Acorn UID:', acornUser.uid);

      // Explicitly notify listeners
      console.log('🔔 Explicitly notifying auth state listeners...');
      this.notifyAuthStateListeners();

      return { success: true, user: acornUser };
    } catch (error) {
      console.error('❌ Authentication error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  }

  /**
   * Sign out user from both Firebase and Google
   */
  async signOut(): Promise<void> {
    try {
      console.log('🔐 Signing out...');

      // Sign out from Google OAuth
      await googleAuthService.signOut();

      // Sign out from Firebase if available
      if (isFirebaseAvailable() && auth) {
        await firebaseSignOut(auth);
      }

      this.currentUser = null;
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): AcornUser | null {
    console.log('🔍 getCurrentUser called');
    console.log('  Current user:', this.currentUser ? this.currentUser.email : 'null');
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const authenticated = this.currentUser !== null;
    console.log('🔍 isAuthenticated called');
    console.log('  Result:', authenticated);
    console.log('  Current user:', this.currentUser ? this.currentUser.email : 'null');
    return authenticated;
  }

  /**
   * Listen for authentication state changes
   */
  onAuthStateChanged(callback: (user: AcornUser | null) => void): () => void {
    console.log('🔔 Registering new auth state listener');
    console.log('  Current user:', this.currentUser ? this.currentUser.email : 'null');
    
    this.authStateListeners.push(callback);
    
    // Immediately call with current state
    console.log('🔔 Immediately calling new listener with current state');
    callback(this.currentUser);
    
    console.log('  Total listeners:', this.authStateListeners.length);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        console.log('🔔 Unregistering auth state listener');
        this.authStateListeners.splice(index, 1);
        console.log('  Remaining listeners:', this.authStateListeners.length);
      }
    };
  }

  /**
   * Create or update user document in Firestore
   */
  private async createOrUpdateUserDocument(firebaseUser: User, googleUser: GoogleUser): Promise<AcornUser> {
    if (!db) {
      throw new Error('Firestore not available');
    }

    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);
    
    const now = new Date();
    const isFirstTimeUser = !userDoc.exists();

    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || googleUser.email,
      name: firebaseUser.displayName || googleUser.name,
      picture: firebaseUser.photoURL || googleUser.picture,
      lastLoginAt: serverTimestamp(),
      ...(isFirstTimeUser && {
        createdAt: serverTimestamp(),
        isFirstTimeUser: true
      })
    };

    await setDoc(userRef, userData, { merge: true });

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || googleUser.email,
      name: firebaseUser.displayName || googleUser.name,
      picture: firebaseUser.photoURL || googleUser.picture,
      createdAt: isFirstTimeUser ? now : userDoc.data()?.createdAt?.toDate() || now,
      lastLoginAt: now,
      isFirstTimeUser
    };
  }

  /**
   * Create AcornUser from Firebase User
   */
  private async createAcornUserFromFirebase(firebaseUser: User): Promise<AcornUser> {
    if (!db) {
      // Fallback for local-only mode
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || '',
        picture: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isFirstTimeUser: false
      };
    }

    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || '',
      picture: firebaseUser.photoURL || undefined,
      createdAt: userData?.createdAt?.toDate() || new Date(),
      lastLoginAt: userData?.lastLoginAt?.toDate() || new Date(),
      isFirstTimeUser: userData?.isFirstTimeUser || false
    };
  }

  /**
   * Notify all auth state listeners
   */
  private notifyAuthStateListeners(): void {
    console.log('🔔 Notifying all auth state listeners');
    console.log('  Current user:', this.currentUser ? this.currentUser.email : 'null');
    console.log('  Total listeners:', this.authStateListeners.length);
    
    this.authStateListeners.forEach((listener, index) => {
      console.log(`  Calling listener ${index}:`, this.currentUser ? this.currentUser.email : 'null');
      listener(this.currentUser);
    });
  }

  /**
   * Mark user as experienced (no longer first time)
   */
  async markUserAsExperienced(): Promise<void> {
    if (!this.currentUser || !db) return;

    try {
      const userRef = doc(db, 'users', this.currentUser.uid);
      await setDoc(userRef, { isFirstTimeUser: false }, { merge: true });
      
      // Update local user object
      this.currentUser.isFirstTimeUser = false;
      this.notifyAuthStateListeners();
    } catch (error) {
      console.error('❌ Failed to update user experience status:', error);
    }
  }
}

export const authService = new AuthService(); 