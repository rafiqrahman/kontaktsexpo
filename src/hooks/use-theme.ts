import { Colors } from '@/constants/theme';
import { useKontaktsTheme } from '@/store/themeContext';

export function useTheme() {
  const { theme } = useKontaktsTheme();
  return Colors[theme];
}
