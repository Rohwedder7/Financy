import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const PRIVATE_KEY = /^-----BEGIN [A-Z ]*PRIVATE KEY-----/m
const SQLITE_OR_ENV = /(?:^|\/)(?:\.env(?:\..+)?|(?:.+)\.db(?:-journal)?)$/i
const ALLOWED_ENV = /(?:^|\/)\.env\.example$/

const SKIP_CONTENT = /\.(png|jpg|jpeg|webp|gif|woff2?|ico|lock)$/i

/**
 * AC-003: tracked user material, local env files and SQLite databases stay out of git.
 */
export function forbiddenTrackedPath(relativePath) {
  const normalized = relativePath.replaceAll('\\', '/')

  if (ALLOWED_ENV.test(normalized)) {
    return null
  }

  if (SQLITE_OR_ENV.test(normalized) || /(^|\/)playwright-report\//.test(normalized)) {
    return `forbidden tracked file: ${normalized}`
  }

  return null
}

export function forbiddenFileContents(relativePath, content) {
  const normalized = relativePath.replaceAll('\\', '/')

  if (SKIP_CONTENT.test(normalized) || normalized === 'pnpm-lock.yaml') {
    return null
  }

  if (PRIVATE_KEY.test(content)) {
    return `private key material in ${normalized}`
  }

  return null
}

export function scanTrackedSecrets(root, trackedPaths) {
  const errors = []

  for (const relativePath of trackedPaths) {
    const pathError = forbiddenTrackedPath(relativePath)
    if (pathError) {
      errors.push(pathError)
      continue
    }

    const absolute = join(root, relativePath)
    let content
    try {
      content = readFileSync(absolute, 'utf8')
    } catch {
      continue
    }

    const contentError = forbiddenFileContents(relativePath, content)
    if (contentError) {
      errors.push(contentError)
    }
  }

  return errors
}

export function listTrackedFiles(root) {
  return execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = process.cwd()
  const errors = scanTrackedSecrets(root, listTrackedFiles(root))
  if (errors.length > 0) {
    console.error(errors.join('\n'))
    process.exit(1)
  }
  console.log('Secret scan clean.')
}
