import { z } from 'zod'

// The "new notice" form, shared by the browser and the server.
export const NOTICE_STATUSES = ['draft', 'published'] as const
export const NOTICE_STATUS_LABEL = {
  draft: 'খসড়া',
  published: 'প্রকাশিত',
} as const

export const noticeFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'শিরোনাম লিখুন')
    .max(150, 'শিরোনাম অনেক বেশি লম্বা'),
  body: z
    .string()
    .trim()
    .min(1, 'নোটিশের বিবরণ লিখুন')
    .max(2000, 'বিবরণ অনেক বেশি লম্বা'),
  urgent: z.boolean(),
  status: z.enum(NOTICE_STATUSES),
})

export type NoticeFormInput = z.infer<typeof noticeFormSchema>
