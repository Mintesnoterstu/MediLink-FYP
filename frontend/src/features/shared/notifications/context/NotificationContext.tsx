import React, { createContext, useContext, ReactNode } from 'react';
import { Notification } from '@/types';
import { useUI } from '@/features/shared/ui/context/UIContext';

interface NotificationContextValue {
  notifications: Notification[];
  addNotification: ReturnType<typeof useUI>['addNotification'];
  removeNotification: ReturnType<typeof useUI>['removeNotification'];
  markNotificationRead: ReturnType<typeof useUI>['markNotificationRead'];
  clearNotifications: ReturnType<typeof useUI>['clearNotifications'];
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { notifications, addNotification, removeNotification, markNotificationRead, clearNotifications } = useUI();

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        markNotificationRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
}

