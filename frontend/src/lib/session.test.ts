import { afterEach, describe, expect, it } from 'vitest'
import { clearToken, readToken, writeToken } from './session.ts'

describe('session storage', () => {
  afterEach(() => {
    sessionStorage.clear()
  })

  it('round-trips a token without exposing it as a URL parameter', () => {
    writeToken('session-token')

    expect(readToken()).toBe('session-token')
    expect(window.location.href).not.toContain('session-token')
  })

  it('forgets the token after clear', () => {
    writeToken('session-token')
    clearToken()

    expect(readToken()).toBeNull()
  })
})
