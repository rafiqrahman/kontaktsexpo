/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  classic: {
    background: '#fafafa',
    foreground: '#09090b',
    primary: '#09090b',
    text: '#09090b',
    textSecondary: '#71717a',
    backgroundElement: '#ffffff',
    backgroundSelected: '#e4e4e7',
  },
  midnight: {
    background: '#0f172a', // Rich deep slate blue
    foreground: '#fafafa',
    primary: '#6366f1', // Indigo accent
    text: '#fafafa',
    textSecondary: '#94a3b8',
    backgroundElement: '#1e293b',
    backgroundSelected: '#334155',
  },
  aurora: {
    background: '#f1f5f9',
    foreground: '#0f172a',
    primary: '#0d9488',
    text: '#0f172a',
    textSecondary: '#64748b',
    backgroundElement: '#e2e8f0',
    backgroundSelected: '#cbd5e1',
  },
  rose: {
    background: '#fff1f2',
    foreground: '#4c0519',
    primary: '#e11d48',
    text: '#4c0519',
    textSecondary: '#9f1239',
    backgroundElement: '#ffe4e6',
    backgroundSelected: '#fecdd3',
  },
  neon: {
    background: '#020202', // True pitch black
    foreground: '#f4f4f5',
    primary: '#a855f7', // Electric neon purple
    text: '#f4f4f5',
    textSecondary: '#a1a1aa',
    backgroundElement: '#18181b',
    backgroundSelected: '#27272a',
  },
  forest: {
    background: '#0a1c12', // Deep forest green
    foreground: '#ecfdf5',
    primary: '#10b981', // Emerald mint
    text: '#ecfdf5',
    textSecondary: '#34d399',
    backgroundElement: '#112c1c',
    backgroundSelected: '#163b25',
  },
  sunset: {
    background: '#1a0f0a', // Warm sunset rust
    foreground: '#fff7ed',
    primary: '#f97316', // Flame orange
    text: '#fff7ed',
    textSecondary: '#fb923c',
    backgroundElement: '#2a170e',
    backgroundSelected: '#381e13',
  },
  // Map light/dark to defaults to fix build errors
  light: {
    background: '#f1f5f9',
    foreground: '#0f172a',
    primary: '#0d9488',
    text: '#0f172a',
    textSecondary: '#64748b',
    backgroundElement: '#e2e8f0',
    backgroundSelected: '#cbd5e1',
  },
  dark: {
    background: '#0f172a',
    foreground: '#fafafa',
    primary: '#6366f1',
    text: '#fafafa',
    textSecondary: '#94a3b8',
    backgroundElement: '#1e293b',
    backgroundSelected: '#334155',
  },
} as const;
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
