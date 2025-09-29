import React, { createContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  // State to hold the selected theme. Defaults to 'system'.
  const [theme, setTheme] = useState(() => {
    // Get stored theme from localStorage or default to 'system'
    return localStorage.getItem('theme') || 'system';
  });

  // Function to apply the theme by adding/removing the 'dark' class on the root element
  const applyTheme = useCallback(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
  }, [theme]);

  useEffect(() => {
    // Apply theme whenever the theme state changes
    applyTheme();

    // Store the selected theme in localStorage
    localStorage.setItem('theme', theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    // Add a listener for changes in the system's color scheme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // If the theme is set to 'system', re-apply the theme
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    // Cleanup listener on component unmount
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, ThemeContext };
