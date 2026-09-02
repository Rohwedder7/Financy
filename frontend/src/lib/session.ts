export const SESSION_KEY = 'financy.session'
export const SESSION_CHANGED_EVENT = 'financy:session'

export function readToken(): string | null {
  return sessionStorage.getItem(SESSION_KEY)
}

export function writeToken(token: string): void {
  sessionStorage.setItem(SESSION_KEY, token)
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT))
}

export function clearToken(): void {
  sessionStorage.removeItem(SESSION_KEY)
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT))
}
