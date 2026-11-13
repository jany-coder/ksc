import type { Entry } from './core.ts'

// Form error messages. The schemas (shared by the browser and the server) carry
// these KEYS as their messages; the page turns a key into the reader's language
// (see FieldError and useTMessage). So one schema serves both languages.
export const validationMessages = {
  'val.nameRequired': { bn: 'নাম লিখুন', en: 'Enter a name' },
  'val.nameTooLong': { bn: 'নাম অনেক বেশি লম্বা', en: 'The name is too long' },
  'val.phoneInvalid': {
    bn: 'সঠিক মোবাইল নম্বর লিখুন',
    en: 'Enter a valid mobile number',
  },
  'val.passwordRequired': { bn: 'পাসওয়ার্ড লিখুন', en: 'Enter a password' },
  'val.tooLong': { bn: 'অনেক বেশি লম্বা', en: 'Too long' },
  'val.emailInvalid': { bn: 'সঠিক ইমেইল লিখুন', en: 'Enter a valid email' },
  'val.consentApply': {
    bn: 'সম্মতি ছাড়া আবেদন করা যাবে না',
    en: 'You cannot apply without giving consent',
  },
  'val.consentMember': {
    bn: 'সম্মতি ছাড়া সদস্য যোগ করা যাবে না',
    en: 'A member cannot be added without consent',
  },
  'val.titleRequired': { bn: 'শিরোনাম লিখুন', en: 'Enter a title' },
  'val.titleTooLong': {
    bn: 'শিরোনাম অনেক বেশি লম্বা',
    en: 'The title is too long',
  },
  'val.descriptionTooLong': {
    bn: 'বিবরণ অনেক বেশি লম্বা',
    en: 'The description is too long',
  },
  'val.bodyRequired': {
    bn: 'নোটিশের বিবরণ লিখুন',
    en: 'Enter the notice details',
  },
  'val.dateInvalid': { bn: 'সঠিক তারিখ দিন', en: 'Enter a valid date' },
  'val.timeInvalid': { bn: 'সঠিক সময় দিন', en: 'Enter a valid time' },
  'val.locationTooLong': {
    bn: 'স্থানের নাম অনেক বেশি লম্বা',
    en: 'The place name is too long',
  },
  'val.currentPasswordRequired': {
    bn: 'বর্তমান পাসওয়ার্ড লিখুন',
    en: 'Enter your current password',
  },
  'val.passwordMin': {
    bn: 'কমপক্ষে {min}টি অক্ষর দিন',
    en: 'Use at least {min} characters',
  },
  'val.passwordTooLong': {
    bn: 'পাসওয়ার্ড অনেক বেশি লম্বা',
    en: 'The password is too long',
  },
  'val.passwordSame': {
    bn: 'নতুন পাসওয়ার্ড বর্তমানটির মতো হতে পারবে না',
    en: 'The new password cannot be the same as the current one',
  },
  'val.passwordMismatch': {
    bn: 'দুটি পাসওয়ার্ড মিলছে না',
    en: 'The two passwords do not match',
  },
} satisfies Record<string, Entry>
