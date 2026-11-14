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
    bn: 'একসাথে, এক সুন্দর আগামীর জন্য।',
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
  'nav.upcoming': { bn: 'আসন্ন কার্যক্রম', en: 'Upcoming activities' },
  'nav.gallery': { bn: 'গ্যালারি', en: 'Gallery' },
  'nav.notice': { bn: 'নোটিশ', en: 'Notices' },
  'nav.about': { bn: 'পরিচিতি', en: 'About' },
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
  'hero.title': {
    bn: 'এলাকার মানুষের পাশে থাকা একটি অরাজনৈতিক সামাজিক সংগঠন',
    en: 'A non-political community organisation standing with the people of our area',
  },
  'hero.leadShort': {
    bn: 'রক্তদান, শিক্ষা সহায়তা, ত্রাণ ও যুব উন্নয়ন নিয়ে আমাদের কাজ।',
    en: 'Our work: blood donation, education support, relief and youth development.',
  },
  'hero.leadLong': {
    bn: 'আমরা রক্তদান, শিক্ষা সহায়তা, ত্রাণ ও যুব উন্নয়ন নিয়ে কাজ করি। তরুণ আর প্রবীণ — সবাই এখানে সমান অংশীদার।',
    en: 'We work on blood donation, education support, relief and youth development. Young and old, everyone here is an equal partner.',
  },
  'hero.ctaWork': { bn: 'আমাদের কাজ দেখুন', en: 'See our work' },
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

  // --- home: what we do ---
  'whatWeDo.title': { bn: 'আমরা কী করি', en: 'What we do' },
  'whatWeDo.lead': {
    bn: 'চারটি কাজে আমরা নিয়মিত সময় দিই। প্রতিটি কার্যক্রম এলাকার মানুষের সরাসরি প্রয়োজন থেকে এসেছে।',
    en: 'We give regular time to four kinds of work. Each one comes from a direct need of the people around us.',
  },
  'whatWeDo.bloodTitle': { bn: 'রক্তদান', en: 'Blood donation' },
  'whatWeDo.bloodText': {
    bn: 'সদস্যদের রক্তের গ্রুপ আমাদের ডেটাবেজে রাখা থাকে, যাতে জরুরি মুহূর্তে দ্রুত দাতা পাওয়া যায়।',
    en: "Members' blood groups are kept in our records, so a donor can be found quickly in an emergency.",
  },
  'whatWeDo.educationTitle': {
    bn: 'শিক্ষা সহায়তা',
    en: 'Education support',
  },
  'whatWeDo.educationText': {
    bn: 'এলাকার শিক্ষার্থীদের বইপত্র, শিক্ষা উপকরণ ও পরীক্ষার প্রস্তুতিতে সহায়তা করা।',
    en: 'Helping local students with books, learning materials and exam preparation.',
  },
  'whatWeDo.youthTitle': { bn: 'যুব উন্নয়ন', en: 'Youth development' },
  'whatWeDo.youthText': {
    bn: 'তরুণদের খেলাধুলা, দক্ষতা প্রশিক্ষণ ও নেতৃত্বের সুযোগ তৈরি করে সঠিক পথে রাখা।',
    en: 'Creating chances for young people in sport, skills training and leadership, to keep them on the right path.',
  },
  'whatWeDo.socialTitle': { bn: 'সমাজসেবা', en: 'Social service' },
  'whatWeDo.socialText': {
    bn: 'শীতবস্ত্র ও ত্রাণ বিতরণ, পরিচ্ছন্নতা অভিযান এবং অসহায় পরিবারের পাশে দাঁড়ানো।',
    en: 'Distributing winter clothes and relief, cleaning drives, and standing by families in need.',
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
  'notice.placeholderTitle': {
    bn: '[নোটিশের শিরোনাম]',
    en: '[notice title]',
  },
  'notice.placeholderBody': {
    bn: '[নোটিশের বিবরণ]',
    en: '[notice details]',
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

  // --- home: about ---
  'about.title': { bn: 'আমাদের পরিচিতি', en: 'About us' },
  'about.p1': {
    bn: '২০২৪ সালে এলাকার একদল উদ্যমী তরুণের হাত ধরে কলমা সোশ্যাল ক্লাবের পথচলা শুরু। শুরু থেকেই আমরা ক্লাবটিকে কেবল নির্দিষ্ট কিছু মানুষের মিলনকেন্দ্র হিসেবে রাখিনি।',
    en: 'Kalma Social Club began in 2024, led by a group of energetic young people from the area. From the start we did not want the club to be a meeting place for only a few.',
  },
  'about.p2': {
    bn: 'প্রবীণদের অভিজ্ঞতা আর যুবসমাজের প্রাণশক্তি — দুটোকে একসাথে কাজে লাগিয়ে আমরা এমন এক সমাজ গড়তে চাই, যেখানে প্রতিটি মানুষ একে অপরের পরিপূরক।',
    en: 'By bringing together the experience of elders and the energy of the young, we want to build a society where everyone complements one another.',
  },
  'about.p3': {
    bn: 'ক্লাবের প্রতিটি সদস্য কেবল সদস্য নন — তাঁরা প্রত্যেকে পরিবর্তনের একজন সক্রিয় কারিগর।',
    en: 'Every member of the club is more than a member: each one is an active maker of change.',
  },
  'about.v1Title': { bn: 'অরাজনৈতিক', en: 'Non-political' },
  'about.v1Text': {
    bn: 'ক্লাব কোনো রাজনৈতিক দলের সাথে যুক্ত নয়।',
    en: 'The club is not tied to any political party.',
  },
  'about.v2Title': { bn: 'অসাম্প্রদায়িক', en: 'Non-communal' },
  'about.v2Text': {
    bn: 'ধর্ম-বর্ণ নির্বিশেষে সবার জন্য উন্মুক্ত।',
    en: 'Open to everyone, whatever their religion or background.',
  },
  'about.v3Title': { bn: 'সমান অংশীদারিত্ব', en: 'Equal partnership' },
  'about.v3Text': {
    bn: 'নবীন-প্রবীণ সব সদস্যের মত সমান গুরুত্ব পায়।',
    en: 'The views of young and old members count equally.',
  },
  'about.v4Title': { bn: 'জ্ঞানভিত্তিক', en: 'Knowledge-driven' },
  'about.v4Text': {
    bn: 'ঐতিহ্য রক্ষা করে শিক্ষা ও সচেতনতার পথে এগোনো।',
    en: 'Moving forward through education and awareness, while keeping our heritage.',
  },

  // --- home: join section ---
  'joinSection.title': { bn: 'সদস্য হতে চান?', en: 'Want to become a member?' },
  'joinSection.lead': {
    bn: 'আমাদের কমিটি যাচাই করে আপনার সাথে যোগাযোগ করবে। সদস্যদের তথ্য শুধু ক্লাবের কাজে ব্যবহৃত হয় এবং ওয়েবসাইটে প্রকাশ করা হয় না।',
    en: "Our committee will review your application and contact you. Members' details are used only for the club's work and are never published on the website.",
  },
  'joinSection.apply': { bn: 'আবেদন করুন', en: 'Apply now' },
  'joinSection.orEmail': {
    bn: 'অথবা ইমেইলে যোগাযোগ করুন:',
    en: 'Or contact us by email:',
  },

  // --- home: page head ---
  'home.title': {
    bn: 'কলমা সোশ্যাল ক্লাব — সাভার, ঢাকা',
    en: 'Kalma Social Club — Savar, Dhaka',
  },
  'home.description': {
    bn: 'এলাকার মানুষের পাশে থাকা একটি অরাজনৈতিক সামাজিক সংগঠন। রক্তদান, শিক্ষা সহায়তা, ত্রাণ ও যুব উন্নয়ন।',
    en: 'A non-political community organisation standing with the people of our area. Blood donation, education support, relief and youth development.',
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
