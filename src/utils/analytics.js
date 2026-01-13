const ANALYTICS_KEY = "loyvault_shop_analytics";

export function trackEvent(eventName, eventData = {}) {
  if (!eventName) return;
  const payload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    data: eventData || {},
  };

  try {
    // Dev log
    // eslint-disable-next-line no-console
    console.log("[Analytics]", payload);

    const existingRaw = localStorage.getItem(ANALYTICS_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    existing.push(payload);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(existing));
  } catch {
    // ignore analytics failures
  }
}

export function getAnalytics() {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearAnalytics() {
  try {
    localStorage.removeItem(ANALYTICS_KEY);
  } catch {
    // ignore
  }
}

export default {
  trackEvent,
  getAnalytics,
  clearAnalytics,
};
