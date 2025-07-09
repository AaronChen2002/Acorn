import { useAppStore } from '../stores/appStore';
import { getTheme } from '../constants';

// Custom hook to get current theme
export const useTheme = () => {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  
  const currentTheme = getTheme(theme === 'dark');
  
  return {
    theme: currentTheme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark')
  };
};

// Theme-aware style helper
export const createThemedStyles = (theme: any) => ({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  surface: {
    backgroundColor: theme.colors.surface,
  },
  text: {
    color: theme.colors.text,
  },
  textSecondary: {
    color: theme.colors.textSecondary,
  },
  border: {
    borderColor: theme.colors.border,
  },
}); 