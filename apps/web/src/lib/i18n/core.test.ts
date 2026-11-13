import { describe, expect, it } from 'vitest'

import {
  fill,
  isEnglishPath,
  isPublicPath,
  makeT,
  readLangFromCookieHeader,
  resolveLang,
  switchLangPath,
} from './core.ts'

describe('fill', () => {
  it('replaces named placeholders and leaves unknown ones', () => {
    expect(fill('Hello {name}, {n} left', { name: 'Rahim', n: 3 })).toBe(
      'Hello Rahim, 3 left',
    )
    expect(fill('Hi {who}', {})).toBe('Hi {who}')
    expect(fill('plain')).toBe('plain')
  })
})

describe('paths', () => {
  it('knows English and public paths', () => {
    expect(isEnglishPath('/en')).toBe(true)
    expect(isEnglishPath('/en/gallery')).toBe(true)
    expect(isEnglishPath('/english')).toBe(false)
    expect(isPublicPath('/gallery')).toBe(true)
    expect(isPublicPath('/admin')).toBe(false)
    expect(isPublicPath('/admin/members')).toBe(false)
    expect(isPublicPath('/login')).toBe(false)
    expect(isPublicPath('/administrator')).toBe(true)
  })

  it('lets the URL decide on public pages, the cookie elsewhere', () => {
    expect(resolveLang('/en/gallery', 'bn')).toBe('en')
    expect(resolveLang('/gallery', 'en')).toBe('bn')
    expect(resolveLang('/admin', 'en')).toBe('en')
    expect(resolveLang('/login', null)).toBe('bn')
  })

  it('switches the same page to the other language', () => {
    expect(switchLangPath('/', 'en')).toBe('/en')
    expect(switchLangPath('/gallery', 'en')).toBe('/en/gallery')
    expect(switchLangPath('/en', 'bn')).toBe('/')
    expect(switchLangPath('/en/gallery', 'bn')).toBe('/gallery')
    expect(switchLangPath('/en/gallery', 'en')).toBe('/en/gallery')
  })
})

describe('readLangFromCookieHeader', () => {
  it('finds the language among other cookies', () => {
    expect(readLangFromCookieHeader('a=1; ksc_lang=en; b=2')).toBe('en')
    expect(readLangFromCookieHeader('ksc_lang=bn')).toBe('bn')
  })

  it('ignores a missing or unknown value', () => {
    expect(readLangFromCookieHeader(null)).toBeNull()
    expect(readLangFromCookieHeader('a=1')).toBeNull()
    expect(readLangFromCookieHeader('ksc_lang=fr')).toBeNull()
  })
})

describe('makeT', () => {
  const messages = {
    hi: { bn: 'হ্যালো {name}', en: 'Hello {name}' },
  }
  it('picks the language and fills placeholders', () => {
    expect(makeT(messages, 'bn')('hi', { name: 'রহিম' })).toBe('হ্যালো রহিম')
    expect(makeT(messages, 'en')('hi', { name: 'Rahim' })).toBe('Hello Rahim')
  })
})
