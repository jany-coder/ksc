import type { Entry } from './core.ts'

// Texts of the public site. Keys are grouped by area (site, nav, hero, ...).
//
// The English of the club's own descriptions (what we do, about us) is a first
// draft: the club should read and approve it, like the Bengali.
export const publicMessages = {
  // --- site-wide ---
  'site.name': { bn: 'কলমা সোশ্যাল ক্লাব', en: 'Kalma Social Club' },
  'site.logoAlt': {
    bn: 'কলমা সোশ্যাল ক্লাবের লোগো',
    en: 'Kalma Social Club logo',
  },
  'site.tagline': {
    bn: 'একসাথে, সুন্দর আগামীর পথে।',
    en: 'Together for a better tomorrow.',
  },
  'site.locationShort': {
    bn: 'সাভার, ঢাকা · প্রতিষ্ঠা ২০২৪',
    en: 'Savar, Dhaka · Founded 2024',
  },
  'site.titleSuffix': {
    bn: 'কলমা সোশ্যাল ক্লাব',
    en: 'Kalma Social Club',
  },
  'lang.switchLabel': { bn: 'ভাষা বদলান', en: 'Change language' },
  'lang.otherName': { bn: 'English', en: 'বাংলা' },

  // --- navigation ---
  'nav.main': { bn: 'প্রধান মেনু', en: 'Main menu' },
  'nav.sections': { bn: 'পাতার অংশ', en: 'Sections of the page' },
  'nav.quick': { bn: 'দ্রুত মেনু', en: 'Quick menu' },
  'nav.whatWeDo': { bn: 'আমাদের কাজ', en: 'What we do' },
  'nav.future': { bn: 'আগামী মিশন', en: 'Future mission' },
  'nav.gallery': { bn: 'গ্যালারি', en: 'Gallery' },
  'nav.notice': { bn: 'নোটিশ', en: 'Notices' },
  'nav.about': { bn: 'আমাদের সম্পর্কে', en: 'About us' },
  'nav.join': { bn: 'সদস্য হোন', en: 'Become a member' },
  'nav.home': { bn: 'হোম', en: 'Home' },
  'nav.activities': { bn: 'কার্যক্রম', en: 'Activities' },

  // --- footer ---
  'footer.address': { bn: 'ঠিকানা', en: 'Address' },
  'footer.village': {
    bn: 'গ্রাম: কলমা ১ (আমতলা)',
    en: 'Village: Kalma 1 (Amtola)',
  },
  'footer.post': { bn: 'ডাকঘর: ডেইরি ফার্ম', en: 'Post office: Dairy Farm' },
  'footer.thana': {
    bn: 'থানা: সাভার, ঢাকা',
    en: 'Police station: Savar, Dhaka',
  },
  'footer.contact': { bn: 'যোগাযোগ', en: 'Contact' },
  'footer.mobile': {
    bn: 'মোবাইল: [নম্বর দিন]',
    en: 'Mobile: [add number]',
  },
  'footer.facebook': { bn: 'ফেসবুক পেজ', en: 'Facebook page' },
  'footer.copyright': {
    bn: '© ২০২৬ কলমা সোশ্যাল ক্লাব',
    en: '© 2026 Kalma Social Club',
  },
  'footer.adminLogin': { bn: 'অ্যাডমিন লগইন', en: 'Admin login' },

  // --- home: hero ---
  'hero.addressLong': {
    bn: 'কলমা ১ (আমতলা), ডেইরি ফার্ম, সাভার, ঢাকা',
    en: 'Kalma 1 (Amtola), Dairy Farm, Savar, Dhaka',
  },
  'hero.statYearValue': { bn: '২০২৪', en: '2024' },
  'hero.statYearLabel': { bn: 'প্রতিষ্ঠার বছর', en: 'Year founded' },

  // --- home: quick actions (phone only) ---
  'quick.bloodTitle': { bn: 'রক্ত লাগবে?', en: 'Need blood?' },
  'quick.bloodText': {
    bn: 'ক্লাবের সাথে যোগাযোগ',
    en: 'Contact the club',
  },
  'quick.photosTitle': { bn: 'কাজের ছবি', en: 'Our work in photos' },
  'quick.photosText': {
    bn: 'পুরো গ্যালারি দেখুন',
    en: 'See the whole gallery',
  },

  // --- home: upcoming activities ---
  'upcoming.title': { bn: 'আসন্ন কার্যক্রম', en: 'Upcoming activities' },
  'upcoming.lead': {
    bn: 'যেসব আয়োজনে আপনি অংশ নিতে পারেন',
    en: 'Events you are welcome to join',
  },
  'upcoming.none': {
    bn: 'এই মুহূর্তে কোনো আসন্ন কার্যক্রম নেই। নতুন কার্যক্রম যোগ হলে এখানে দেখা যাবে।',
    en: 'There are no upcoming activities right now. New ones will appear here.',
  },
  'upcoming.imagePlaceholder': {
    bn: 'ছবি — [কার্যক্রমের ছবি দিন]',
    en: 'Photo — [add an activity photo]',
  },

  // --- home: notice board ---
  'notice.title': { bn: 'নোটিশ বোর্ড', en: 'Notice board' },
  'notice.lead': {
    bn: 'ক্লাবের ঘোষণা, সিদ্ধান্ত ও জরুরি খবর এখানে প্রকাশ করা হয়।',
    en: "The club's announcements, decisions and urgent news are posted here.",
  },
  'notice.urgent': { bn: 'জরুরি', en: 'Urgent' },
  'notice.emptyTitle': {
    bn: 'এই মুহূর্তে কোনো নোটিশ নেই',
    en: 'No notices right now',
  },
  'notice.emptyText': {
    bn: 'নতুন ঘোষণা বা জরুরি খবর প্রকাশ হলে এখানে দেখা যাবে।',
    en: 'New announcements and urgent news will appear here when they are posted.',
  },
  'notice.emptyFacebook': {
    bn: 'সর্বশেষ খবরের জন্য আমাদের ফেসবুক পেজ দেখুন',
    en: 'See our Facebook page for the latest news',
  },

  // --- home: gallery teaser ---
  'teaser.title': { bn: 'কাজের ছবি', en: 'Our work in photos' },
  'teaser.lead': {
    bn: 'আমাদের কার্যক্রমের মুহূর্তগুলো',
    en: 'Moments from our activities',
  },
  'teaser.photoAlt': {
    bn: 'ক্লাবের কার্যক্রমের ছবি',
    en: 'A photo from a club activity',
  },
  'teaser.seeAll': { bn: 'সব ছবি দেখুন', en: 'See all photos' },
  'teaser.p1': { bn: 'রক্তদান ক্যাম্প', en: 'Blood donation camp' },
  'teaser.p2': { bn: 'ত্রাণ বিতরণ', en: 'Relief distribution' },
  'teaser.p3': { bn: 'খেলাধুলা', en: 'Sports' },
  'teaser.p4': { bn: 'সাধারণ সভা', en: 'General meeting' },
  'teaser.p5': { bn: 'শিক্ষা সহায়তা', en: 'Education support' },
  'teaser.p6': { bn: 'পরিচ্ছন্নতা অভিযান', en: 'Cleaning drive' },
  'teaser.placeholder': {
    bn: 'ছবি {n} — [{label}]',
    en: 'Photo {n} — [{label}]',
  },

  // --- home: page head ---
  'home.title': {
    bn: 'কলমা সোশ্যাল ক্লাব — সাভার, ঢাকা',
    en: 'Kalma Social Club — Savar, Dhaka',
  },
  'home.description': {
    bn: 'সাভারের কলমা এলাকার মানুষের একটি অরাজনৈতিক ও অসাম্প্রদায়িক সামাজিক প্ল্যাটফর্ম। একসাথে, সুন্দর আগামীর পথে।',
    en: 'A non-political and non-communal social platform for the people of Kalma, Savar. Together for a better tomorrow.',
  },

  // --- gallery page ---
  'gallery.title': { bn: 'গ্যালারি', en: 'Gallery' },
  'gallery.pageTitle': {
    bn: 'গ্যালারি — কলমা সোশ্যাল ক্লাব',
    en: 'Gallery — Kalma Social Club',
  },
  'gallery.description': {
    bn: 'কলমা সোশ্যাল ক্লাবের কার্যক্রমের ছবি।',
    en: 'Photos of Kalma Social Club activities.',
  },
  'gallery.lead': {
    bn: 'আমাদের কার্যক্রমের মুহূর্তগুলো। বড় করে দেখতে ছবিতে ক্লিক করুন।',
    en: 'Moments from our activities. Click a photo to see it larger.',
  },
  'gallery.openPhoto': {
    bn: 'ছবি {n} বড় করে দেখুন',
    en: 'View photo {n} larger',
  },
  'gallery.empty': {
    bn: 'এখনো কোনো ছবি যোগ হয়নি।',
    en: 'No photos have been added yet.',
  },
  'gallery.years': { bn: 'বছর অনুযায়ী ছবি', en: 'Photos by year' },
  'gallery.allYears': { bn: 'সব', en: 'All' },
  'gallery.otherPhotos': { bn: 'অন্যান্য ছবি', en: 'Other photos' },
  'gallery.emptyYear': {
    bn: 'এই বছরের কোনো ছবি এখনো যোগ হয়নি।',
    en: 'No photos from this year have been added yet.',
  },
  'gallery.showMore': { bn: 'আরো ছবি দেখুন', en: 'Show more photos' },
  'gallery.loadingMore': { bn: 'আনা হচ্ছে…', en: 'Loading…' },
  'gallery.moreError': {
    bn: 'আরো ছবি আনা গেল না। আবার চেষ্টা করুন।',
    en: 'Could not load more photos. Please try again.',
  },
  'gallery.bigPhoto': { bn: 'বড় ছবি', en: 'Large photo' },
  'gallery.close': { bn: 'বন্ধ করুন', en: 'Close' },
  'gallery.prev': { bn: 'আগের ছবি', en: 'Previous photo' },
  'gallery.next': { bn: 'পরের ছবি', en: 'Next photo' },

  // --- membership application page (/join) ---
  'apply.pageTitle': {
    bn: 'সদস্য হওয়ার আবেদন — কলমা সোশ্যাল ক্লাব',
    en: 'Apply for membership — Kalma Social Club',
  },
  'apply.description': {
    bn: 'কলমা সোশ্যাল ক্লাবের সদস্য হতে আবেদন করুন। আপনার তথ্য শুধু ক্লাবের অ্যাডমিন দেখতে পান।',
    en: 'Apply to become a member of Kalma Social Club. Only the club admins can see your details.',
  },
  'apply.title': { bn: 'সদস্য হওয়ার আবেদন', en: 'Apply for membership' },
  'apply.lead': {
    bn: 'ফর্মটি পূরণ করুন। আমাদের কমিটি যাচাই করে আপনার সাথে যোগাযোগ করবে। * চিহ্নিত ঘর পূরণ করা আবশ্যক।',
    en: 'Fill in the form. Our committee will review it and contact you. Fields marked * are required.',
  },
  'apply.name': { bn: 'নাম *', en: 'Name *' },
  'apply.phone': { bn: 'মোবাইল নম্বর *', en: 'Mobile number *' },
  'apply.blood': { bn: 'রক্তের গ্রুপ', en: 'Blood group' },
  'apply.bloodUnknown': {
    bn: 'জানি না / বলতে চাই না',
    en: "I don't know / prefer not to say",
  },
  'apply.willing': {
    bn: 'প্রয়োজনে রক্ত দিতে আগ্রহী',
    en: 'Willing to donate blood when needed',
  },
  'apply.address': { bn: 'ঠিকানা', en: 'Address' },
  'apply.area': { bn: 'এলাকা', en: 'Area' },
  'apply.occupation': { bn: 'পেশা', en: 'Occupation' },
  'apply.honeypot': {
    bn: 'ওয়েবসাইট (ফাঁকা রাখুন)',
    en: 'Website (leave empty)',
  },
  'apply.consent': {
    bn: 'আমি নিজের নাম, ফোন নম্বর, ঠিকানা ও রক্তের গ্রুপ ক্লাবের রেকর্ডে রাখার সম্মতি দিচ্ছি।',
    en: 'I consent to the club keeping my name, phone number, address and blood group in its records.',
  },
  'apply.consentNote': {
    bn: 'এই তথ্য শুধু ক্লাবের অ্যাডমিন দেখতে পান। ওয়েবসাইটে বা অন্য সদস্যদের কাছে কোথাও প্রকাশ হয় না।',
    en: 'Only the club admins can see this information. It is never shown on the website or to other members.',
  },
  'apply.submit': { bn: 'আবেদন জমা দিন', en: 'Submit application' },
  'apply.wait': { bn: 'অপেক্ষা করুন…', en: 'Please wait…' },
  'apply.errorTryLater': {
    bn: 'এখন অনেক আবেদন জমা পড়ছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।',
    en: 'Many applications are coming in right now. Please try again in a little while.',
  },
  'apply.errorChallenge': {
    bn: 'আপনি যে মানুষ তা যাচাই করা যায়নি। আবার চেষ্টা করুন।',
    en: 'We could not confirm you are a person. Please try again.',
  },
  'apply.errorInvalid': {
    bn: 'তথ্য ঠিক নেই। ফর্মটি আবার দেখে নিন।',
    en: 'Some details are not right. Please check the form again.',
  },
  'apply.errorNetwork': {
    bn: 'আবেদন জমা দেওয়া গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।',
    en: 'Could not submit the application. Check your internet connection and try again.',
  },
  'apply.doneTitle': { bn: 'আবেদন পেয়েছি', en: 'Application received' },
  'apply.doneText': {
    bn: 'ধন্যবাদ। আমাদের কমিটি যাচাই করে আপনার সাথে যোগাযোগ করবে।',
    en: 'Thank you. Our committee will review it and contact you.',
  },
  'apply.backHome': { bn: 'হোমপেজে ফিরে যান', en: 'Back to the home page' },

  // --- not found ---
  'notFound.title': { bn: 'পাতাটি পাওয়া যায়নি', en: 'Page not found' },
  'notFound.home': { bn: 'হোম পেজে ফিরে যান', en: 'Back to the home page' },
} satisfies Record<string, Entry>
