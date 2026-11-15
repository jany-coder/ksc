// One-time: puts the club's past activities (the text it gave us in November
// 2026) into the database, so the home page and the archive show them as cards
// that admins can edit, add a photo to, or delete like any other activity.
//
//   node --env-file=.env scripts/seed-activities.ts
//
// - Safe to run twice: an activity whose title already exists is skipped.
// - Rows are published and credited to the first super_admin.
// - "June" and "July" 2025 had no day, and "18 and 31 May" had two; the dates
//   below are a best guess (marked) for ordering. Fix them in the admin panel.
import { asc, eq } from 'drizzle-orm'

import { db } from '../src/db/index.ts'
import { activities, members } from '../src/db/schema/index.ts'
import { makeSlug } from '../src/lib/slug.ts'

const ITEMS: { date: string; title: string; text: string }[] = [
  {
    date: '2025-01-31',
    title: 'প্রথম সামাজিক মিলনমেলা',
    text: 'এলাকার মানুষের পারস্পরিক পরিচয়, সম্প্রীতি ও সামাজিক বন্ধন দৃঢ় করার লক্ষ্যে প্রথম সামাজিক মিলনমেলার আয়োজন করা হয়। এই আয়োজন সম্মিলিত সামাজিক উদ্যোগের প্রতি মানুষের আগ্রহ ও অংশগ্রহণের সম্ভাবনা তুলে ধরে।',
  },
  {
    date: '2025-03-26',
    title: 'সম্মিলিত ইফতার আয়োজন',
    text: 'কলমা ওয়াজ আলী স্কুলে এলাকার মানুষের অংশগ্রহণে ইফতার আয়োজন করা হয়। পারস্পরিক সম্প্রীতি ও সৌহার্দ্য বৃদ্ধিই ছিল এই উদ্যোগের মূল উদ্দেশ্য।',
  },
  {
    date: '2025-05-18', // guess: the club gave "18 and 31 May"
    title: 'সদস্যপদ কার্যক্রম ও সাংগঠনিক উদ্যোগ',
    text: 'সদস্যপদ কার্যক্রম নিয়ে আলোচনা এবং সদস্য ফর্ম পূরণ কর্মসূচির মাধ্যমে সংগঠনের সাংগঠনিক কার্যক্রম আরও সুসংগঠিত করার উদ্যোগ নেওয়া হয়।',
  },
  {
    date: '2025-06-07', // guess: "June"; Eid al-Adha 2025 in Bangladesh
    title: 'পরিবেশ ও জনসচেতনতা',
    text: 'ঈদুল আজহায় কোরবানির বর্জ্য যথাযথভাবে ব্যবস্থাপনা ও পরিবেশ পরিচ্ছন্ন রাখার বিষয়ে সচেতনতামূলক আহ্বান জানানো হয়।',
  },
  {
    date: '2025-07-01', // guess: the club gave only "July"
    title: 'তথ্য যাচাই ও ডিজিটাল সচেতনতা',
    text: 'সামাজিক যোগাযোগমাধ্যমে গুজব ও বিভ্রান্তিকর তথ্যের বিস্তার রোধে কোনো তথ্য শেয়ার করার আগে তার সত্যতা যাচাই করার আহ্বান জানানো হয়।',
  },
  {
    date: '2025-09-16',
    title: 'হারিয়ে যাওয়া শিশুকে পরিবারের কাছে ফিরিয়ে দেওয়া',
    text: 'একটি শিশুকে অসহায় অবস্থায় একা পাওয়ার পর তার পরিবারের সন্ধানে ক্লাবের সদস্যরা সম্মিলিতভাবে উদ্যোগ নেন। মাইকিং ও সামাজিক যোগাযোগমাধ্যমে প্রচারণার মাধ্যমে পরিবারের খোঁজ চালানো হয়। পরবর্তী সময়ে শিশুটিকে সুস্থ অবস্থায় তার বাবা-মায়ের কাছে ফিরিয়ে দেওয়া হয়।',
  },
  {
    date: '2025-12-11',
    title: 'বিনামূল্যে চিকিৎসাসেবা ক্যাম্প',
    text: 'এলাকার সুবিধাবঞ্চিত মানুষের জন্য অভিজ্ঞ চিকিৎসকের মাধ্যমে বিনামূল্যে স্বাস্থ্যসেবা, প্রয়োজনীয় ওষুধ ও স্বাস্থ্যসামগ্রী বিতরণের উদ্যোগ গ্রহণ করা হয়।',
  },
  {
    date: '2026-02-10',
    title: 'নিরাপদ আশ্রয় ও পরিবারের সঙ্গে পুনর্মিলন',
    text: 'রাত আনুমানিক ৯টার দিকে এলাকায় বিপর্যস্ত অবস্থায় একটি ছেলেকে পাওয়া যায়। ক্লাবের সদস্যরা দ্রুত তাকে নিরাপদ আশ্রয়ে নিয়ে আসেন এবং তার কাছে থাকা মোবাইল নম্বরের সূত্র ধরে পরিবারের সাথে যোগাযোগ করে অবস্থান নিশ্চিত করেন। রাত ১১টা ৪০ মিনিটে স্বজন ক্লাবে পৌঁছালে তাকে সুস্থ ও নিরাপদ অবস্থায় তাদের কাছে হস্তান্তর করা হয়।',
  },
  {
    date: '2026-03-14',
    title: 'ইফতার ও উপহার বিতরণ',
    text: 'ক্লাবের যাকাত ফান্ডের অর্থায়নে মাদ্রাসা ও এতিমখানার শিক্ষার্থীদের জন্য উপহার ও খাবারের ব্যবস্থা করা হয়। পবিত্র রমজানের আনন্দ ভাগাভাগি করাই ছিল এই উদ্যোগের উদ্দেশ্য।',
  },
  {
    date: '2026-03-21',
    title: 'ঈদ মিলনমেলা',
    text: 'ক্লাবের সদস্যরা নিজ নিজ উদ্যোগে রান্না করা খাবার নিয়ে একত্রিত হন। ক্লাব কার্যালয়ে আয়োজিত এই মিলনমেলা সদস্যদের মধ্যে আন্তরিকতা, সৌহার্দ্য ও পারস্পরিক বন্ধন আরও দৃঢ় করে।',
  },
  {
    date: '2026-06-13',
    title: 'এইচএসসি পরীক্ষার্থীদের দিকনির্দেশনা ও শুভকামনা',
    text: 'উচ্চমাধ্যমিক পরীক্ষার্থীদের ভবিষ্যৎ পরিকল্পনা, উচ্চশিক্ষা ও ক্যারিয়ার নিয়ে মতবিনিময় সভার আয়োজন করা হয়। পাশাপাশি প্রত্যেক পরীক্ষার্থীর জন্য শুভকামনা উপহার প্রদান করা হয়।',
  },
]

const [owner] = await db
  .select({ id: members.id })
  .from(members)
  .where(eq(members.role, 'super_admin'))
  .orderBy(asc(members.joinedAt))
  .limit(1)
if (!owner) {
  console.error('Error: no super_admin exists yet; run seed:super-admin first')
  process.exit(1)
}

let added = 0
for (const item of ITEMS) {
  const existing = await db
    .select({ id: activities.id })
    .from(activities)
    .where(eq(activities.title, item.title))
    .limit(1)
  if (existing.length > 0) {
    console.log(`skip (already there): ${item.date}`)
    continue
  }
  await db.insert(activities).values({
    title: item.title,
    slug: makeSlug({ title: item.title, date: item.date }),
    description: item.text,
    eventDate: item.date,
    status: 'published',
    createdBy: owner.id,
    publishedAt: new Date(),
  })
  added++
  console.log(`added: ${item.date}`)
}
console.log(`Done: ${added} added, ${ITEMS.length - added} skipped.`)
