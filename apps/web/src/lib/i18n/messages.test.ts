import { describe, expect, it } from 'vitest'

import { messages } from './messages.ts'

const BENGALI = /[ঀ-৿]/
const placeholders = (text: string) =>
  [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()

const entries = Object.entries(messages)

describe('messages', () => {
  it('has a non-empty Bengali and English text for every key', () => {
    for (const [key, entry] of entries) {
      expect(entry.bn.trim(), `${key} (bn)`).not.toBe('')
      expect(entry.en.trim(), `${key} (en)`).not.toBe('')
    }
  })

  it('has no Bengali letters in an English text (a forgotten translation)', () => {
    for (const [key, entry] of entries) {
      // The language switch names the OTHER language: "বাংলা" on an English page.
      if (key === 'lang.otherName') continue
      expect(BENGALI.test(entry.en), `${key} (en) has Bengali text`).toBe(false)
    }
  })

  it('has Bengali letters in every Bengali text, except the language names', () => {
    for (const [key, entry] of entries) {
      if (key === 'lang.otherName') continue // "English" is the name of English
      expect(BENGALI.test(entry.bn), `${key} (bn) has no Bengali`).toBe(true)
    }
  })

  it('uses the same {placeholders} in both languages', () => {
    for (const [key, entry] of entries)
      expect(placeholders(entry.en), key).toEqual(placeholders(entry.bn))
  })
})
