export function trackChatbotEvent(event, details = {}) {
  const payload = {
    event,
    details,
    at: new Date().toISOString(),
  };

  if (process.env.NODE_ENV !== "production") {
    console.info("[chatbot]", payload);
  }
}
