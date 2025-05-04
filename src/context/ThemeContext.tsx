
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Set default theme to dark
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Apply theme to document when component mounts or theme changes
    document.documentElement.classList.toggle('dark', theme === 'dark');
    
    // Add a smooth transition class to the document element
    const htmlElement = document.documentElement;
    if (!htmlElement.classList.contains('transition-colors')) {
      htmlElement.classList.add('transition-colors', 'duration-300');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
