import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Theme, Language, Notification } from '@/types';

interface UIState {
  theme: Theme;
  language: Language;
  notifications: Notification[];
  isLoading: boolean;
}

type UIAction =
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_NOTIFICATIONS' };

const initialState: UIState = {
  theme: (localStorage.getItem('theme') as Theme) || 'light',
  language: (localStorage.getItem('language') as Language) || 'en',
  notifications: [],
  isLoading: false,
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_THEME':
      localStorage.setItem('theme', action.payload);
      return { ...state, theme: action.payload };
    case 'SET_LANGUAGE':
      localStorage.setItem('language', action.payload);
      return { ...state, language: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.payload ? { ...n, read: true } : n)),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    default:
      return state;
  }
}

interface UIContextType extends UIState {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLanguage: (language: Language) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  setLoading: (loading: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  const setTheme = (theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const toggleTheme = () => {
    const newTheme: Theme = state.theme === 'light' ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  const setLanguage = (language: Language) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const markNotificationRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  return (
    <UIContext.Provider
      value={{
        ...state,
        setTheme,
        toggleTheme,
        setLanguage,
        addNotification,
        removeNotification,
        markNotificationRead,
        clearNotifications,
        setLoading,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}

