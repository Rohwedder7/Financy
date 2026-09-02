import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { listTrackedFiles, scanTrackedSecrets } from './scan-secrets.mjs'

const root = process.cwd()
const required = [
  'README.md',
  'CLAUDE.md',
  'docs/product/BND.md',
  'docs/product/BNT.md',
  'docs/product/PRD.md',
  'docs/product/BUSINESS_RULES.md',
  'docs/product/TRACEABILITY.md',
  'docs/product/FIGMA_INVENTORY.md',
  'docs/architecture/ARCHITECTURE.md',
  'docs/architecture/DATA_MODEL.md',
  'docs/architecture/GRAPHQL_CONTRACT.md',
  'docs/operations/SETUP.md',
  'docs/operations/SECURITY.md',
  'docs/tooling/MCP_SETUP.md',
  'backend/.env.example',
  'frontend/.env.example',
]

const errors = []
for (const file of required) {
  if (!existsSync(join(root, file))) errors.push(`Missing required file: ${file}`)
}

for (const [file, keys] of Object.entries({
  'backend/.env.example': ['JWT_SECRET', 'DATABASE_URL', 'JWT_ISSUER', 'JWT_AUDIENCE', 'JWT_EXPIRES_IN', 'CORS_ORIGIN'],
  'frontend/.env.example': ['VITE_BACKEND_URL'],
})) {
  const content = existsSync(join(root, file)) ? readFileSync(join(root, file), 'utf8') : ''
  for (const key of keys) {
    if (!new RegExp(`^${key}=`, 'm').test(content)) errors.push(`${file} is missing ${key}`)
  }
}

for (const file of ['backend/package.json', 'frontend/package.json']) {
  if (!existsSync(join(root, file))) continue
  const manifest = JSON.parse(readFileSync(join(root, file), 'utf8'))
  for (const group of ['dependencies', 'devDependencies']) {
    for (const [name, version] of Object.entries(manifest[group] ?? {})) {
      if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
        errors.push(`${file}: ${name} must use an exact version, found ${version}`)
      }
    }
  }
}

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = join(directory, entry.name)
    if (entry.isDirectory() && !['node_modules', '.git'].includes(entry.name)) {
      return markdownFiles(absolute)
    }
    return entry.isFile() && entry.name.endsWith('.md') ? [absolute] : []
  })
}

for (const file of markdownFiles(root)) {
  const content = readFileSync(file, 'utf8')
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0]
    if (!target || /^(https?:|mailto:)/.test(target)) continue
    if (!existsSync(resolve(dirname(file), target))) {
      errors.push(`Broken relative link in ${file.slice(root.length + 1)}: ${target}`)
    }
  }
}

// A SPEC no diretório errado, ou com status divergente dele, escapava de todos os
// gates e só aparecia em revisão manual.
// `blocked` só faz sentido em planned: é a SPEC que aguarda insumo externo.
const statusByDirectory = {
  active: ['approved'],
  completed: ['completed'],
  planned: ['planned', 'blocked'],
}
const specDirs = Object.keys(statusByDirectory)
const ids = new Map()
let specCount = 0

for (const directory of specDirs) {
  const absolute = join(root, 'specs', directory)
  if (!existsSync(absolute)) continue

  for (const name of readdirSync(absolute).filter((file) => file.startsWith('SPEC-'))) {
    const relative = join('specs', directory, name)
    const content = readFileSync(join(root, relative), 'utf8')
    const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)
    const idMatch = frontmatter?.[1].match(/^id: (SPEC-\d{3})$/m)
    if (!idMatch) {
      errors.push(`Invalid or missing SPEC frontmatter: ${relative}`)
      continue
    }

    const id = idMatch[1]
    if (ids.has(id)) errors.push(`Duplicate ${id}: ${ids.get(id)} and ${relative}`)
    ids.set(id, relative)
    specCount += 1

    const allowed = statusByDirectory[directory]
    const status = frontmatter?.[1].match(/^status: (\S+)$/m)?.[1]
    if (!allowed.includes(status)) {
      errors.push(`${relative}: expected status ${allowed.join(' or ')}, found ${status ?? 'none'}`)
    }

    for (const heading of ['## Objetivo', '## Verificação']) {
      if (!content.includes(heading)) errors.push(`${relative} is missing ${heading}`)
    }
    if (!content.includes('**AC-001:**')) errors.push(`${relative} is missing AC-001`)
  }
}

for (let number = 1; number <= 12; number += 1) {
  const id = `SPEC-${String(number).padStart(3, '0')}`
  if (!ids.has(id)) errors.push(`Missing planned delivery unit: ${id}`)
}

const traceability = existsSync(join(root, 'docs/product/TRACEABILITY.md'))
  ? readFileSync(join(root, 'docs/product/TRACEABILITY.md'), 'utf8')
  : ''
if (!traceability.includes('OPEN-UI-001')) {
  errors.push('docs/product/TRACEABILITY.md must record OPEN-UI-001 until SPEC-011 lands')
}

const ci = existsSync(join(root, '.github/workflows/ci.yml'))
  ? readFileSync(join(root, '.github/workflows/ci.yml'), 'utf8')
  : ''
for (const needle of ['pnpm verify', 'pnpm test:e2e', 'JWT_ISSUER', 'JWT_AUDIENCE', 'JWT_EXPIRES_IN']) {
  if (!ci.includes(needle)) {
    errors.push(`.github/workflows/ci.yml must include ${needle}`)
  }
}

try {
  errors.push(...scanTrackedSecrets(root, listTrackedFiles(root)))
} catch (error) {
  errors.push(`Secret scan could not list tracked files: ${error instanceof Error ? error.message : error}`)
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`Documentation valid: ${required.length} required files and ${specCount} SPECs.`)
