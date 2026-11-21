import { z } from 'zod'

// The admin gallery's filters, kept in the URL (?year=2025&month=3, or
// ?activity=<id> / ?activity=none) so a filtered view survives a reload and
// can be shared. Shared by the page and the server, so both read it the same.
//
// A photo's date is its activity's date, not its upload date: old photos are
// being uploaded now, so upload dates would put them all in one month.
//
// .catch(undefined): a hand-edited or stale URL drops that filter instead of
// showing an error page.
export const galleryFilterSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional().catch(undefined),
  month: z.coerce.number().int().min(1).max(12).optional().catch(undefined),
  activity: z
    .union([z.literal('none'), z.uuid()])
    .optional()
    .catch(undefined),
})

export type GalleryFilter = z.infer<typeof galleryFilterSchema>

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * The [from, to) date range for a year, or a month of it, as "YYYY-MM-DD" text
 * (Postgres compares `date` columns with that text directly). A month without
 * a year means nothing, so it gives null.
 */
export function dateRange(
  year: number | undefined,
  month: number | undefined,
): { from: string; to: string } | null {
  if (year === undefined) return null
  if (month === undefined)
    return { from: `${year}-01-01`, to: `${year + 1}-01-01` }
  const nextYear = month === 12 ? year + 1 : year
  const nextMonth = month === 12 ? 1 : month + 1
  return {
    from: `${year}-${pad(month)}-01`,
    to: `${nextYear}-${pad(nextMonth)}-01`,
  }
}

// The public gallery takes only a year (?year=2025): visitors look for an
// event, and the club is young enough that months would be overkill.
export const publicGallerySearchSchema = z.object({
  year: galleryFilterSchema.shape.year,
})

export type PublicGallerySearch = z.infer<typeof publicGallerySearchSchema>

// A public gallery photo. activityTitle and activityDate are set only when the
// photo's activity is published: a draft's title must not reach the public.
export type PublicGalleryPhoto = {
  id: string
  width: number
  height: number
  caption: string | null
  activityId: string | null
  activityTitle: string | null
  activityDate: string | null
}

export type PhotoGroup = {
  // The activity id, or 'other' for photos with no published activity.
  key: string
  title: string | null
  date: string | null
  // Each photo with its place in the whole list, for the lightbox.
  photos: { photo: PublicGalleryPhoto; index: number }[]
}

/**
 * Splits the photos into one group per activity, keeping the server's order
 * (newest activity first). Photos with no published activity go into one
 * "other" group at the end.
 */
export function groupPhotos(photos: PublicGalleryPhoto[]): PhotoGroup[] {
  const groups = new Map<string, PhotoGroup>()
  const other: PhotoGroup = {
    key: 'other',
    title: null,
    date: null,
    photos: [],
  }
  photos.forEach((photo, index) => {
    if (photo.activityId === null || photo.activityTitle === null) {
      other.photos.push({ photo, index })
      return
    }
    let group = groups.get(photo.activityId)
    if (!group) {
      group = {
        key: photo.activityId,
        title: photo.activityTitle,
        date: photo.activityDate,
        photos: [],
      }
      groups.set(photo.activityId, group)
    }
    group.photos.push({ photo, index })
  })
  const list = [...groups.values()]
  return other.photos.length > 0 ? [...list, other] : list
}
