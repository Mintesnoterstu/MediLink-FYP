export const analyticsService = {
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    // In production, integrate with analytics service (e.g., Google Analytics, Mixpanel)
    console.log('Analytics Event:', eventName, properties);
    
    // Store locally for now
    const events = this.getStoredEvents();
    events.push({
      event: eventName,
      properties,
      timestamp: new Date().toISOString(),
    });
    
    try {
      localStorage.setItem('analytics_events', JSON.stringify(events.slice(-100))); // Keep last 100 events
    } catch (error) {
      console.error('Failed to store analytics event:', error);
    }
  },

  trackPageView(page: string): void {
    this.trackEvent('page_view', { page });
  },

  trackAIInteraction(type: string, confidence: number): void {
    this.trackEvent('ai_interaction', { type, confidence });
  },

  trackSymptomAnalysis(urgencyLevel: string, confidence: number): void {
    this.trackEvent('symptom_analysis', { urgencyLevel, confidence });
  },

  getStoredEvents(): Array<{ event: string; properties?: Record<string, any>; timestamp: string }> {
    try {
      const stored = localStorage.getItem('analytics_events');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  clearEvents(): void {
    localStorage.removeItem('analytics_events');
  },
};

