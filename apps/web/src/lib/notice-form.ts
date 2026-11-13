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
    .min(1, 'val.titleRequired')
    .max(150, 'val.titleTooLong'),
  body: z
    .string()
    .trim()
    .min(1, 'val.bodyRequired')
    .max(2000, 'val.descriptionTooLong'),
  urgent: z.boolean(),
  status: z.enum(NOTICE_STATUSES),
})

export type NoticeFormInput = z.infer<typeof noticeFormSchema>
