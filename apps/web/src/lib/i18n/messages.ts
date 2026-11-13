import { makeT } from './core.ts'
import type { Lang } from './core.ts'
import { adminMessages } from './messages.admin.ts'
import { authMessages } from './messages.auth.ts'
import { publicMessages } from './messages.public.ts'
import { validationMessages } from './messages.validation.ts'

// Every text in the app, in both languages. One table, so a key used in code
// but missing here is a type error, and so is a missing language.
export const messages = {
  ...publicMessages,
  ...validationMessages,
  ...authMessages,
  ...adminMessages,
}
export type MessageKey = keyof typeof messages

/** A translate function outside React (page <head>, server code). */
export const tFor = (lang: Lang) => makeT(messages, lang)

export function isMessageKey(value: string): value is MessageKey {
  return Object.hasOwn(messages, value)
}
