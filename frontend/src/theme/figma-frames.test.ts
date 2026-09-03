/// <reference types="node" />
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { figmaFrames } from './figma-frames.ts'

const visual = join(dirname(fileURLToPath(import.meta.url)), '../../../docs/product/visual')
const comparison = readFileSync(join(visual, 'COMPARISON.md'), 'utf8')

describe('AC-001: implemented screens point to Figma node ids', () => {
  it('keeps the inventory node ids for every mandatory screen', () => {
    expect(figmaFrames).toEqual({
      styleGuide: '3:377',
      login: '3101:353',
      signUp: '3103:1915',
      dashboard: '3103:1987',
      transactions: '3104:362',
      categories: '3104:2028',
      dialogs: '3107:3599',
    })
  })

  it('records a Figma and app screenshot pair for every implemented frame', () => {
    for (const node of Object.values(figmaFrames)) {
      expect(comparison).toContain(`\`${node}\``)
    }

    expect(existsSync(join(visual, 'figma/login.png'))).toBe(true)
    expect(existsSync(join(visual, 'app/login.png'))).toBe(true)
    expect(existsSync(join(visual, 'app/dialog-transacao.png'))).toBe(true)
    expect(existsSync(join(visual, 'app/dialog-categoria.png'))).toBe(true)
  })
})
