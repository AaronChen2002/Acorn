import { Platform } from 'react-native';

// Centralized database service import utility
let databaseService: any = null;

if (Platform.OS !== 'web') {
  try {
    databaseService = require('../services/database').databaseService;
  } catch (error) {
    console.log('Database service not available on this platform');
  }
}

export { databaseService };

// Utility function to save data to database with consistent error handling
export const saveToDatabase = async <T>(
  saveFunction: (data: T) => Promise<void>,
  data: T,
  errorMessage: string = 'Database save failed'
): Promise<void> => {
  if (databaseService) {
    try {
      await saveFunction(data);
    } catch (dbError) {
      console.warn(`${errorMessage}:`, dbError);
    }
  }
}; 