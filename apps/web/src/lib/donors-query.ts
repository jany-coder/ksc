import { z } from 'zod'

import { BLOOD_GROUPS } from './member-options.ts'

// The donor lookup's filters live in the URL (/admin/donors?blood=O-&ready=true)
// so a refresh, or a link sent to another admin, opens the same view. A bad
// value is dropped rather than shown as an error.
export const donorsSearchSchema = z.object({
  blood: z.enum(BLOOD_GROUPS).optional().catch(undefined),
  // Only those who may give blood now.
  ready: z.boolean().optional().catch(undefined),
})

export type DonorsSearch = z.infer<typeof donorsSearchSchema>
