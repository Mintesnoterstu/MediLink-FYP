// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// DeepSeek Configuration
export const DEEPSEEK_API_URL = import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
export const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';

// App Configuration
export const APP_NAME = 'MediLink';
export const APP_VERSION = '1.0.0';

// Supported Languages
export const SUPPORTED_LANGUAGES = ['en', 'am'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// User Roles
export const USER_ROLES = ['patient', 'provider', 'admin'] as const;

// Urgency Levels
export const URGENCY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

// Date Formats
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm';

