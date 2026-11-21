import { describe, expect, it } from 'vitest'

import { readThemeFromCookieHeader, themeClass } from './admin-theme.ts'

describe('themeClass', () => {
  it('themes admin pages only', () => {
    expect(themeClass('/admin', 'dark')).toBe('dark')
    expect(themeClass('/admin/members', 'system')).toBe('theme-auto')
    expect(themeClass('/', 'dark')).toBeUndefined()
    expect(themeClass('/login', 'dark')).toBeUndefined()
    expect(themeClass('/administer', 'dark')).toBeUndefined()
  })
  it('is light by default', () => {
    expect(themeClass('/admin', null)).toBeUndefined()
    expect(themeClass('/admin', 'light')).toBeUndefined()
  })
})

describe('readThemeFromCookieHeader', () => {
  it('finds the theme among other cookies and ignores junk', () => {
    expect(readThemeFromCookieHeader('a=1; ksc_admin_theme=dark; b=2')).toBe(
      'dark',
    )
    expect(readThemeFromCookieHeader('ksc_admin_theme=pink')).toBeNull()
    expect(readThemeFromCookieHeader('')).toBeNull()
  })
})
