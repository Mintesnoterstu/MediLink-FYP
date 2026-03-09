import { useUI } from '../context/UIContext';

export function useTheme() {
  const { theme, toggleTheme, setTheme } = useUI();
  return { theme, toggleTheme, setTheme };
}

