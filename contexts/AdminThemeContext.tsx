"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface AdminThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (context === undefined) {
    throw new Error("useAdminTheme must be used within AdminThemeProvider");
  }
  return context;
}

interface AdminThemeProviderProps {
  children: ReactNode;
}

export function AdminThemeProvider({ children }: AdminThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize with system preference if no saved theme
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-theme') as Theme;
      return saved || 'system';
    }
    return 'system';
  });

  const applyTheme = (selectedTheme: Theme) => {
    const root = document.documentElement;
    
    if (selectedTheme === 'dark') {
      root.classList.add('dark');
    } else if (selectedTheme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('admin-theme', newTheme);
    applyTheme(newTheme);
  };

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
}
