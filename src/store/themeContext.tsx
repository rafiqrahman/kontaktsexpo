import React, { createContext, useState, useEffect, useContext } from "react";
import * as SecureStore from "expo-secure-store";

type Theme = 'classic' | 'midnight' | 'aurora' | 'rose' | 'neon' | 'forest' | 'sunset';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_KEY = "kontakts_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('classic');

  useEffect(() => {
    SecureStore.getItemAsync(THEME_KEY).then((savedTheme) => {
      if (savedTheme) setThemeState(savedTheme as Theme);
    });
  }, []);

  const setTheme = async (newTheme: Theme) => {
    await SecureStore.setItemAsync(THEME_KEY, newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useKontaktsTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useKontaktsTheme must be used within ThemeProvider");
  return context;
}
