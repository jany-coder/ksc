import type { Entry } from './core.ts'

// The admin panel. The English of the consent wording (memberNew.consent) is a
// first draft like the Bengali: the club or a lawyer should review both.
export const adminMessages = {
  // --- words used all over the panel ---
  'a.cancel': { bn: 'বাতিল', en: 'Cancel' },
  'a.save': { bn: 'সংরক্ষণ করুন', en: 'Save' },
  'a.saveDraft': { bn: 'খসড়া রাখুন', en: 'Save as draft' },
  'a.publish': { bn: 'প্রকাশ করুন', en: 'Publish' },
  'a.wait': { bn: 'অপেক্ষা করুন…', en: 'Please wait…' },
  'a.yes': { bn: 'হ্যাঁ', en: 'Yes' },
  'a.no': { bn: 'না', en: 'No' },
  'a.yesDelete': { bn: 'হ্যাঁ, মুছে ফেলুন', en: 'Yes, delete' },
  'a.delete': { bn: 'মুছে ফেলুন', en: 'Delete' },
  'a.close': { bn: 'বন্ধ করুন', en: 'Close' },
  'a.loading': { bn: 'লোড হচ্ছে…', en: 'Loading…' },
  'a.all': { bn: 'সব', en: 'All' },
  'a.prev': { bn: 'আগের', en: 'Previous' },
  'a.next': { bn: 'পরের', en: 'Next' },
  'a.new': { bn: 'নতুন', en: 'New' },
  'a.edit': { bn: 'সম্পাদনা', en: 'Edit' },
  'a.breadcrumb': { bn: 'পথ', en: 'Breadcrumb' },
  'a.status': { bn: 'অবস্থা', en: 'Status' },
  'a.actions': { bn: 'কাজ', en: 'Actions' },
  'a.editDelete': { bn: 'সম্পাদনা / মুছুন', en: 'Edit / delete' },
  'a.retry': {
    bn: 'ইন্টারনেট দেখে আবার চেষ্টা করুন।',
    en: 'Check your internet and try again.',
  },
  'a.invalidForm': {
    bn: 'তথ্য ঠিক নেই। ফর্মটি আবার দেখে নিন।',
    en: 'Some details are not right. Please check the form again.',
  },
  'a.deleteFailed': {
    bn: 'মোছা গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।',
    en: 'Could not delete. Check your internet and try again.',
  },
  'a.publishNote': {
    bn: 'প্রকাশিত হলে সাথে সাথে ওয়েবসাইটে দেখা যাবে।',
    en: 'Once published, it appears on the website straight away.',
  },
  'a.draftNote': {
    bn: 'খসড়া শুধু অ্যাডমিন দেখতে পান।',
    en: 'Only admins can see a draft.',
  },
  'a.publishSettings': { bn: 'প্রকাশের সেটিং', en: 'Publishing' },
  'a.colTitle': { bn: 'শিরোনাম', en: 'Title' },
  'a.hideInstead': {
    bn: 'আর দরকার না হলে মুছে ফেলুন। শুধু লুকাতে চাইলে অবস্থা "খসড়া" করে সংরক্ষণ করুন।',
    en: 'Delete it if it is no longer needed. To only hide it, set the status to "Draft" and save.',
  },

  // --- statuses and roles ---
  'status.active': { bn: 'সক্রিয়', en: 'Active' },
  'status.pending': { bn: 'অপেক্ষমাণ', en: 'Pending' },
  'status.suspended': { bn: 'স্থগিত', en: 'Suspended' },
  'status.draft': { bn: 'খসড়া', en: 'Draft' },
  'status.published': { bn: 'প্রকাশিত', en: 'Published' },
  'role.super_admin': { bn: 'সুপার অ্যাডমিন', en: 'Super admin' },
  'role.admin': { bn: 'অ্যাডমিন', en: 'Admin' },
  'role.member': { bn: 'সদস্য', en: 'Member' },

  // --- shell (sidebar) ---
  'shell.admin': { bn: 'অ্যাডমিন', en: 'Admin' },
  'shell.soon': { bn: 'শীঘ্রই আসছে', en: 'Coming soon' },
  'shell.signOut': { bn: 'সাইন আউট', en: 'Sign out' },
  'shell.dashboard': { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
  'shell.members': { bn: 'সদস্য', en: 'Members' },
  'shell.donors': { bn: 'রক্তদাতা', en: 'Blood donors' },
  'shell.activities': { bn: 'কার্যক্রম', en: 'Activities' },
  'shell.gallery': { bn: 'গ্যালারি', en: 'Gallery' },
  'shell.notices': { bn: 'নোটিশ', en: 'Notices' },
  'shell.settings': { bn: 'সেটিংস', en: 'Settings' },

  // --- dashboard ---
  'dash.pageTitle': {
    bn: 'অ্যাডমিন প্যানেল — কলমা সোশ্যাল ক্লাব',
    en: 'Admin panel — Kalma Social Club',
  },
  'dash.title': { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
  'dash.lead': {
    bn: 'ক্লাবের এক নজরে অবস্থা। এখানে শুধু সংখ্যা দেখানো হয়।',
    en: 'The club at a glance. Only counts are shown here.',
  },
  'dash.loadError': {
    bn: 'তথ্য আনা যায়নি। পেজ রিফ্রেশ করে দেখুন।',
    en: 'Could not load the figures. Refresh the page.',
  },
  'dash.members': { bn: 'সদস্য', en: 'Members' },
  'dash.membersTotal': { bn: 'মোট সদস্য', en: 'Total members' },
  'dash.pendingHint': {
    bn: 'অনুমোদনের অপেক্ষায় — দেখুন',
    en: 'Waiting for approval — review',
  },
  'dash.donors': {
    bn: 'রক্তদাতা (সক্রিয় ও রক্তদানে ইচ্ছুক)',
    en: 'Blood donors (active and willing)',
  },
  'dash.activities': { bn: 'কার্যক্রম', en: 'Activities' },
  'dash.notices': { bn: 'নোটিশ', en: 'Notices' },
  'dash.published': { bn: 'প্রকাশিত', en: 'Published' },
  'dash.draft': { bn: 'খসড়া', en: 'Draft' },

  // --- members list ---
  'members.pageTitle': {
    bn: 'সদস্য — কলমা সোশ্যাল ক্লাব',
    en: 'Members — Kalma Social Club',
  },
  'members.title': { bn: 'সদস্য', en: 'Members' },
  'members.privacy': {
    bn: 'ফোন নম্বর, ঠিকানা ও রক্তের গ্রুপ শুধু অ্যাডমিন দেখতে পান — ওয়েবসাইটে কোথাও প্রকাশ হয় না।',
    en: 'Only admins can see phone numbers, addresses and blood groups. They are never shown anywhere on the website.',
  },
  'members.loadError': {
    bn: 'সদস্যদের তালিকা লোড করা গেল না। পাতাটি রিফ্রেশ করে দেখুন।',
    en: 'Could not load the members list. Please refresh the page.',
  },
  'members.csv': { bn: 'CSV ডাউনলোড', en: 'Download CSV' },
  'members.add': { bn: 'নতুন সদস্য', en: 'New member' },
  'members.byStatus': { bn: 'অবস্থা অনুযায়ী', en: 'By status' },
  'members.searchLabel': {
    bn: 'নাম বা নম্বর দিয়ে খুঁজুন',
    en: 'Search by name or number',
  },
  'members.searchPlaceholder': { bn: 'নাম বা নম্বর', en: 'Name or number' },
  'members.emptyNone': {
    bn: 'এখনো কোনো সদস্য যোগ হয়নি।',
    en: 'No members have been added yet.',
  },
  'members.emptyFilter': {
    bn: 'এই ফিল্টারে কোনো সদস্য পাওয়া যায়নি।',
    en: 'No members match this filter.',
  },
  'members.summary': {
    bn: '{all} জনের মধ্যে {total} জন মিলেছে',
    en: '{total} of {all} members match',
  },
  'members.range': {
    bn: ' · {from}–{to} দেখানো হচ্ছে',
    en: ' · showing {from}–{to}',
  },
  'members.caption': { bn: 'সদস্যদের তালিকা', en: 'List of members' },
  'members.colMember': { bn: 'সদস্য', en: 'Member' },
  'members.colMobile': { bn: 'মোবাইল', en: 'Mobile' },
  'members.colBlood': { bn: 'রক্ত', en: 'Blood' },
  'members.colArea': { bn: 'এলাকা', en: 'Area' },
  'members.colOccupation': { bn: 'পেশা', en: 'Occupation' },

  // --- member detail drawer ---
  'drawer.title': { bn: 'সদস্যের তথ্য', en: 'Member details' },
  'drawer.loadError': {
    bn: 'তথ্য লোড করা গেল না। আবার চেষ্টা করুন।',
    en: 'Could not load the details. Please try again.',
  },
  'drawer.notFound': {
    bn: 'এই সদস্যকে পাওয়া যায়নি।',
    en: 'This member could not be found.',
  },
  'drawer.mobile': { bn: 'মোবাইল', en: 'Mobile' },
  'drawer.email': { bn: 'ইমেইল', en: 'Email' },
  'drawer.blood': { bn: 'রক্তের গ্রুপ', en: 'Blood group' },
  'drawer.willing': { bn: 'রক্তদানে আগ্রহী', en: 'Willing to donate' },
  'drawer.lastDonation': { bn: 'সর্বশেষ রক্তদান', en: 'Last donation' },
  'drawer.address': { bn: 'ঠিকানা', en: 'Address' },
  'drawer.area': { bn: 'এলাকা', en: 'Area' },
  'drawer.occupation': { bn: 'পেশা', en: 'Occupation' },
  'drawer.joined': { bn: 'যোগদানের তারিখ', en: 'Date joined' },
  'drawer.consent': {
    bn: 'তথ্য ব্যবহারে সম্মতি দিয়েছেন',
    en: 'Gave consent to use their details',
  },
  'drawer.tempPassword': {
    bn: 'অস্থায়ী পাসওয়ার্ড (শুধু এখন একবার দেখানো হচ্ছে — সদস্যকে জানিয়ে দিন। প্রথমবার ঢুকেই নতুন পাসওয়ার্ড দিতে হবে):',
    en: 'Temporary password (shown only once, now. Pass it on to the member. They must set a new password on first sign-in):',
  },
  'drawer.resetConfirm': {
    bn: 'নতুন অস্থায়ী পাসওয়ার্ড তৈরি হবে এবং এই ব্যক্তি সব ডিভাইস থেকে বের হয়ে যাবেন। চালিয়ে যাবেন?',
    en: 'A new temporary password will be created and this person will be signed out of every device. Continue?',
  },
  'drawer.makeAdmin': { bn: 'অ্যাডমিন বানান', en: 'Make admin' },
  'drawer.makeAdminConfirm': {
    bn: 'এই সদস্যকে অ্যাডমিন বানাবেন? তিনি সব সদস্যের তথ্য দেখতে পারবেন। একটি অস্থায়ী পাসওয়ার্ড দেওয়া হবে।',
    en: "Make this member an admin? They will be able to see every member's details. A temporary password will be given.",
  },
  'drawer.removeAdmin': { bn: 'অ্যাডমিন থেকে সরান', en: 'Remove as admin' },
  'drawer.removeAdminConfirm': {
    bn: 'অ্যাডমিন পদ সরাবেন? তার লগইন মুছে যাবে ও সব ডিভাইস থেকে বের হয়ে যাবেন; সদস্য হিসেবে থাকবেন।',
    en: 'Remove admin access? Their login will be deleted and they will be signed out everywhere; they stay a member.',
  },
  'drawer.errMakeAdmin': {
    bn: 'অ্যাডমিন বানানো গেল না। সদস্যকে আগে "সক্রিয়" করতে হবে।',
    en: 'Could not make an admin. The member must be active first.',
  },
  'drawer.errRemoveAdmin': {
    bn: 'অ্যাডমিন পদ সরানো গেল না।',
    en: 'Could not remove admin access.',
  },
  'drawer.reset': { bn: 'পাসওয়ার্ড রিসেট করুন', en: 'Reset password' },
  'drawer.activate': { bn: 'সক্রিয় করুন', en: 'Activate' },
  'drawer.suspend': { bn: 'স্থগিত করুন', en: 'Suspend' },
  'drawer.deleteConfirm': {
    bn: 'সদস্যকে তালিকা থেকে সরিয়ে দেওয়া হবে এবং ৩০ দিন পর স্থায়ীভাবে মুছে যাবে। নিশ্চিত?',
    en: 'The member will be removed from the list and permanently deleted after 30 days. Are you sure?',
  },
  'drawer.delete': { bn: 'সদস্যকে মুছে ফেলুন', en: 'Delete member' },
  'drawer.errNoLogin': {
    bn: 'এই সদস্যের লগইন অ্যাকাউন্ট নেই।',
    en: 'This member has no login account.',
  },
  'drawer.errReset': {
    bn: 'পাসওয়ার্ড রিসেট করা গেল না।',
    en: 'Could not reset the password.',
  },
  'drawer.errResetNet': {
    bn: 'রিসেট করা গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।',
    en: 'Could not reset. Check your internet and try again.',
  },
  'drawer.errDelete': {
    bn: 'সদস্যকে মোছা গেল না।',
    en: 'Could not delete the member.',
  },
  'drawer.errDeleteNet': {
    bn: 'সদস্যকে মোছা গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।',
    en: 'Could not delete the member. Check your internet and try again.',
  },
  'drawer.errChange': {
    bn: 'এই পরিবর্তন করা গেল না।',
    en: 'Could not make this change.',
  },
  'drawer.errChangeNet': {
    bn: 'এই পরিবর্তন করা গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।',
    en: 'Could not make this change. Check your internet and try again.',
  },

  // --- new member form ---
  'memberNew.pageTitle': {
    bn: 'নতুন সদস্য — কলমা সোশ্যাল ক্লাব',
    en: 'New member — Kalma Social Club',
  },
  'memberNew.back': {
    bn: 'সদস্য তালিকায় ফিরুন',
    en: 'Back to the members list',
  },
  'memberNew.title': { bn: 'নতুন সদস্য', en: 'New member' },
  'memberNew.lead': {
    bn: 'তারকা-চিহ্নিত ঘরগুলো আবশ্যক। বাকিগুলো পরে সম্পাদনা করা যাবে।',
    en: 'Fields marked * are required. The rest can be edited later.',
  },
  'memberNew.consent': {
    bn: 'সদস্য নিজে তাঁর নাম, ফোন নম্বর, ঠিকানা ও রক্তের গ্রুপ ক্লাবের রেকর্ডে রাখার সম্মতি দিয়েছেন।',
    en: 'The member has personally agreed to the club keeping their name, phone number, address and blood group in its records.',
  },
  'memberNew.consentNote': {
    bn: 'এই তথ্য শুধু অ্যাডমিন দেখতে পান, ওয়েবসাইটে কোথাও প্রকাশ হয় না।',
    en: 'Only admins can see this information. It is never shown on the website.',
  },
  'memberNew.phoneTaken': {
    bn: 'এই নম্বরে আগে থেকেই একজন সদস্য আছেন (আর্কাইভ করা হলেও)।',
    en: 'A member with this number already exists (even if archived).',
  },
  'memberNew.errSave': {
    bn: 'সদস্য যোগ করা গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।',
    en: 'Could not add the member. Check your internet and try again.',
  },
  'memberNew.name': { bn: 'নাম *', en: 'Name *' },
  'memberNew.phone': { bn: 'মোবাইল নম্বর *', en: 'Mobile number *' },
  'memberNew.email': { bn: 'ইমেইল (ঐচ্ছিক)', en: 'Email (optional)' },
  'memberNew.blood': { bn: 'রক্তের গ্রুপ', en: 'Blood group' },
  'memberNew.bloodUnknown': { bn: 'জানা নেই', en: 'Not known' },
  'memberNew.address': { bn: 'ঠিকানা (ঐচ্ছিক)', en: 'Address (optional)' },
  'memberNew.area': { bn: 'এলাকা (ঐচ্ছিক)', en: 'Area (optional)' },
  'memberNew.occupation': { bn: 'পেশা (ঐচ্ছিক)', en: 'Occupation (optional)' },
  'memberNew.willing': {
    bn: 'রক্ত দিতে রাজি',
    en: 'Willing to donate blood',
  },
  'memberNew.submit': { bn: 'সদস্য যোগ করুন', en: 'Add member' },

  // --- edit member ---
  'memberEdit.pageTitle': {
    bn: 'সদস্য সম্পাদনা — কলমা সোশ্যাল ক্লাব',
    en: 'Edit member — Kalma Social Club',
  },
  'memberEdit.title': { bn: 'সদস্য সম্পাদনা', en: 'Edit member' },
  'memberEdit.lead': {
    bn: 'নাম, যোগাযোগ ও রক্তদানের তথ্য বদলানো যায়। অবস্থা বদলাতে বা পাসওয়ার্ড রিসেট করতে সদস্যের তথ্যের ড্রয়ার ব্যবহার করুন।',
    en: "You can change the name, contact and blood donation details. To change the status or reset a password, use the member's details drawer.",
  },
  'memberEdit.phoneLabel': { bn: 'মোবাইল নম্বর', en: 'Mobile number' },
  'memberEdit.phoneLocked': {
    bn: 'এই নম্বরটাই সদস্যের পরিচয় (অ্যাডমিন হলে লগইনের নামও), তাই এটি বদলানো যায় না।',
    en: "This number is the member's identity (and an admin's sign-in name), so it cannot be changed.",
  },
  'memberEdit.lastDonation': {
    bn: 'সর্বশেষ রক্তদানের তারিখ (ঐচ্ছিক)',
    en: 'Date of last blood donation (optional)',
  },
  'memberEdit.notFound': {
    bn: 'এই সদস্যকে পাওয়া যায়নি (হয়তো মুছে ফেলা হয়েছে)।',
    en: 'This member was not found (they may have been deleted).',
  },
  'memberEdit.forbidden': {
    bn: 'এই সদস্যকে বদলানোর অনুমতি আপনার নেই।',
    en: 'You are not allowed to edit this member.',
  },
  'memberEdit.gone': {
    bn: 'সদস্যটি আর নেই।',
    en: 'This member no longer exists.',
  },
  'memberEdit.errSave': {
    bn: 'পরিবর্তন সংরক্ষণ করা গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।',
    en: 'Could not save the changes. Check your internet and try again.',
  },
  'memberEdit.phoneChangeTitle': {
    bn: 'মোবাইল নম্বর পরিবর্তন (শুধু সুপার অ্যাডমিন)',
    en: 'Change mobile number (super admin only)',
  },
  'memberEdit.phoneChangeHelp': {
    bn: 'নম্বর ভুল হলে বা সদস্য নতুন নম্বর নিলে এখানে ঠিক করুন। অ্যাডমিন হলে নতুন নম্বর দিয়েই লগইন করতে হবে; পাসওয়ার্ড একই থাকবে।',
    en: 'Use this if the number was typed wrong or the member got a new one. An admin must sign in with the new number from now on; the password stays the same.',
  },
  'memberEdit.phoneNew': { bn: 'নতুন নম্বর', en: 'New number' },
  'memberEdit.phoneChangeBtn': { bn: 'নম্বর বদলান', en: 'Change number' },
  'memberEdit.phoneChanged': {
    bn: 'নম্বর বদলানো হয়েছে।',
    en: 'The number was changed.',
  },
  'memberEdit.phoneInvalid': {
    bn: 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন ০১৭১২৩৪৫৬৭৮)।',
    en: 'Enter a valid Bangladeshi mobile number (for example 01712345678).',
  },
  'memberEdit.phoneTaken': {
    bn: 'এই নম্বর অন্য একজন সদস্যের আছে।',
    en: 'Another member already has this number.',
  },
  // --- archived members (the 30-day bin) ---
  'bin.pageTitle': {
    bn: 'মুছে ফেলা সদস্য — কলমা সোশ্যাল ক্লাব',
    en: 'Deleted members — Kalma Social Club',
  },
  'bin.link': { bn: 'মুছে ফেলা সদস্য', en: 'Deleted members' },
  'bin.title': { bn: 'মুছে ফেলা সদস্য', en: 'Deleted members' },
  'bin.lead': {
    bn: '৩০ দিন এখানে থাকে, তারপর স্থায়ীভাবে মুছে যায়। এর মধ্যে ফিরিয়ে আনা যায়।',
    en: 'They stay here for 30 days, then are deleted for good. You can bring them back until then.',
  },
  'bin.empty': {
    bn: 'মুছে ফেলা কোনো সদস্য নেই।',
    en: 'No deleted members.',
  },
  'bin.deletedOn': { bn: 'মুছেছেন: {date}', en: 'Deleted on {date}' },
  'bin.daysLeft': {
    bn: 'আর {n} দিন বাকি',
    en: '{n} days left',
  },
  'bin.restore': { bn: 'ফিরিয়ে আনুন', en: 'Restore' },
  'bin.restoreFailed': {
    bn: 'ফিরিয়ে আনা গেল না। আবার চেষ্টা করুন।',
    en: 'Could not restore. Try again.',
  },
  'bin.loadError': {
    bn: 'তালিকা আনা যায়নি। পেজ রিফ্রেশ করুন।',
    en: 'Could not load the list. Refresh the page.',
  },
  'drawer.edit': { bn: 'তথ্য সম্পাদনা', en: 'Edit details' },

  // --- activities ---
  'act.pageTitle': {
    bn: 'কার্যক্রম — কলমা সোশ্যাল ক্লাব',
    en: 'Activities — Kalma Social Club',
  },
  'act.title': { bn: 'কার্যক্রম', en: 'Activities' },
  'act.lead': {
    bn: 'প্রকাশিত কার্যক্রম ওয়েবসাইটের হোমপেজে দেখা যায়। খসড়া শুধু অ্যাডমিন দেখতে পান।',
    en: 'Published activities appear on the website home page. Only admins can see drafts.',
  },
  'act.loadError': {
    bn: 'কার্যক্রমের তালিকা লোড করা গেল না। পাতাটি রিফ্রেশ করে দেখুন।',
    en: 'Could not load the activities list. Please refresh the page.',
  },
  'act.add': { bn: 'নতুন কার্যক্রম', en: 'New activity' },
  'act.empty': {
    bn: 'এখনো কোনো কার্যক্রম যোগ হয়নি।',
    en: 'No activities have been added yet.',
  },
  'act.caption': { bn: 'কার্যক্রমের তালিকা', en: 'List of activities' },
  'act.colType': { bn: 'ধরন', en: 'Type' },
  'act.colDate': { bn: 'তারিখ', en: 'Date' },
  'act.featured': { bn: 'হোমপেজের উপরে', en: 'Top of home page' },
  'act.newPageTitle': {
    bn: 'নতুন কার্যক্রম — কলমা সোশ্যাল ক্লাব',
    en: 'New activity — Kalma Social Club',
  },
  'act.editPageTitle': {
    bn: 'কার্যক্রম সম্পাদনা — কলমা সোশ্যাল ক্লাব',
    en: 'Edit activity — Kalma Social Club',
  },
  'act.editTitle': { bn: 'কার্যক্রম সম্পাদনা', en: 'Edit activity' },
  'act.notFound': {
    bn: 'এই কার্যক্রমটি পাওয়া যায়নি (হয়তো মুছে ফেলা হয়েছে)।',
    en: 'This activity was not found (it may have been deleted).',
  },
  'act.backToList': {
    bn: 'কার্যক্রমের তালিকায় ফিরুন',
    en: 'Back to the activities list',
  },
  'act.gone': {
    bn: 'কার্যক্রমটি আর নেই।',
    en: 'This activity no longer exists.',
  },
  'act.deleteTitle': { bn: 'কার্যক্রম মুছুন', en: 'Delete activity' },
  'act.deleteConfirm': {
    bn: 'কার্যক্রমটি স্থায়ীভাবে মুছে যাবে। এর ছবিগুলো গ্যালারিতেই থাকবে। নিশ্চিত?',
    en: 'The activity will be deleted permanently. Its photos stay in the gallery. Are you sure?',
  },
  'act.errSave': {
    bn: 'কার্যক্রম সংরক্ষণ করা গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।',
    en: 'Could not save the activity. Check your internet and try again.',
  },
  'act.fTitle': { bn: 'শিরোনাম *', en: 'Title *' },
  'act.fTitlePh': {
    bn: 'যেমন: ফ্রি রক্তের গ্রুপ নির্ণয় ক্যাম্প',
    en: 'e.g. Free blood group testing camp',
  },
  'act.fDate': { bn: 'তারিখ', en: 'Date' },
  'act.fTime': { bn: 'সময়', en: 'Time' },
  'act.fPlace': { bn: 'স্থান', en: 'Place' },
  'act.fPlacePh': { bn: 'ক্লাব প্রাঙ্গণ, কলমা', en: 'Club grounds, Kalma' },
  'act.fDescription': { bn: 'বিবরণ', en: 'Description' },
  'act.fDescriptionPh': {
    bn: 'কার্যক্রমটি কী নিয়ে, কারা অংশ নিতে পারবেন, কী আনতে হবে — সংক্ষেপে লিখুন।',
    en: 'What the activity is about, who can take part, what to bring: in a few words.',
  },
  'act.fCover': { bn: 'কভার ছবি', en: 'Cover photo' },
  'act.fCoverNone': { bn: 'ছবি ছাড়া', en: 'No photo' },
  'act.fCoverN': { bn: 'ছবি {n}', en: 'Photo {n}' },
  'act.fCoverEmpty': {
    bn: 'গ্যালারিতে এখনো কোনো ছবি নেই।',
    en: 'The gallery has no photos yet.',
  },
  'act.fCoverAdd': { bn: 'আগে ছবি যোগ করুন', en: 'Add photos first' },
  'act.fType': { bn: 'ধরন', en: 'Type' },
  'act.fTypeNone': { bn: 'বেছে নেওয়া হয়নি', en: 'Not chosen' },
  'act.fFeatured': {
    bn: 'হোমপেজের উপরে দেখান',
    en: 'Show at the top of the home page',
  },
  'cat.blood': { bn: 'রক্তদান', en: 'Blood donation' },
  'cat.relief': { bn: 'ত্রাণ ও সহায়তা', en: 'Relief and support' },
  'cat.education': { bn: 'শিক্ষা', en: 'Education' },
  'cat.sports': { bn: 'খেলাধুলা', en: 'Sports' },
  'cat.meeting': { bn: 'সভা', en: 'Meeting' },

  // --- notices ---
  'not.pageTitle': {
    bn: 'নোটিশ — কলমা সোশ্যাল ক্লাব',
    en: 'Notices — Kalma Social Club',
  },
  'not.title': { bn: 'নোটিশ', en: 'Notices' },
  'not.lead': {
    bn: 'প্রকাশিত নোটিশ ওয়েবসাইটের নোটিশ বোর্ডে দেখা যায়। খসড়া শুধু অ্যাডমিন দেখতে পান।',
    en: 'Published notices appear on the website notice board. Only admins can see drafts.',
  },
  'not.loadError': {
    bn: 'নোটিশের তালিকা লোড করা গেল না। পাতাটি রিফ্রেশ করে দেখুন।',
    en: 'Could not load the notices list. Please refresh the page.',
  },
  'not.add': { bn: 'নতুন নোটিশ', en: 'New notice' },
  'not.empty': {
    bn: 'এখনো কোনো নোটিশ যোগ হয়নি।',
    en: 'No notices have been added yet.',
  },
  'not.caption': { bn: 'নোটিশের তালিকা', en: 'List of notices' },
  'not.colPublished': { bn: 'প্রকাশের তারিখ', en: 'Published on' },
  'not.newPageTitle': {
    bn: 'নতুন নোটিশ — কলমা সোশ্যাল ক্লাব',
    en: 'New notice — Kalma Social Club',
  },
  'not.editPageTitle': {
    bn: 'নোটিশ সম্পাদনা — কলমা সোশ্যাল ক্লাব',
    en: 'Edit notice — Kalma Social Club',
  },
  'not.editTitle': { bn: 'নোটিশ সম্পাদনা', en: 'Edit notice' },
  'not.notFound': {
    bn: 'এই নোটিশটি পাওয়া যায়নি (হয়তো মুছে ফেলা হয়েছে)।',
    en: 'This notice was not found (it may have been deleted).',
  },
  'not.backToList': {
    bn: 'নোটিশের তালিকায় ফিরুন',
    en: 'Back to the notices list',
  },
  'not.gone': { bn: 'নোটিশটি আর নেই।', en: 'This notice no longer exists.' },
  'not.deleteTitle': { bn: 'নোটিশ মুছুন', en: 'Delete notice' },
  'not.deleteConfirm': {
    bn: 'নোটিশটি স্থায়ীভাবে মুছে যাবে। নিশ্চিত?',
    en: 'The notice will be deleted permanently. Are you sure?',
  },
  'not.errSave': {
    bn: 'নোটিশ সংরক্ষণ করা গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।',
    en: 'Could not save the notice. Check your internet and try again.',
  },
  'not.fTitle': { bn: 'শিরোনাম *', en: 'Title *' },
  'not.fBody': { bn: 'বিবরণ *', en: 'Details *' },
  'not.fUrgent': {
    bn: 'জরুরি নোটিশ (উপরে লাল চিহ্নসহ দেখাবে)',
    en: 'Urgent notice (shown at the top with a red mark)',
  },
  'not.urgentTag': { bn: 'জরুরি', en: 'Urgent' },

  // --- admin gallery ---
  'gal.pageTitle': {
    bn: 'গ্যালারি — কলমা সোশ্যাল ক্লাব',
    en: 'Gallery — Kalma Social Club',
  },
  'gal.title': { bn: 'গ্যালারি', en: 'Gallery' },
  'gal.lead': {
    bn: 'এখানে দেওয়া সব ছবি ওয়েবসাইটের গ্যালারিতে দেখা যায়। ছবি আপলোডের আগে নিজে থেকেই ছোট হয়ে যায়।',
    en: 'Every photo added here appears in the website gallery. Photos are shrunk automatically before they are uploaded.',
  },
  'gal.loadError': {
    bn: 'গ্যালারি লোড করা গেল না। পাতাটি রিফ্রেশ করে দেখুন।',
    en: 'Could not load the gallery. Please refresh the page.',
  },
  'gal.add': { bn: 'ছবি যোগ করুন', en: 'Add photos' },
  'gal.uploading': { bn: 'আপলোড হচ্ছে…', en: 'Uploading…' },
  'gal.storage': { bn: 'ছবি রাখার জায়গা', en: 'Photo storage' },
  'gal.used': {
    bn: 'ব্যবহৃত: {used} / {free} (বিনামূল্যের সীমা)',
    en: 'Used: {used} / {free} (free allowance)',
  },
  'gal.meter': { bn: 'ব্যবহৃত জায়গা', en: 'Space used' },
  'gal.warn': {
    bn: 'জায়গা কমে আসছে ({warn} পার হয়েছে)। {stop}-তে নতুন ছবি নেওয়া বন্ধ হয়ে যাবে। পুরনো অপ্রয়োজনীয় ছবি মুছে দিন।',
    en: 'Space is running low (past {warn}). New uploads stop at {stop}. Delete old photos you no longer need.',
  },
  'gal.full': {
    bn: 'জায়গা প্রায় শেষ। নতুন ছবি নেওয়া বন্ধ। পুরনো ছবি মুছে জায়গা করুন।',
    en: 'Space is almost full and new uploads are stopped. Delete old photos to make room.',
  },
  'gal.working': { bn: 'প্রক্রিয়া চলছে…', en: 'Working…' },
  'gal.done': { bn: 'হয়েছে', en: 'Done' },
  'gal.photoAlt': { bn: 'ক্লাবের ছবি', en: 'Club photo' },
  'gal.captionLabel': { bn: 'ছবির ক্যাপশন', en: 'Photo caption' },
  'gal.captionPlaceholder': {
    bn: 'ক্যাপশন (ঐচ্ছিক)',
    en: 'Caption (optional)',
  },
  'gal.captionError': {
    bn: 'ক্যাপশন সংরক্ষণ করা গেল না।',
    en: 'Could not save the caption.',
  },
  'gal.deleteAria': { bn: 'ছবিটি মুছুন', en: 'Delete this photo' },
  'gal.deleteConfirm': {
    bn: 'ছবিটি স্থায়ীভাবে মুছে ফেলবেন?',
    en: 'Delete this photo permanently?',
  },
  'gal.deleteError': {
    bn: 'ছবিটি মোছা গেল না। আবার চেষ্টা করুন।',
    en: 'Could not delete the photo. Please try again.',
  },
  'gal.empty': {
    bn: 'এখনো কোনো ছবি যোগ হয়নি।',
    en: 'No photos have been added yet.',
  },
  'gal.errUnreadable': {
    bn: 'ছবিটি খোলা গেল না (হয়তো এই ধরনের ফাইল সমর্থিত নয়)।',
    en: 'The photo could not be opened (this file type may not be supported).',
  },
  'gal.errWebp': {
    bn: 'এই ব্রাউজারে ছবি ছোট করা যায় না। Chrome বা Edge ব্যবহার করুন।',
    en: 'This browser cannot shrink photos. Please use Chrome or Edge.',
  },
  'gal.errTooBig': {
    bn: 'ছবিটি অনেক বড়, ছোট করেও সীমার মধ্যে আনা গেল না।',
    en: 'The photo is too large to bring within the limit, even after shrinking.',
  },
  'gal.errFull': {
    bn: 'ছবি রাখার জায়গা প্রায় শেষ, নতুন ছবি নেওয়া বন্ধ আছে।',
    en: 'Photo storage is almost full, so new uploads are stopped.',
  },
  'gal.errAuth': {
    bn: 'ছবি দেওয়ার অনুমতি নেই। আবার লগইন করুন।',
    en: 'You are not allowed to upload. Please sign in again.',
  },
  'gal.errGeneric': {
    bn: 'আপলোড হলো না। ইন্টারনেট দেখে আবার চেষ্টা করুন।',
    en: 'The upload failed. Check your internet and try again.',
  },

  // --- CSV export (the file's own column headings) ---
  'csv.name': { bn: 'নাম', en: 'Name' },
  'csv.mobile': { bn: 'মোবাইল', en: 'Mobile' },
  'csv.email': { bn: 'ইমেইল', en: 'Email' },
  'csv.blood': { bn: 'রক্তের গ্রুপ', en: 'Blood group' },
  'csv.address': { bn: 'ঠিকানা', en: 'Address' },
  'csv.area': { bn: 'এলাকা', en: 'Area' },
  'csv.occupation': { bn: 'পেশা', en: 'Occupation' },
  'csv.status': { bn: 'অবস্থা', en: 'Status' },
  'csv.willing': { bn: 'রক্তদানে আগ্রহী', en: 'Willing to donate' },
  'csv.lastDonation': { bn: 'সর্বশেষ রক্তদান', en: 'Last donation' },
  'csv.joined': { bn: 'যোগদানের তারিখ', en: 'Date joined' },
} satisfies Record<string, Entry>
