import { format } from 'date-fns';
import { DATE_FORMAT, DATETIME_FORMAT } from './constants';

export function formatDate(date: Date | string, pattern: string = DATE_FORMAT) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, pattern);
}

export function formatDateTime(date: Date | string, pattern: string = DATETIME_FORMAT) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, pattern);
}

