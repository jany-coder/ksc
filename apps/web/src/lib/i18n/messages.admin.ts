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
  'members.colVillage': { bn: 'বাসা / গ্রাম', en: 'House / village' },
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
  'memberEdit.statusHint': {
    bn: 'অবস্থা বদলাতে বা পাসওয়ার্ড রিসেট করতে সদস্যের প্রোফাইলের "পরিচালনা" অংশ ব্যবহার করুন।',
    en: "To change the status or reset a password, use Manage on the member's profile.",
  },
  'drawer.fullProfile': { bn: 'পুরো প্রোফাইল দেখুন', en: 'View full profile' },
  'memberProfile.pageTitle': {
    bn: 'সদস্যের প্রোফাইল — কলমা সোশ্যাল ক্লাব',
    en: 'Member profile — Kalma Social Club',
  },
  'memberProfile.back': { bn: 'সদস্য তালিকা', en: 'Members list' },
  'memberProfile.notFound': {
    bn: 'এই সদস্যকে পাওয়া যায়নি। হয়তো মুছে ফেলা হয়েছে।',
    en: 'This member was not found. They may have been deleted.',
  },
  'history.title': { bn: 'ইতিহাস', en: 'History' },
  'history.empty': { bn: 'এখনো কিছু লেখা হয়নি।', en: 'Nothing recorded yet.' },
  'history.loadError': {
    bn: 'ইতিহাস আনা গেল না।',
    en: 'Could not load the history.',
  },
  'history.unknownAdmin': { bn: 'একজন অ্যাডমিন', en: 'An admin' },
  'history.apply': {
    bn: 'ওয়েবসাইট থেকে সদস্য হওয়ার আবেদন এসেছে',
    en: 'Applied to join through the website',
  },
  'history.create': {
    bn: '{actor} সদস্য হিসেবে যোগ করেছেন',
    en: '{actor} added this member',
  },
  'history.update': {
    bn: '{actor} তথ্য বদলেছেন',
    en: '{actor} changed the details',
  },
  'history.phoneChange': {
    bn: '{actor} মোবাইল নম্বর বদলেছেন',
    en: '{actor} changed the mobile number',
  },
  'history.photo': { bn: '{actor} ছবি দিয়েছেন', en: '{actor} added a photo' },
  'history.photoRemove': {
    bn: '{actor} ছবি সরিয়েছেন',
    en: '{actor} removed the photo',
  },
  'history.statusChange': {
    bn: '{actor} অবস্থা বদলেছেন: {from} থেকে {to}',
    en: '{actor} changed the status from {from} to {to}',
  },
  'history.passwordReset': {
    bn: '{actor} পাসওয়ার্ড রিসেট করেছেন',
    en: '{actor} reset the password',
  },
  'history.adminCreate': {
    bn: '{actor} অ্যাডমিন বানিয়েছেন',
    en: '{actor} made them an admin',
  },
  'history.superCreate': {
    bn: '{actor} সুপার অ্যাডমিন বানিয়েছেন',
    en: '{actor} made them a super admin',
  },
  'history.adminRemove': {
    bn: '{actor} অ্যাডমিন পদ সরিয়েছেন',
    en: '{actor} removed admin rights',
  },
  'history.delete': {
    bn: '{actor} মুছে ফেলেছেন (৩০ দিনের আর্কাইভে)',
    en: '{actor} deleted them (30-day archive)',
  },
  'history.restore': {
    bn: '{actor} আর্কাইভ থেকে ফিরিয়ে এনেছেন',
    en: '{actor} restored them from the archive',
  },
  'history.other': {
    bn: '{actor} একটি পরিবর্তন করেছেন',
    en: '{actor} made a change',
  },
  'memberNew.photoLater': {
    bn: 'সংরক্ষণের পর সদস্যের প্রোফাইল খুলবে, সেখান থেকে ছবি দিতে পারবেন।',
    en: "After saving, the member's profile opens; add the photo there.",
  },
  'drawer.call': { bn: 'কল করুন', en: 'Call' },
  'drawer.copy': { bn: 'কপি', en: 'Copy' },
  'drawer.copied': { bn: 'কপি হয়েছে', en: 'Copied' },
  'drawer.editShort': { bn: 'এডিট', en: 'Edit' },
  'drawer.pendingNote': {
    bn: 'এই আবেদনটি অনুমোদনের অপেক্ষায় আছে।',
    en: 'This application is waiting for approval.',
  },
  'drawer.approve': { bn: 'অনুমোদন দিন', en: 'Approve' },
  'drawer.sectionBlood': { bn: 'রক্তদান', en: 'Blood donation' },
  'drawer.sectionContact': { bn: 'যোগাযোগ', en: 'Contact' },
  'drawer.sectionMembership': { bn: 'সদস্যপদ', en: 'Membership' },
  'drawer.sectionManage': { bn: 'পরিচালনা', en: 'Manage' },
  'drawer.login': { bn: 'লগইন অ্যাকাউন্ট', en: 'Login account' },
  'drawer.never': { bn: 'এখনো দেননি', en: 'Not yet' },
  'drawer.daysAgo': { bn: '{n} দিন আগে', en: '{n} days ago' },
  'drawer.age': { bn: '{n} বছর', en: '{n} years' },
  'drawer.personalEmpty': {
    bn: 'কোনো ব্যক্তিগত তথ্য যোগ করা হয়নি।',
    en: 'No personal details added yet.',
  },
  'drawer.personalMissing': {
    bn: 'আরো {n}টি ঘর ফাঁকা।',
    en: '{n} more fields are empty.',
  },
  'drawer.fillIn': { bn: 'পূরণ করুন', en: 'Fill in' },
  'drawer.email': { bn: 'ইমেইল', en: 'Email' },
  'drawer.willing': { bn: 'রক্তদানে আগ্রহী', en: 'Willing to donate' },
  'drawer.lastDonation': { bn: 'সর্বশেষ রক্তদান', en: 'Last donation' },
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
  'drawer.makeSuper': { bn: 'সুপার অ্যাডমিন বানান', en: 'Make super admin' },
  'drawer.makeSuperConfirm': {
    bn: 'সুপার অ্যাডমিন বানাবেন? তিনি সদস্য মুছতে, CSV নিতে এবং অ্যাডমিন বানাতে ও সরাতে পারবেন। নিশ্চিত না হলে বানাবেন না।',
    en: 'Make a super admin? They will be able to delete members, export the CSV, and create or remove admins. Do not do this unless you are sure.',
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
    bn: 'নাম, ব্যক্তিগত তথ্য, যোগাযোগ আর রক্তদানের তথ্য বদলাতে পারবেন। অবস্থা বদলাতে বা পাসওয়ার্ড রিসেট করতে সদস্যের প্রোফাইল দেখুন।',
    en: "You can change the name, personal, contact and blood donation details. To change the status or reset a password, use the member's profile.",
  },
  'memberEdit.backToProfile': { bn: 'প্রোফাইলে ফিরুন', en: 'Back to profile' },
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

  // --- activities ---
  'act.pageTitle': {
    bn: 'কার্যক্রম — কলমা সোশ্যাল ক্লাব',
    en: 'Activities — Kalma Social Club',
  },
  'act.title': { bn: 'কার্যক্রম', en: 'Activities' },
  'act.lead': {
    bn: 'প্রকাশিত কার্যক্রমের তারিখ আজ বা পরে হলে হোমপেজের “আসন্ন কার্যক্রম”-এ দেখা যায়। তারিখ পেরিয়ে গেলে “আমাদের কার্যক্রম”-এ কার্ড হিসেবে আসে (হোমপেজে সর্বশেষ ৯টি, বাকিগুলো আর্কাইভে)। খসড়া শুধু অ্যাডমিন দেখতে পান।',
    en: 'A published activity dated today or later shows under “Upcoming activities” on the home page. Once its date has passed it moves to “Our activities” as a card (the newest 9 on the home page, the rest in the archive). Only admins can see drafts.',
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
  'act.colPhotos': { bn: 'ছবি', en: 'Photos' },
  'act.photos': { bn: '{n}টি ছবি', en: '{n} photos' },
  'act.noPhotos': { bn: 'ছবি নেই', en: 'No photos' },
  'act.noDate': { bn: 'তারিখ নেই', en: 'No date' },
  'act.byStatus': { bn: 'অবস্থা অনুযায়ী', en: 'By status' },
  'act.searchLabel': { bn: 'কার্যক্রম খুঁজুন', en: 'Search activities' },
  'act.searchPlaceholder': {
    bn: 'শিরোনামের কোনো শব্দ',
    en: 'A word from the title',
  },
  'act.yearLabel': { bn: 'বছর', en: 'Year' },
  'act.allYears': { bn: 'সব বছর', en: 'All years' },
  'act.kindLabel': { bn: 'ধরন', en: 'Type' },
  'act.allKinds': { bn: 'সব ধরন', en: 'All types' },
  'act.noKind': { bn: 'ধরন দেওয়া নেই', en: 'No type given' },
  'act.sortLabel': { bn: 'সাজানো', en: 'Order' },
  'act.sortNewest': { bn: 'তারিখ: নতুন আগে', en: 'Date: newest first' },
  'act.sortOldest': { bn: 'তারিখ: পুরোনো আগে', en: 'Date: oldest first' },
  'act.sortByDate': {
    bn: 'তারিখ অনুযায়ী উল্টো করে সাজান',
    en: 'Reverse the date order',
  },
  'act.emptyFilter': {
    bn: 'এই ফিল্টারে কোনো কার্যক্রম পাওয়া যায়নি।',
    en: 'No activities match this filter.',
  },
  'act.clearFilters': { bn: 'সব ফিল্টার মুছুন', en: 'Clear all filters' },
  'act.summary': {
    bn: '{all}টির মধ্যে {total}টি মিলেছে',
    en: '{total} of {all} activities match',
  },
  'act.range': {
    bn: ' · {from}–{to} দেখানো হচ্ছে',
    en: ' · showing {from}–{to}',
  },
  'act.manageKinds': { bn: 'ধরন সাজান', en: 'Manage types' },

  // --- kinds of activity (super admin) ---
  'kind.pageTitle': {
    bn: 'কার্যক্রমের ধরন — কলমা সোশ্যাল ক্লাব',
    en: 'Activity types — Kalma Social Club',
  },
  'kind.title': { bn: 'কার্যক্রমের ধরন', en: 'Activity types' },
  'kind.lead': {
    bn: 'কার্যক্রম লেখার সময় এই তালিকা থেকে ধরন বাছাই করা হয়। নাম বদলালে সেই ধরনের সব কার্যক্রমে নতুন নাম দেখাবে।',
    en: 'Activities pick their type from this list. Renaming a type changes it on every activity of that type.',
  },
  'kind.add': { bn: 'নতুন ধরন', en: 'New type' },
  'kind.addTitle': { bn: 'নতুন ধরন যোগ করুন', en: 'Add a type' },
  'kind.editTitle': { bn: 'ধরন সম্পাদনা', en: 'Edit type' },
  'kind.nameBn': { bn: 'বাংলা নাম *', en: 'Bengali name *' },
  'kind.nameBnPh': { bn: 'যেমন: বৃক্ষরোপণ', en: 'Written in Bengali' },
  'kind.nameEn': { bn: 'ইংরেজি নাম *', en: 'English name *' },
  'kind.nameEnPh': { bn: 'যেমন: Tree planting', en: 'e.g. Tree planting' },
  'kind.nameEnNote': {
    bn: 'ওয়েবসাইটের ইংরেজি সংস্করণে আর নতুন কার্যক্রমের লিংকে এটা ব্যবহার হয়।',
    en: 'Used on the English site and in the links of new activities.',
  },
  'kind.errTaken': {
    bn: 'এই নামে আগেই একটি ধরন আছে।',
    en: 'A type with this name already exists.',
  },
  'kind.errSave': {
    bn: 'ধরন সংরক্ষণ করা গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।',
    en: 'Could not save the type. Check your internet and try again.',
  },
  'kind.used': { bn: '{n}টি কার্যক্রম', en: '{n} activities' },
  'kind.unused': { bn: 'কোনো কার্যক্রম নেই', en: 'No activities' },
  'kind.hidden': { bn: 'লুকানো', en: 'Hidden' },
  'kind.hide': { bn: 'লুকান', en: 'Hide' },
  'kind.show': { bn: 'আবার দেখান', en: 'Show again' },
  'kind.hiddenNote': {
    bn: 'লুকানো ধরন নতুন কার্যক্রমে বাছাই করা যায় না, তবে যেসব কার্যক্রমে আগে থেকে আছে সেগুলোতে থেকে যায়। যে ধরন কোনো কার্যক্রমে ব্যবহার হচ্ছে, সেটা মোছা যায় না, শুধু লুকানো যায়।',
    en: 'A hidden type cannot be picked for new activities, but stays on the ones that already have it. A type in use cannot be deleted, only hidden.',
  },
  'kind.deleteConfirm': {
    bn: '“{name}” ধরনটি মুছে ফেলবেন?',
    en: 'Delete the type “{name}”?',
  },
  'kind.inUse': {
    bn: 'এই ধরন কোনো কার্যক্রমে ব্যবহার হচ্ছে, তাই মোছা যাবে না। লুকিয়ে রাখতে পারেন।',
    en: 'This type is used by an activity, so it cannot be deleted. You can hide it.',
  },
  'kind.empty': {
    bn: 'এখনো কোনো ধরন যোগ হয়নি।',
    en: 'No types have been added yet.',
  },
  'kind.loadError': {
    bn: 'ধরনের তালিকা লোড করা গেল না।',
    en: 'Could not load the types.',
  },
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
  'act.fType': { bn: 'ধরন', en: 'Type' },
  'act.fTypeNone': { bn: 'বেছে নেওয়া হয়নি', en: 'Not chosen' },
  'act.fFeatured': {
    bn: 'হোমপেজের উপরে দেখান',
    en: 'Show at the top of the home page',
  },

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
  'gal.uploadActivity': {
    bn: 'নতুন ছবি কোন অনুষ্ঠানের',
    en: 'Activity for new photos',
  },
  'gal.noActivity': { bn: 'কোনো অনুষ্ঠান নয়', en: 'No activity' },
  'gal.photoActivity': {
    bn: 'এই ছবির অনুষ্ঠান',
    en: 'Activity for this photo',
  },
  'gal.activityError': {
    bn: 'অনুষ্ঠান বদলানো গেল না। আবার চেষ্টা করুন।',
    en: 'Could not change the activity. Please try again.',
  },
  'gal.filters': { bn: 'ছবি ছাঁকুন', en: 'Filter photos' },
  'gal.filterYear': { bn: 'বছর', en: 'Year' },
  'gal.filterMonth': { bn: 'মাস', en: 'Month' },
  'gal.filterActivity': { bn: 'অনুষ্ঠান', en: 'Activity' },
  'gal.filterAll': { bn: 'সব', en: 'All' },
  'gal.filterAllActivities': { bn: 'সব অনুষ্ঠান', en: 'All activities' },
  'gal.filterNoActivity': {
    bn: 'কোনো অনুষ্ঠানে যুক্ত নয়',
    en: 'Not in any activity',
  },
  'gal.filterClear': { bn: 'ফিল্টার মুছুন', en: 'Clear filters' },
  'gal.resultCount': { bn: '{n}টি ছবি।', en: '{n} photos.' },
  'gal.emptyFiltered': {
    bn: 'এই ফিল্টারে কোনো ছবি নেই।',
    en: 'No photos match these filters.',
  },
  'gal.selectPhoto': { bn: 'ছবিটি বাছাই করুন', en: 'Select this photo' },
  'gal.selectAll': { bn: 'সব বাছাই করুন', en: 'Select all' },
  'gal.selectNone': { bn: 'বাছাই বাতিল', en: 'Clear selection' },
  'gal.selectedCount': {
    bn: '{n}টি ছবি বাছাই করা হয়েছে',
    en: '{n} photos selected',
  },
  'gal.bulkLabel': {
    bn: 'বাছাই করা ছবির অনুষ্ঠান বদলান',
    en: 'Change the activity of the selected photos',
  },
  'gal.bulkMoveTo': { bn: 'যে অনুষ্ঠানে সরাবেন', en: 'Move to activity' },
  'gal.bulkMove': { bn: 'সরান', en: 'Move' },
  'gal.showMore': { bn: 'আরো দেখুন', en: 'Show more' },
  'gal.loadingMore': { bn: 'আনা হচ্ছে…', en: 'Loading…' },
  'gal.waiting': { bn: 'অপেক্ষায়', en: 'Waiting' },
  'gal.retry': { bn: 'আবার চেষ্টা', en: 'Try again' },
  'gal.dropHint': {
    bn: 'ছবিগুলো এখানে টেনে এনে ছেড়ে দিন, অথবা বোতাম চেপে বেছে নিন। একসাথে অনেকগুলো দেওয়া যায়।',
    en: 'Drag photos here, or use the button to choose them. You can add many at once.',
  },
  'gal.leaveWhileUploading': {
    bn: 'ছবি আপলোড এখনো চলছে। এখন বের হলে বাকি ছবিগুলো আপলোড হবে না। তবুও বের হবেন?',
    en: 'Photos are still uploading. If you leave now, the rest will not be uploaded. Leave anyway?',
  },
  'actPhotos.title': { bn: 'ছবি ({n}টি)', en: 'Photos ({n})' },
  'actPhotos.lead': {
    bn: 'এখানে দেওয়া ছবি এই কার্যক্রমের পেজে আর গ্যালারিতে দেখা যায়। ছবির সব পরিবর্তন সঙ্গে সঙ্গে সংরক্ষণ হয়, উপরের "সংরক্ষণ" চাপতে হয় না। তারকা চিহ্ন দিয়ে কভার ছবি বদলান।',
    en: "Photos added here appear on this activity's page and in the gallery. Photo changes save at once; there is no need to press Save above. Use the star to change the cover.",
  },
  'actPhotos.empty': {
    bn: 'এখনো কোনো ছবি নেই। প্রথম যে ছবিটি দেবেন, সেটিই কভার হবে।',
    en: 'No photos yet. The first photo you add becomes the cover.',
  },
  'actPhotos.cover': { bn: 'কভার', en: 'Cover' },
  'actPhotos.isCover': { bn: 'এটি কভার ছবি', en: 'This is the cover' },
  'actPhotos.makeCover': { bn: 'কভার করুন', en: 'Make cover' },
  'actPhotos.coverError': {
    bn: 'কভার বদলানো গেল না। আবার চেষ্টা করুন।',
    en: 'Could not change the cover. Please try again.',
  },
  'act.noPhotosYet': {
    bn: 'এই কার্যক্রমে এখনো কোনো ছবি নেই। নিচের "ছবি" অংশ থেকে যোগ করতে পারেন, পরে যোগ করলেও চলবে।',
    en: 'This activity has no photos yet. You can add them in "Photos" below, now or later.',
  },
  'act.photosAfterSave': {
    bn: 'সংরক্ষণের পর যে পেজ খুলবে, সেখানে ছবি যোগ করতে পারবেন।',
    en: 'You can add photos on the page that opens after saving.',
  },
  'act.viewPage': { bn: 'পেজটি দেখুন', en: 'View page' },
  'act.opensNewTab': { bn: '(নতুন ট্যাবে খুলবে)', en: '(opens in a new tab)' },
  'gal.deleteCoverConfirm': {
    bn: 'এটি একটি কার্যক্রমের কভার ছবি। মুছে ফেললে ওই কার্যক্রমের পরের ছবিটি কভার হবে, ছবি না থাকলে কভার ছাড়াই দেখাবে। ছবিটি স্থায়ীভাবে মুছে ফেলবেন?',
    en: "This photo is an activity's cover. If you delete it, that activity's next photo becomes the cover, or it shows without one. Delete this photo permanently?",
  },
  'gal.unfiledLabel': { bn: 'সাজানো বাকি', en: 'Still to sort' },
  'gal.unfiled': {
    bn: '{n}টি ছবি এখনো কোনো কার্যক্রমে যুক্ত নয়।',
    en: '{n} photos are not in any activity yet.',
  },
  'gal.unfiledShow': { bn: 'ছবিগুলো দেখুন', en: 'Show them' },
  'gal.openActivity': { bn: 'কার্যক্রম খুলুন →', en: 'Open activity →' },
  'dash.unfiledTitle': { bn: 'সাজানো বাকি ছবি', en: 'Photos to sort' },
  'dash.unfiled': {
    bn: '{n}টি ছবি এখনো কোনো কার্যক্রমে যুক্ত নয়।',
    en: '{n} photos are not in any activity yet.',
  },
  'dash.unfiledLink': {
    bn: 'গ্যালারিতে সাজান',
    en: 'Sort them in the gallery',
  },
  'memberPhoto.title': { bn: 'ছবি', en: 'Photo' },
  'memberPhoto.note': {
    bn: 'শুধু অ্যাডমিনরা দেখতে পান। ছবি সঙ্গে সঙ্গে সংরক্ষণ হয়।',
    en: 'Only admins can see it. The photo saves at once.',
  },
  'memberPhoto.add': { bn: 'ছবি দিন', en: 'Add photo' },
  'memberPhoto.replace': { bn: 'ছবি বদলান', en: 'Replace photo' },
  'memberPhoto.remove': { bn: 'ছবি সরান', en: 'Remove photo' },
  'memberPhoto.removeConfirm': {
    bn: 'সদস্যের ছবিটি স্থায়ীভাবে মুছে ফেলবেন?',
    en: "Delete this member's photo permanently?",
  },
  'memberPhoto.error': {
    bn: 'ছবি সংরক্ষণ করা গেল না। আবার চেষ্টা করুন।',
    en: 'Could not save the photo. Please try again.',
  },
  'memberPhoto.alt': { bn: '{name}-এর ছবি', en: 'Photo of {name}' },
  'memberPhoto.cropTitle': { bn: 'ছবিটি ঠিক করুন', en: 'Crop the photo' },
  'memberPhoto.cropHint': {
    bn: 'ছবিটি টেনে সরান, দরকারে জুম করুন। চৌকো ঘরের ভেতরের অংশটুকুই রাখা হবে।',
    en: 'Drag the photo and zoom if needed. Only the part inside the square is kept.',
  },
  'memberPhoto.cropArea': {
    bn: 'ছবি কাটার জায়গা। তীর-চিহ্নের বোতাম দিয়েও সরানো যায়।',
    en: 'Crop area. The arrow keys move the photo too.',
  },
  'memberPhoto.zoom': { bn: 'জুম', en: 'Zoom' },
  'memberPhoto.cropSave': { bn: 'ছবি সংরক্ষণ করুন', en: 'Save photo' },
  'gal.onHome': { bn: 'হোমপেজে দেখান', en: 'Show on homepage' },
  'gal.homeCount': {
    bn: 'হোমপেজের জন্য বাছাই: {n}/{max}। বাকি ঘরে সবচেয়ে নতুন ছবি দেখায়।',
    en: 'Picked for the homepage: {n}/{max}. Empty slots show the newest photos.',
  },
  'gal.homeFull': {
    bn: 'হোমপেজের জন্য {max}টা ছবি বাছাই হয়ে গেছে। আরেকটা দিতে আগে একটা বাদ দিন।',
    en: '{max} photos are already picked for the homepage. Unpick one first.',
  },
  'gal.homeError': {
    bn: 'হোমপেজের বাছাই সংরক্ষণ করা গেল না।',
    en: 'Could not save the homepage choice.',
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
  'csv.status': { bn: 'অবস্থা', en: 'Status' },
  'csv.willing': { bn: 'রক্তদানে আগ্রহী', en: 'Willing to donate' },
  'csv.lastDonation': { bn: 'সর্বশেষ রক্তদান', en: 'Last donation' },
  'csv.joined': { bn: 'যোগদানের তারিখ', en: 'Date joined' },
} satisfies Record<string, Entry>
