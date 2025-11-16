// Notification type from @/types is not used here, using browser Notification API

export const notificationService = {
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return 'denied';
  },

  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    const permission = await this.requestPermission();
    
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options,
      });
    }
  },

  scheduleNotification(
    title: string,
    message: string,
    scheduledTime: Date,
    options?: NotificationOptions
  ): string {
    const now = new Date().getTime();
    const scheduled = scheduledTime.getTime();
    const delay = scheduled - now;

    if (delay <= 0) {
      this.showNotification(title, { body: message, ...options });
      return '';
    }

    const timeoutId = setTimeout(() => {
      this.showNotification(title, { body: message, ...options });
    }, delay);

    return timeoutId.toString();
  },

  cancelScheduledNotification(id: string): void {
    clearTimeout(Number(id));
  },
};

