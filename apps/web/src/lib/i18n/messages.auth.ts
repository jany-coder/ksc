import type { Entry } from './core.ts'

// Sign-in and change-password pages.
export const authMessages = {
  'auth.pageTitleSignIn': {
    bn: 'সাইন ইন — কলমা সোশ্যাল ক্লাব',
    en: 'Sign in — Kalma Social Club',
  },
  'auth.pageTitleChange': {
    bn: 'পাসওয়ার্ড বদলান — কলমা সোশ্যাল ক্লাব',
    en: 'Change password — Kalma Social Club',
  },
  'auth.signIn': { bn: 'সাইন ইন', en: 'Sign in' },
  'auth.signInLead': {
    bn: 'ক্লাবের অ্যাডমিন প্যানেলে ঢুকতে মোবাইল নম্বর ও পাসওয়ার্ড দিন।',
    en: "Enter your mobile number and password to open the club's admin panel.",
  },
  'auth.phone': { bn: 'মোবাইল নম্বর', en: 'Mobile number' },
  'auth.password': { bn: 'পাসওয়ার্ড', en: 'Password' },
  'auth.wait': { bn: 'অপেক্ষা করুন…', en: 'Please wait…' },
  'auth.errorWrong': {
    bn: 'নম্বর বা পাসওয়ার্ড ঠিক নয়। পরপর ৫ বার ভুল হলে ১৫ মিনিটের জন্য সাইন ইন বন্ধ থাকবে।',
    en: 'The number or password is not correct. After 5 wrong tries in a row, sign-in is blocked for 15 minutes.',
  },
  'auth.errorLocked': {
    bn: 'অনেকবার ভুল হয়েছে। ১৫ মিনিট পরে আবার চেষ্টা করুন।',
    en: 'Too many wrong tries. Please try again in 15 minutes.',
  },
  'auth.errorGeneric': {
    bn: 'সাইন ইন করা গেল না। একটু পরে আবার চেষ্টা করুন।',
    en: 'Could not sign in. Please try again in a moment.',
  },
  'auth.errorNetwork': {
    bn: 'সংযোগে সমস্যা হয়েছে। ইন্টারনেট দেখে আবার চেষ্টা করুন।',
    en: 'There was a connection problem. Check your internet and try again.',
  },
  'auth.changeTitle': { bn: 'নতুন পাসওয়ার্ড দিন', en: 'Set a new password' },
  'auth.tempNotice': {
    bn: 'আপনার পাসওয়ার্ড অস্থায়ী। নতুন পাসওয়ার্ড না দেওয়া পর্যন্ত অন্য কোনো পাতায় যাওয়া যাবে না।',
    en: 'Your password is temporary. You cannot open any other page until you set a new one.',
  },
  'auth.changeLead': {
    bn: 'আপনার পাসওয়ার্ড বদলান। অন্য সব ডিভাইস থেকে সাইন আউট হয়ে যাবে।',
    en: 'Change your password. You will be signed out on all other devices.',
  },
  'auth.tempPassword': { bn: 'অস্থায়ী পাসওয়ার্ড', en: 'Temporary password' },
  'auth.currentPassword': {
    bn: 'বর্তমান পাসওয়ার্ড',
    en: 'Current password',
  },
  'auth.newPassword': { bn: 'নতুন পাসওয়ার্ড', en: 'New password' },
  'auth.minHint': {
    bn: 'কমপক্ষে {min}টি অক্ষর।',
    en: 'At least {min} characters.',
  },
  'auth.confirm': {
    bn: 'নতুন পাসওয়ার্ড আবার লিখুন',
    en: 'Type the new password again',
  },
  'auth.changeSubmit': { bn: 'পাসওয়ার্ড বদলান', en: 'Change password' },
  'auth.signOut': { bn: 'সাইন আউট', en: 'Sign out' },
  'auth.errorWrongCurrent': {
    bn: 'বর্তমান পাসওয়ার্ড ঠিক নয়। পরপর ৫ বার ভুল হলে ১৫ মিনিটের জন্য বন্ধ থাকবে।',
    en: 'The current password is not correct. After 5 wrong tries in a row, it is blocked for 15 minutes.',
  },
  'auth.errorSession': {
    bn: 'সেশন শেষ হয়ে গেছে। আবার সাইন ইন করুন।',
    en: 'Your session has ended. Please sign in again.',
  },
  'auth.errorChangeFailed': {
    bn: 'পাসওয়ার্ড বদলানো গেল না। একটু পরে আবার চেষ্টা করুন।',
    en: 'Could not change the password. Please try again in a moment.',
  },
  'auth.showPassword': { bn: 'পাসওয়ার্ড দেখান', en: 'Show password' },
  'auth.hidePassword': { bn: 'পাসওয়ার্ড লুকান', en: 'Hide password' },
  'val.confirmRequired': {
    bn: 'নতুন পাসওয়ার্ড আবার লিখুন',
    en: 'Type the new password again',
  },
} satisfies Record<string, Entry>
