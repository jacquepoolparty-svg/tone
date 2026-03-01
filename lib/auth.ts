// Simple auth using localStorage/cookies for MVP
// Replace with Supabase Auth in production

export function getSession(): { userId: string; workspaceId: string; email: string } | null {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem('tone_session');
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
}

export function setSession(data: { userId: string; workspaceId: string; email: string }) {
  localStorage.setItem('tone_session', JSON.stringify(data));
}

export function clearSession() {
  localStorage.removeItem('tone_session');
}
