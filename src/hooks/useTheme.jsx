import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // This error is thrown if the hook is used outside of the ThemeProvider
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default useTheme;

