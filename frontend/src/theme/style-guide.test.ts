/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { categorySwatches, styleGuide } from './style-guide.ts'

const here = dirname(fileURLToPath(import.meta.url))
const css = readFileSync(join(here, '../index.css'), 'utf8')
const button = readFileSync(join(here, '../components/button.tsx'), 'utf8')
const field = readFileSync(join(here, '../components/field.tsx'), 'utf8')
const dialog = readFileSync(join(here, '../components/dialog.tsx'), 'utf8')

describe('AC-002: Style Guide tokens live in one module and in CSS', () => {
  it('maps every styleGuide hex into index.css @theme', () => {
    const values = Object.values(styleGuide).map((hex) => hex.toLowerCase())
    for (const hex of values) {
      expect(css.toLowerCase()).toContain(hex)
    }
  })

  it('exposes category swatches from the same palette', () => {
    for (const swatch of categorySwatches) {
      expect(Object.values(styleGuide)).toContain(swatch)
    }
  })

  it('button, field and dialog reuse token class names', () => {
    expect(button).toContain('bg-financy-green')
    expect(button).toContain('bg-financy-danger')
    expect(field).toContain('border-financy-border')
    expect(field).toContain('focus:border-financy-green')
    expect(dialog).toContain('border-financy-border')
    expect(css).toContain('outline: 2px solid var(--color-financy-green)')
  })
})
