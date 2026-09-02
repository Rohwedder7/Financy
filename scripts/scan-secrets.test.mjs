import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { forbiddenFileContents, forbiddenTrackedPath, scanTrackedSecrets } from './scan-secrets.mjs'

describe('secret scan', () => {
  it('AC-003: rejects tracked env, sqlite and private keys, not examples', () => {
    assert.match(forbiddenTrackedPath('backend/.env') ?? '', /forbidden/)
    assert.match(forbiddenTrackedPath('backend/prisma/dev.db') ?? '', /forbidden/)
    assert.equal(forbiddenTrackedPath('backend/.env.example'), null)
    assert.match(forbiddenFileContents('id_rsa', '-----BEGIN OPENSSH PRIVATE KEY-----\n') ?? '', /private key/)
    assert.equal(scanTrackedSecrets('/tmp', ['README.md']).length, 0)
  })
})
