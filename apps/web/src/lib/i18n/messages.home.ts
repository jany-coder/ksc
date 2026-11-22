import type { Entry } from './core.ts'

// The club's own long texts for the home page: what we work on, about us,
// activities, future mission, contact and membership. The Bengali is the
// club's wording, word for word. The English is a first draft for the club to
// read and approve.
export const homeMessages = {
  // --- hero ---
  'hero.title': { bn: 'কলমা সোশ্যাল ক্লাব', en: 'Kalma Social Club' },
  'hero.tagline': {
    bn: 'একসাথে, সুন্দর আগামীর পথে',
    en: 'Together for a better tomorrow',
  },
  'hero.leadShort': {
    bn: 'একটি সচেতন, মানবিক ও আত্মনির্ভর সমাজ গড়ার সম্মিলিত উদ্যোগ।',
    en: 'A joint effort to build an aware, humane and self-reliant society.',
  },
  'hero.body1': {
    bn: 'কলমা সোশ্যাল ক্লাব সাভারের কলমা এলাকার মানুষের একটি অরাজনৈতিক ও অসাম্প্রদায়িক সামাজিক প্ল্যাটফর্ম। সম্প্রীতি, শিক্ষা, স্বাস্থ্য, যুব উন্নয়ন ও মানবিক সহায়তার মাধ্যমে আমরা একটি ইতিবাচক, সচেতন ও ঐক্যবদ্ধ সমাজ গড়তে কাজ করছি।',
    en: 'Kalma Social Club is a non-political and non-communal social platform for the people of Kalma in Savar. Through harmony, education, health, youth development and humanitarian support, we are working to build a positive, aware and united society.',
  },
  'hero.body2': {
    bn: 'আমাদের বিশ্বাস, সামাজিক পরিবর্তন শুধু ব্যক্তিগত উদ্যোগে নয়; সম্মিলিত চিন্তা, দায়িত্বশীল অংশগ্রহণ ও ধারাবাহিক কার্যক্রমের মাধ্যমেই সম্ভব।',
    en: 'We believe social change comes not from individual effort alone, but through shared thinking, responsible participation and steady, continuing work.',
  },
  'hero.frameLabel': {
    bn: 'ক্লাবের কার্যক্রমের ছবি',
    en: 'Photos of the club at work',
  },
  'hero.photoAlt': {
    bn: 'কলমা সোশ্যাল ক্লাবের একটি কার্যক্রম',
    en: "One of Kalma Social Club's activities",
  },
  'hero.workMore': { bn: 'বিস্তারিত দেখুন', en: 'See more' },
  'hero.pause': { bn: 'ছবি বদলানো থামান', en: 'Pause the photos' },
  'hero.play': { bn: 'ছবি বদলানো চালু করুন', en: 'Play the photos' },
  'hero.ctaWork': { bn: 'আমাদের কার্যক্রম দেখুন', en: 'See our activities' },

  // --- under the hero: the next activity ---
  'next.label': { bn: 'পরবর্তী কার্যক্রম', en: 'Next activity' },
  'next.today': { bn: 'আজ', en: 'Today' },
  'next.tomorrow': { bn: 'আগামীকাল', en: 'Tomorrow' },
  'next.daysLeft': { bn: 'আর {n} দিন', en: 'In {n} days' },

  // --- the ribbon of key words under the hero ---
  'marquee.label': { bn: 'ক্লাবের মূল কথা', en: 'The club in a few words' },
  'marquee.pause': { bn: 'চলমান লেখা থামান', en: 'Pause the moving text' },
  'marquee.play': { bn: 'চলমান লেখা চালু করুন', en: 'Play the moving text' },

  // --- what we work on ---
  'whatWeDo.title': { bn: 'আমরা যা নিয়ে কাজ করি', en: 'What we work on' },
  'whatWeDo.harmonyTitle': {
    bn: 'সামাজিক সম্প্রীতি ও ঐক্য',
    en: 'Social harmony and unity',
  },
  'whatWeDo.harmonyText': {
    bn: 'পারস্পরিক শ্রদ্ধা, আস্থা ও সহযোগিতার ভিত্তিতে এলাকার মানুষের মধ্যে সুসম্পর্ক ও সামাজিক বন্ধন শক্তিশালী করা।',
    en: 'Strengthening good relations and social bonds among the people of the area, built on mutual respect, trust and cooperation.',
  },
  'whatWeDo.youthTitle': {
    bn: 'যুব উন্নয়ন ও সচেতনতা',
    en: 'Youth development and awareness',
  },
  'whatWeDo.youthText': {
    bn: 'যুবসমাজকে মাদক, অপরাধ ও নেতিবাচক কর্মকাণ্ড থেকে দূরে রেখে দক্ষ, দায়িত্বশীল ও ইতিবাচক নেতৃত্ব হিসেবে গড়ে তোলা।',
    en: 'Keeping young people away from drugs, crime and negative activities, and growing them into skilled, responsible and positive leaders.',
  },
  'whatWeDo.skillsTitle': {
    bn: 'দক্ষতা উন্নয়ন ও কর্মসংস্থান',
    en: 'Skills development and employment',
  },
  'whatWeDo.skillsText': {
    bn: 'প্রশিক্ষণ, কারিগরি শিক্ষা ও আত্মকর্মসংস্থানের সুযোগ সম্পর্কে তথ্য ও দিকনির্দেশনা পৌঁছে দেওয়া।',
    en: 'Passing on information and guidance about training, technical education and self-employment opportunities.',
  },
  'whatWeDo.educationTitle': {
    bn: 'শিক্ষা ও স্বাস্থ্যসেবা',
    en: 'Education and healthcare',
  },
  'whatWeDo.educationText': {
    bn: 'মেধাবী ও অসচ্ছল শিক্ষার্থীদের সহায়তা, শিক্ষামূলক কার্যক্রম এবং বিনামূল্যে স্বাস্থ্যসেবা উদ্যোগ পরিচালনা।',
    en: 'Supporting talented students in need, running educational activities, and organising free healthcare initiatives.',
  },
  'whatWeDo.environmentTitle': {
    bn: 'পরিবেশ ও জনসচেতনতা',
    en: 'Environment and public awareness',
  },
  'whatWeDo.environmentText': {
    bn: 'বৃক্ষরোপণ, পরিচ্ছন্নতা, পরিবেশ সংরক্ষণ এবং জনস্বাস্থ্য বিষয়ে সচেতনতা তৈরি।',
    en: 'Tree planting, cleanliness, protecting the environment, and raising awareness about public health.',
  },
  'whatWeDo.bloodTitle': {
    bn: 'মানবিক সহায়তা ও রক্তদান',
    en: 'Humanitarian help and blood donation',
  },
  'whatWeDo.bloodText': {
    bn: 'জরুরি প্রয়োজনে মানুষের পাশে দাঁড়ানো, রক্তদাতা খুঁজে দেওয়া এবং সামর্থ্য অনুযায়ী মানবিক সহায়তা প্রদান।',
    en: 'Standing by people in an emergency, finding blood donors, and giving humanitarian help as far as we are able.',
  },
  'philosophy.title': { bn: 'আমাদের দর্শন', en: 'Our philosophy' },
  'philosophy.p1': {
    bn: 'আমরা মনে করি, একটি এলাকার প্রকৃত উন্নয়ন শুধু অবকাঠামো বা অর্থনৈতিক অগ্রগতির মধ্যে সীমাবদ্ধ নয়। শিক্ষিত মানুষ, দক্ষ যুবসমাজ, নিরাপদ পরিবেশ, সামাজিক সম্প্রীতি এবং পারস্পরিক সহযোগিতাই একটি উন্নত সমাজের ভিত্তি।',
    en: 'We believe real development of an area is not limited to infrastructure or economic progress. Educated people, a skilled youth, a safe environment, social harmony and mutual cooperation are the foundation of a better society.',
  },
  'philosophy.p2': {
    bn: 'আমাদের লক্ষ্য—কলমার মানুষের সম্মিলিত শক্তিকে ইতিবাচক সামাজিক পরিবর্তনে রূপ দেওয়া।',
    en: 'Our aim is to turn the combined strength of the people of Kalma into positive social change.',
  },

  // --- about us ---
  'about.title': { bn: 'আমাদের সম্পর্কে', en: 'About us' },
  'about.tagline': {
    bn: 'একসাথে, সুন্দর আগামীর পথে',
    en: 'Together for a better tomorrow',
  },
  'about.p1': {
    bn: 'কলমা সোশ্যাল ক্লাব সাভারের কলমা এলাকার মানুষের সম্মিলিত উদ্যোগে গড়ে ওঠা একটি অরাজনৈতিক ও অসাম্প্রদায়িক সামাজিক প্ল্যাটফর্ম।',
    en: 'Kalma Social Club is a non-political and non-communal social platform, built by the joint effort of the people of Kalma in Savar.',
  },
  'about.p2': {
    bn: 'আমাদের মূল দর্শন হলো—একটি সুন্দর সমাজ গড়তে প্রত্যেক মানুষের অংশগ্রহণ, পারস্পরিক শ্রদ্ধা এবং সামাজিক দায়বদ্ধতা গুরুত্বপূর্ণ।',
    en: 'Our core belief is that building a good society needs everyone’s participation, mutual respect and social responsibility.',
  },
  'about.p3': {
    bn: 'আমরা এমন একটি সামাজিক পরিবেশ গড়ে তুলতে চাই, যেখানে বয়স, পেশা, আর্থিক অবস্থা কিংবা ব্যক্তিগত রাজনৈতিক বিশ্বাসের পার্থক্য সত্ত্বেও মানুষ পারস্পরিক সম্মান ও সহযোগিতার ভিত্তিতে একসঙ্গে কাজ করতে পারবেন।',
    en: 'We want to create a social environment where people can work together on the basis of mutual respect and cooperation, whatever their age, profession, financial situation or personal political beliefs.',
  },
  'about.p4': {
    bn: 'আমাদের কার্যক্রমের পরিধি শুধু তাৎক্ষণিক মানবিক সহায়তায় সীমাবদ্ধ নয়। আমরা শিক্ষা, যুব উন্নয়ন, দক্ষতা বৃদ্ধি, স্বাস্থ্যসেবা, পরিবেশ সংরক্ষণ এবং সামাজিক সচেতনতার মতো দীর্ঘমেয়াদি বিষয়েও কাজ করতে আগ্রহী।',
    en: 'Our work is not limited to immediate humanitarian help. We also want to work on long-term matters such as education, youth development, skills, healthcare, protecting the environment and social awareness.',
  },
  'about.goalsTitle': {
    bn: 'আমাদের লক্ষ্য ও উদ্দেশ্য',
    en: 'Our aims and objectives',
  },
  'about.goal1': {
    bn: 'এলাকার মানুষের মধ্যে সামাজিক ঐক্য, সম্প্রীতি ও পারস্পরিক সহযোগিতা বৃদ্ধি।',
    en: 'Increase social unity, harmony and mutual cooperation among the people of the area.',
  },
  'about.goal2': {
    bn: 'যুবসমাজকে মাদক, অপরাধ ও নেতিবাচক সামাজিক কর্মকাণ্ড থেকে দূরে রাখতে সচেতনতামূলক উদ্যোগ গ্রহণ।',
    en: 'Take awareness initiatives to keep young people away from drugs, crime and negative social activities.',
  },
  'about.goal3': {
    bn: 'কর্মমুখী প্রশিক্ষণ, কারিগরি দক্ষতা ও আত্মকর্মসংস্থানের সুযোগ তৈরিতে সহযোগিতা।',
    en: 'Help create job-oriented training, technical skills and self-employment opportunities.',
  },
  'about.goal4': {
    bn: 'মেধাবী ও আর্থিকভাবে অসচ্ছল শিক্ষার্থীদের পাশে দাঁড়ানো।',
    en: 'Stand by talented students who are in financial need.',
  },
  'about.goal5': {
    bn: 'স্বাস্থ্যসেবা, রক্তদান ও জরুরি মানবিক সহায়তা কার্যক্রম পরিচালনা।',
    en: 'Run healthcare, blood donation and emergency humanitarian support activities.',
  },
  'about.goal6': {
    bn: 'পরিবেশ সংরক্ষণ, বৃক্ষরোপণ ও পরিচ্ছন্নতা কার্যক্রম বাস্তবায়ন।',
    en: 'Carry out environmental protection, tree planting and cleanliness activities.',
  },
  'about.goal7': {
    bn: 'সাংস্কৃতিক, ক্রীড়া ও শিক্ষামূলক কার্যক্রমের মাধ্যমে সামাজিক বন্ধন শক্তিশালী করা।',
    en: 'Strengthen social bonds through cultural, sports and educational activities.',
  },
  'about.goal8': {
    bn: 'সরকারি, বেসরকারি ও উন্নয়নমূলক প্রতিষ্ঠানের সঙ্গে যোগাযোগ ও অংশীদারত্ব গড়ে তোলা।',
    en: 'Build contact and partnerships with government, private and development organisations.',
  },
  'about.principlesTitle': {
    bn: 'আমাদের সাংগঠনিক নীতিমালা',
    en: 'Our organisational principles',
  },
  'about.pr1Title': {
    bn: 'অরাজনৈতিক ও অসাম্প্রদায়িক অবস্থান',
    en: 'Non-political and non-communal stance',
  },
  'about.pr1Text': {
    bn: 'কলমা সোশ্যাল ক্লাব কোনো রাজনৈতিক দল, মতাদর্শ বা ব্যক্তির পক্ষে কিংবা বিপক্ষে সাংগঠনিক অবস্থান গ্রহণ করে না। সদস্যদের ব্যক্তিগত রাজনৈতিক ও ধর্মীয় বিশ্বাসের স্বাধীনতা রয়েছে। তবে ক্লাবের কার্যক্রম, সভা ও সিদ্ধান্তে ব্যক্তিগত রাজনৈতিক বা সাম্প্রদায়িক প্রভাব বিস্তারের সুযোগ নেই। ক্লাবের নাম ব্যবহার করে রাজনৈতিক প্রচারণা বা অর্থ সংগ্রহ করা যাবে না।',
    en: 'Kalma Social Club takes no organisational position for or against any political party, ideology or person. Members are free to hold their own political and religious beliefs. But there is no room for personal political or communal influence in the club’s activities, meetings and decisions. The club’s name may not be used for political campaigning or to raise money.',
  },
  'about.pr2Title': { bn: 'অন্তর্ভুক্তিমূলক সদস্যপদ', en: 'Inclusive membership' },
  'about.pr2Text': {
    bn: '১৮ বছর বা তার বেশি বয়সী যেকোনো আগ্রহী ব্যক্তি ক্লাবের উদ্দেশ্য ও নীতিমালার প্রতি শ্রদ্ধাশীল থেকে সদস্যপদের জন্য আবেদন করতে পারবেন। সদস্য নির্বাচনে আচরণ, সামাজিক দায়বদ্ধতা ও সংগঠনের নীতিমালা অনুসরণের বিষয়গুলো বিবেচনা করা হবে।',
    en: 'Any interested person aged 18 or over, who respects the club’s aims and principles, can apply for membership. Members are chosen by looking at their conduct, social responsibility and willingness to follow the club’s principles.',
  },
  'about.pr3Title': { bn: 'গণতান্ত্রিক পরিচালনা', en: 'Democratic governance' },
  'about.pr3Text': {
    bn: 'সাধারণ সভা ক্লাবের সর্বোচ্চ সিদ্ধান্ত গ্রহণকারী কর্তৃপক্ষ। ১১ সদস্যবিশিষ্ট কার্যনির্বাহী কমিটি সাংগঠনিক কার্যক্রম পরিচালনা করবে। নির্ধারিত মেয়াদ শেষে গোপন ব্যালটের মাধ্যমে কমিটি নির্বাচন অনুষ্ঠিত হবে।',
    en: 'The general meeting is the club’s highest decision-making authority. An executive committee of 11 members runs the club’s work. When its term ends, the committee is elected by secret ballot.',
  },
  'about.pr4Title': {
    bn: 'আর্থিক স্বচ্ছতা ও জবাবদিহি',
    en: 'Financial transparency and accountability',
  },
  'about.pr4Text': {
    bn: 'ক্লাবের আর্থিক কার্যক্রম সদস্যপদ ফি, স্বেচ্ছামূলক অনুদান এবং অনুমোদিত প্রকল্পের মাধ্যমে পরিচালিত হবে। আয়-ব্যয়ের হিসাব সংরক্ষণ, অনুদানের রসিদ প্রদান এবং নিয়মিত আর্থিক প্রতিবেদন উপস্থাপনের মাধ্যমে স্বচ্ছতা নিশ্চিত করা হবে।',
    en: 'The club’s finances run on membership fees, voluntary donations and approved projects. Transparency is ensured by keeping records of income and spending, giving receipts for donations, and presenting regular financial reports.',
  },
  'about.pr5Title': {
    bn: 'দায়িত্বশীল ও পরিবেশবান্ধব কার্যক্রম',
    en: 'Responsible and eco-friendly work',
  },
  'about.pr5Text': {
    bn: 'প্রতিটি উদ্যোগে সামাজিক প্রভাব, পরিবেশগত দায়বদ্ধতা এবং দীর্ঘমেয়াদি কার্যকারিতাকে গুরুত্ব দেওয়া হবে। সাংগঠনিক কার্যক্রমকে আরও সহজ, স্বচ্ছ ও গতিশীল করতে ডিজিটাল ব্যবস্থাপনা উৎসাহিত করা হবে।',
    en: 'Every initiative will give weight to its social impact, environmental responsibility and long-term effectiveness. Digital management will be encouraged to make the club’s work simpler, more transparent and more dynamic.',
  },
  'about.commitTitle': { bn: 'আমাদের অঙ্গীকার', en: 'Our commitment' },
  'about.commit1': {
    bn: 'আমরা বিশ্বাস করি, একটি সংগঠনের প্রকৃত শক্তি তার সদস্যসংখ্যায় নয়; বরং সদস্যদের সততা, দায়িত্ববোধ, পারস্পরিক আস্থা এবং মানুষের জন্য কাজ করার মানসিকতায়।',
    en: 'We believe the real strength of an organisation lies not in the number of its members, but in their honesty, sense of responsibility, mutual trust and willingness to work for people.',
  },
  'about.commit2': {
    bn: 'কলমা সোশ্যাল ক্লাব সেই সম্মিলিত শক্তিকে কাজে লাগিয়ে একটি সুন্দর ও সম্ভাবনাময় ভবিষ্যৎ গড়তে প্রতিশ্রুতিবদ্ধ।',
    en: 'Kalma Social Club is committed to using that shared strength to build a beautiful and promising future.',
  },
  'about.slogan': {
    bn: 'আমাদের স্লোগান: একসাথে, সুন্দর আগামীর পথে।',
    en: 'Our slogan: Together for a better tomorrow.',
  },

  // --- our activities ---
  'activities.title': { bn: 'আমাদের কার্যক্রম', en: 'Our activities' },
  'activities.subtitle': {
    bn: 'উদ্যোগ, অংশগ্রহণ ও মানবিকতার গল্প',
    en: 'Stories of initiative, participation and humanity',
  },
  'activities.p1': {
    bn: 'কলমা সোশ্যাল ক্লাবের কার্যক্রমের মূল ভিত্তি হলো মানুষের সঙ্গে মানুষের সংযোগ তৈরি করা এবং এলাকার প্রয়োজন অনুযায়ী বাস্তবসম্মত সামাজিক উদ্যোগ গ্রহণ করা।',
    en: 'The foundation of Kalma Social Club’s work is connecting people with people, and taking practical social initiatives that fit the needs of the area.',
  },
  'activities.p2': {
    bn: 'আমরা বিশ্বাস করি, ছোট ছোট উদ্যোগের ধারাবাহিকতাই একসময় বড় সামাজিক পরিবর্তনের ভিত্তি তৈরি করে।',
    en: 'We believe that small initiatives, kept up steadily, eventually lay the foundation for big social change.',
  },
  'activities.seeAll': { bn: 'সব কার্যক্রম দেখুন', en: 'See all activities' },
  'activities.details': { bn: 'বিস্তারিত দেখুন', en: 'See details' },
  'activities.empty': {
    bn: 'এখনো কোনো কার্যক্রম যোগ হয়নি। নতুন কার্যক্রম যোগ হলে এখানে দেখা যাবে।',
    en: 'No activities have been added yet. New ones will appear here.',
  },

  // --- activities archive page (/activities) ---
  'archive.pageTitle': {
    bn: 'কার্যক্রমের আর্কাইভ — কলমা সোশ্যাল ক্লাব',
    en: 'Activity archive — Kalma Social Club',
  },
  'archive.description': {
    bn: 'কলমা সোশ্যাল ক্লাবের সব কার্যক্রম, নতুন থেকে পুরনো।',
    en: 'Every Kalma Social Club activity, newest first.',
  },
  'archive.title': { bn: 'কার্যক্রমের আর্কাইভ', en: 'Activity archive' },
  'archive.lead': {
    bn: 'আমাদের সব কার্যক্রম, নতুন থেকে পুরনো ক্রমে।',
    en: 'All our activities, from newest to oldest.',
  },
  'archive.year': { bn: '{year} সাল', en: '{year}' },
  'archive.noDate': { bn: 'তারিখ ছাড়া', en: 'Undated' },
  'archive.backHome': { bn: 'হোমপেজে ফিরে যান', en: 'Back to the home page' },

  'humanitarian.title': {
    bn: 'মানবিক সহায়তা ও জরুরি উদ্যোগ',
    en: 'Humanitarian help and emergency initiatives',
  },
  'humanitarian.lead': {
    bn: 'মানুষের বিপদে পাশে দাঁড়ানো আমাদের সামাজিক দায়বদ্ধতার অন্যতম গুরুত্বপূর্ণ অংশ। জরুরি পরিস্থিতিতে সদস্যদের সম্মিলিত প্রচেষ্টায় সহায়তা পৌঁছে দেওয়ার চেষ্টা করি।',
    en: 'Standing by people in trouble is one of the most important parts of our social responsibility. In emergencies we try to bring help through the combined effort of our members.',
  },
  'humanitarian.bloodTitle': {
    bn: 'রক্তদান ও জরুরি সহায়তা',
    en: 'Blood donation and emergency help',
  },
  'humanitarian.bloodText': {
    bn: 'এলাকায় কারও রক্তের প্রয়োজন হলে ক্লাবের সদস্যরা রক্তদাতা খুঁজে দেওয়া এবং প্রয়োজনে নিজেরা রক্তদানের মাধ্যমে সহযোগিতা করেন। মানবিক এই কার্যক্রমকে আরও সংগঠিত ও কার্যকর করার প্রচেষ্টা অব্যাহত রয়েছে।',
    en: 'When someone in the area needs blood, club members help by finding donors and, if needed, by donating blood themselves. We keep working to make this humane work better organised and more effective.',
  },
  'humanitarian.beliefTitle': { bn: 'আমাদের বিশ্বাস', en: 'What we believe' },
  'humanitarian.belief1': {
    bn: 'মানবিকতা কোনো বড় আয়োজনের বিষয় নয়। কখনো একটি শিশুকে পরিবারের কাছে ফিরিয়ে দেওয়া, কখনো একজন অসুস্থ মানুষের জন্য রক্তের ব্যবস্থা করা, আবার কখনো একজন শিক্ষার্থীর পাশে দাঁড়ানোই হতে পারে সবচেয়ে গুরুত্বপূর্ণ সামাজিক কাজ।',
    en: 'Humanity is not about big events. Sometimes returning a child to their family, sometimes arranging blood for a sick person, and sometimes standing by a student can be the most important social work.',
  },
  'humanitarian.belief2': {
    bn: 'আমরা বিশ্বাস করি, মানুষের জন্য মানুষের এগিয়ে আসাই একটি সুন্দর সমাজের প্রকৃত পরিচয়।',
    en: 'We believe people coming forward for people is the true mark of a good society.',
  },

  // --- future initiatives ---
  'future.title': { bn: 'আমাদের আগামী মিশন', en: 'Our future mission' },
  'future.subtitle': {
    bn: 'পরিকল্পনা থেকে বাস্তবায়নের পথে',
    en: 'From planning to doing',
  },
  'future.p1': {
    bn: 'আমরা শুধু বর্তমান কার্যক্রম পরিচালনা করেই থেমে থাকতে চাই না। কলমার সামাজিক, শিক্ষাগত ও অর্থনৈতিক সম্ভাবনাকে কাজে লাগিয়ে দীর্ঘমেয়াদি উন্নয়নের একটি কার্যকর ভিত্তি তৈরি করতে চাই।',
    en: 'We do not want to stop at running our present activities. We want to use the social, educational and economic potential of Kalma to build an effective foundation for long-term development.',
  },
  'future.p2': {
    bn: 'আমাদের ভবিষ্যৎ পরিকল্পনার কেন্দ্রে রয়েছে যুব উন্নয়ন, দক্ষতা বৃদ্ধি, শিক্ষা, কর্মসংস্থান, পরিবেশ সংরক্ষণ এবং আধুনিক সাংগঠনিক ব্যবস্থাপনা।',
    en: 'At the centre of our future plans are youth development, skills, education, employment, protecting the environment and modern organisational management.',
  },
  'future.i1Title': {
    bn: 'প্রাতিষ্ঠানিক সংযোগ ও অংশীদারত্ব',
    en: 'Institutional links and partnerships',
  },
  'future.i1Text1': {
    bn: 'সরকারি ও বেসরকারি প্রতিষ্ঠানের সঙ্গে কার্যকর যোগাযোগ এবং সহযোগিতামূলক সম্পর্ক গড়ে তোলার পরিকল্পনা রয়েছে।',
    en: 'We plan to build effective contact and cooperative relations with government and private organisations.',
  },
  'future.i1Text2': {
    bn: 'বিশেষভাবে সাভারের বাংলাদেশ প্রাণিসম্পদ গবেষণা ইনস্টিটিউট (বিএলআরআই) এবং যুব উন্নয়ন অধিদপ্তরের সংশ্লিষ্ট প্রশিক্ষণ কেন্দ্রগুলোর সঙ্গে যোগাযোগ স্থাপনের মাধ্যমে এলাকার যুবসমাজের কাছে প্রশিক্ষণ, প্রযুক্তিগত জ্ঞান ও সরকারি সেবার সুযোগ পৌঁছে দিতে চাই।',
    en: 'In particular, by getting in touch with the Bangladesh Livestock Research Institute (BLRI) in Savar and the relevant training centres of the Department of Youth Development, we want to bring training, technical knowledge and government services to the young people of the area.',
  },
  'future.i2Title': {
    bn: 'যুব উন্নয়ন ও দক্ষতা বৃদ্ধি',
    en: 'Youth development and skills',
  },
  'future.i2Subtitle': {
    bn: 'স্বাবলম্বী সাভার: আধুনিক কৃষি, খামার ও যুব উন্নয়ন',
    en: 'A self-reliant Savar: modern agriculture, farming and youth development',
  },
  'future.i2Text': {
    bn: 'যুবসমাজকে বাস্তবমুখী দক্ষতা ও আত্মকর্মসংস্থানের সঙ্গে যুক্ত করতে সেমিনার, প্রশিক্ষণ ও কর্মশালা আয়োজনের পরিকল্পনা রয়েছে।',
    en: 'We plan to hold seminars, training and workshops to connect young people with practical skills and self-employment.',
  },
  'future.i2ListTitle': {
    bn: 'সম্ভাব্য প্রশিক্ষণ ও আলোচনার বিষয়:',
    en: 'Possible topics for training and discussion:',
  },
  'future.i2Topic1': {
    bn: 'আধুনিক পোল্ট্রি পালন ও উন্নত জাতের মুরগি ব্যবস্থাপনা।',
    en: 'Modern poultry rearing and managing improved breeds of chicken.',
  },
  'future.i2Topic2': {
    bn: 'টেকসই কৃষি ও আধুনিক খামার ব্যবস্থাপনা।',
    en: 'Sustainable agriculture and modern farm management.',
  },
  'future.i2Topic3': {
    bn: 'বাণিজ্যিক ও ক্ষুদ্র পরিসরে মাশরুম চাষ।',
    en: 'Mushroom farming, commercial and small-scale.',
  },
  'future.i2Topic4': {
    bn: 'মাছ, হাঁস-মুরগি ও সমন্বিত কৃষিভিত্তিক উদ্যোগ।',
    en: 'Fish, poultry and integrated agriculture-based ventures.',
  },
  'future.i2Topic5': {
    bn: 'সরকারি প্রশিক্ষণ, ঋণ ও আত্মকর্মসংস্থান সুবিধা সম্পর্কে দিকনির্দেশনা।',
    en: 'Guidance on government training, loans and self-employment support.',
  },
  'future.i2Aim': {
    bn: 'আমাদের লক্ষ্য শুধু প্রশিক্ষণ দেওয়া নয়; প্রশিক্ষণের মাধ্যমে বাস্তব কর্মসংস্থান ও আয়ের সুযোগ তৈরিতে সহায়তা করা।',
    en: 'Our aim is not just to give training, but to help create real jobs and chances to earn through that training.',
  },
  'future.i3Title': {
    bn: 'শিক্ষা সহায়তা ও শিক্ষাবৃত্তি',
    en: 'Education support and scholarships',
  },
  'future.i3Text': {
    bn: 'মেধাবী ও আর্থিকভাবে অসচ্ছল শিক্ষার্থীদের পাশে দাঁড়ানোর উদ্যোগকে একটি ধারাবাহিক সামাজিক কর্মসূচিতে রূপ দিতে চাই।',
    en: 'We want to turn our effort to stand by talented students in financial need into a steady social programme.',
  },
  'future.i3ListTitle': {
    bn: 'পরিকল্পনার মধ্যে রয়েছে:',
    en: 'The plans include:',
  },
  'future.i3Item1': {
    bn: 'শিক্ষাবৃত্তি ও শিক্ষা উপকরণ সহায়তা।',
    en: 'Scholarships and help with learning materials.',
  },
  'future.i3Item2': {
    bn: 'শিক্ষার্থীদের ক্যারিয়ার ও উচ্চশিক্ষা বিষয়ক পরামর্শ।',
    en: 'Career and higher-education advice for students.',
  },
  'future.i3Item3': {
    bn: 'পরীক্ষার্থীদের জন্য দিকনির্দেশনামূলক কর্মসূচি।',
    en: 'Guidance programmes for examinees.',
  },
  'future.i3Item4': {
    bn: 'শিক্ষার্থী ও অভিভাবকদের সঙ্গে মতবিনিময়।',
    en: 'Exchange of views with students and guardians.',
  },
  'future.i4Title': {
    bn: 'পরিবেশ সংরক্ষণ ও সবুজ কলমা',
    en: 'Protecting the environment: a green Kalma',
  },
  'future.i4Text1': {
    bn: 'একটি পরিচ্ছন্ন, সবুজ ও স্বাস্থ্যকর পরিবেশ গড়তে এলাকাভিত্তিক বৃক্ষরোপণ ও পরিবেশ সচেতনতামূলক কার্যক্রম পরিচালনা করতে চাই।',
    en: 'To build a clean, green and healthy environment, we want to run area-based tree planting and environmental awareness activities.',
  },
  'future.i4Text2': {
    bn: 'ফলজ, বনজ ও ঔষধি গাছের চারা বিতরণ, বৃক্ষরোপণ এবং পরিচর্যার মাধ্যমে দীর্ঘমেয়াদি পরিবেশগত ইতিবাচক পরিবর্তন আনার পরিকল্পনা রয়েছে।',
    en: 'We plan to bring lasting positive change to the environment by giving out fruit, timber and medicinal saplings, planting them, and caring for them.',
  },
  'future.i5Title': {
    bn: 'আধুনিক ও ডিজিটাল ক্লাব ব্যবস্থাপনা',
    en: 'Modern and digital club management',
  },
  'future.i5Text': {
    bn: 'সাংগঠনিক স্বচ্ছতা, তথ্য সংরক্ষণ ও কার্যক্রমের কার্যকারিতা বাড়াতে আধুনিক ডিজিটাল ব্যবস্থাপনা চালুর পরিকল্পনা রয়েছে।',
    en: 'To improve transparency, record keeping and the effectiveness of our work, we plan to introduce modern digital management.',
  },
  'future.i5ListTitle': { bn: 'এর আওতায় থাকবে:', en: 'This will cover:' },
  'future.i5Item1': {
    bn: 'ডিজিটাল সদস্য তথ্যভান্ডার।',
    en: 'A digital member database.',
  },
  'future.i5Item2': {
    bn: 'অনলাইন সদস্যপদ ও যোগাযোগ ব্যবস্থা।',
    en: 'Online membership and communication.',
  },
  'future.i5Item3': {
    bn: 'কার্যক্রম ও প্রকল্পের তথ্য সংরক্ষণ।',
    en: 'Keeping records of activities and projects.',
  },
  'future.i5Item4': {
    bn: 'আর্থিক হিসাব ও প্রতিবেদন ব্যবস্থাপনা।',
    en: 'Managing financial accounts and reports.',
  },
  'future.i5Item5': {
    bn: 'ওয়েবসাইট ও সামাজিক যোগাযোগমাধ্যমে কার্যক্রমের তথ্য প্রকাশ।',
    en: 'Publishing information about our activities on the website and social media.',
  },
  'future.dreamTitle': {
    bn: 'আমাদের দীর্ঘমেয়াদি স্বপ্ন',
    en: 'Our long-term dream',
  },
  'future.dreamSubtitle': {
    bn: 'একটি মডেল সামাজিক অঞ্চল হিসেবে কলমা',
    en: 'Kalma as a model social community',
  },
  'future.dream1': {
    bn: 'আমরা এমন একটি কলমার স্বপ্ন দেখি, যেখানে যুবসমাজ হবে দক্ষ ও কর্মমুখী, শিক্ষার্থীরা পাবে উপযুক্ত সুযোগ, মানুষ পাবে প্রয়োজনীয় স্বাস্থ্যসেবা, পরিবেশ হবে পরিচ্ছন্ন এবং সামাজিক সম্পর্ক হবে পারস্পরিক শ্রদ্ধা ও সহযোগিতার ভিত্তিতে গড়ে ওঠা।',
    en: 'We dream of a Kalma where the youth are skilled and work-oriented, students get fitting opportunities, people get the healthcare they need, the environment is clean, and social relations are built on mutual respect and cooperation.',
  },
  'future.dream2': {
    bn: 'এই স্বপ্ন বাস্তবায়নে এলাকার শিক্ষিত মানুষ, পেশাজীবী, উদ্যোক্তা, শিক্ষক, অভিভাবক, তরুণ প্রজন্ম এবং প্রবাসীদের সম্মিলিত অংশগ্রহণকে আমরা গুরুত্বপূর্ণ মনে করি।',
    en: 'To make this dream real, we consider the joint participation of the area’s educated people, professionals, entrepreneurs, teachers, guardians, the young generation and those living abroad to be important.',
  },
  'future.dream3': {
    bn: 'আমাদের বিশ্বাস, একটি এলাকার পরিবর্তন শুরু হয় সেই এলাকার মানুষের চিন্তা, সচেতনতা ও সম্মিলিত উদ্যোগ থেকে।',
    en: 'We believe change in an area begins with the thinking, awareness and joint initiative of its own people.',
  },

  // --- contact and membership ---
  'joinSection.title': { bn: 'যোগাযোগ ও সদস্যপদ', en: 'Contact and membership' },
  'joinSection.subtitle': {
    bn: 'আপনার অংশগ্রহণেই এগিয়ে যাবে আমাদের উদ্যোগ',
    en: 'Our work moves forward through your participation',
  },
  'joinSection.p1': {
    bn: 'একটি সুন্দর সমাজ গড়ার কাজ কোনো একক ব্যক্তি বা প্রতিষ্ঠানের পক্ষে সম্ভব নয়। এর জন্য প্রয়োজন সম্মিলিত চিন্তা, পারস্পরিক সহযোগিতা এবং দায়িত্বশীল মানুষের অংশগ্রহণ।',
    en: 'Building a good society is not possible for any one person or organisation. It needs shared thinking, mutual cooperation and the participation of responsible people.',
  },
  'joinSection.p2': {
    bn: 'কলমা সোশ্যাল ক্লাব এলাকার সব শ্রেণি-পেশার মানুষের জন্য উন্মুক্ত। আপনি শিক্ষার্থী, চাকরিজীবী, ব্যবসায়ী, শিক্ষক, উদ্যোক্তা কিংবা প্রবাসী—সমাজের জন্য ইতিবাচক কিছু করার আগ্রহ থাকলে আপনিও আমাদের সঙ্গে যুক্ত হতে পারেন।',
    en: 'Kalma Social Club is open to people of every class and profession in the area. Whether you are a student, employee, businessperson, teacher, entrepreneur or living abroad, if you want to do something positive for society, you can join us too.',
  },
  'joinSection.eligTitle': {
    bn: 'সদস্য হওয়ার যোগ্যতা',
    en: 'Who can become a member',
  },
  'joinSection.elig1': {
    bn: 'আবেদনকারীর বয়স কমপক্ষে ১৮ বছর হতে হবে।',
    en: 'The applicant must be at least 18 years old.',
  },
  'joinSection.elig2': {
    bn: 'ভদ্র, মার্জিত ও দায়িত্বশীল আচরণের অধিকারী হতে হবে।',
    en: 'They must behave in a polite, refined and responsible way.',
  },
  'joinSection.elig3': {
    bn: 'সমাজ ও এলাকার প্রতি ইতিবাচক দৃষ্টিভঙ্গি থাকতে হবে।',
    en: 'They must have a positive outlook towards society and the area.',
  },
  'joinSection.elig4': {
    bn: 'ক্লাবের উদ্দেশ্য, আদর্শ ও সাংগঠনিক নীতিমালা মেনে চলতে হবে।',
    en: 'They must follow the club’s aims, ideals and organisational principles.',
  },
  'joinSection.elig5': {
    bn: 'ক্লাবের কার্যক্রমে ব্যক্তিগত রাজনৈতিক বা সাম্প্রদায়িক প্রভাব বিস্তার করা যাবে না।',
    en: 'They must not spread personal political or communal influence in the club’s activities.',
  },
  'joinSection.elig6': {
    bn: 'মানবিক ও সামাজিক কার্যক্রমে অংশগ্রহণের মানসিকতা থাকতে হবে।',
    en: 'They must be willing to take part in humanitarian and social work.',
  },
  'joinSection.rightsTitle': {
    bn: 'সদস্যদের সুযোগ ও অধিকার',
    en: 'Members’ opportunities and rights',
  },
  'joinSection.right1': {
    bn: 'ক্লাবের সাধারণ সভা ও অনুমোদিত কার্যক্রমে অংশগ্রহণ।',
    en: 'Take part in the club’s general meetings and approved activities.',
  },
  'joinSection.right2': {
    bn: 'সাংগঠনিক কার্যক্রম ও উন্নয়ন পরিকল্পনায় মতামত প্রদান।',
    en: 'Give opinions on the club’s work and development plans.',
  },
  'joinSection.right3': {
    bn: 'নির্ধারিত নিয়ম অনুযায়ী বার্ষিক সাধারণ সভায় ভোটাধিকার প্রয়োগ।',
    en: 'Vote at the annual general meeting, under the set rules.',
  },
  'joinSection.right4': {
    bn: 'বিভিন্ন সামাজিক, শিক্ষামূলক ও মানবিক উদ্যোগে অংশগ্রহণ।',
    en: 'Take part in various social, educational and humanitarian initiatives.',
  },
  'joinSection.right5': {
    bn: 'ক্লাবের অনুমোদিত কার্যক্রম ও আর্থিক প্রতিবেদন সম্পর্কে তথ্য জানার সুযোগ।',
    en: 'Be able to learn about the club’s approved activities and financial reports.',
  },
  'joinSection.stepsTitle': {
    bn: 'যেভাবে সদস্য হবেন',
    en: 'How to become a member',
  },
  'joinSection.step1': {
    bn: 'ক্লাব কার্যালয় থেকে সদস্যপদ ফর্ম সংগ্রহ করুন।',
    en: 'Collect a membership form from the club office.',
  },
  'joinSection.step2': {
    bn: 'প্রয়োজনীয় তথ্য দিয়ে ফর্ম পূরণ করুন।',
    en: 'Fill in the form with the required details.',
  },
  'joinSection.step3': {
    bn: 'নির্ধারিত আবেদন ফি জমা দিন।',
    en: 'Pay the set application fee.',
  },
  'joinSection.step4': {
    bn: 'সাংগঠনিক যাচাই ও অনুমোদন সম্পন্ন হলে সদস্যপদ গ্রহণ করুন।',
    en: 'Once the club’s checks and approval are done, accept your membership.',
  },
  'joinSection.bloodNote': {
    bn: 'জরুরি প্রয়োজনে রক্তদাতা শনাক্তকরণ ও যোগাযোগ সহজ করার উদ্দেশ্যে সদস্যপদ ফর্মে রক্তের গ্রুপের তথ্য চাওয়া হয়।',
    en: 'The membership form asks for your blood group, so that donors can be identified and contacted easily in an emergency.',
  },
  'joinSection.privacyTitle': {
    bn: 'ব্যক্তিগত তথ্যের গোপনীয়তা',
    en: 'Privacy of personal information',
  },
  'joinSection.privacyText': {
    bn: 'সদস্যদের কাছ থেকে সংগৃহীত ব্যক্তিগত তথ্য যথাযথ গোপনীয়তার সঙ্গে সংরক্ষণ করা হবে। এসব তথ্য কেবল সাংগঠনিক ব্যবস্থাপনা, জরুরি যোগাযোগ এবং অনুমোদিত কার্যক্রমের প্রয়োজনে ব্যবহার করা হবে। অনুমতি ছাড়া ব্যক্তিগত তথ্য তৃতীয় পক্ষের কাছে প্রকাশ করা হবে না, আইনগত বাধ্যবাধকতা ব্যতীত।',
    en: 'Personal information collected from members will be kept in proper confidence. It will be used only for the club’s management, emergency contact and approved activities. Personal information will not be disclosed to a third party without permission, except where the law requires it.',
  },
  'joinSection.contactTitle': {
    bn: 'আমাদের সঙ্গে যোগাযোগ করুন',
    en: 'Contact us',
  },
  'joinSection.address': {
    bn: 'ঠিকানা: ভিল-কলমা ১ (আমতলা), পোস্ট: ডেইরি ফার্ম, থানা: সাভার, ঢাকা।',
    en: 'Address: Vill-Kalma 1 (Amtola), Post: Dairy Farm, P.S.: Savar, Dhaka.',
  },
  'joinSection.emailLabel': { bn: 'ইমেইল:', en: 'Email:' },
  'joinSection.facebookCta': {
    bn: 'আমাদের ফেসবুক পেজ ভিজিট করুন',
    en: 'Visit our Facebook page',
  },
  'joinSection.apply': { bn: 'অনলাইনে আবেদন করুন', en: 'Apply online' },
  'joinSection.closing1': {
    bn: 'আপনার মতামত, সহযোগিতা ও অংশগ্রহণ আমাদের কাছে গুরুত্বপূর্ণ।',
    en: 'Your opinions, cooperation and participation matter to us.',
  },
  'joinSection.closing2': {
    bn: 'আসুন, ব্যক্তিগত উদ্যোগকে সম্মিলিত শক্তিতে রূপ দিই। একসঙ্গে গড়ি সুন্দর আগামীর কলমা।',
    en: 'Come, let us turn individual effort into shared strength. Together, let us build the Kalma of a beautiful tomorrow.',
  },
} satisfies Record<string, Entry>
