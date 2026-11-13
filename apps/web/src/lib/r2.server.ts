import '@tanstack/react-start/server-only'

import { env } from 'cloudflare:workers'

// The R2 bucket for gallery photos, bound in wrangler.jsonc as IMAGES.
// A binding is Cloudflare handing the Worker a ready-made connection to the
// bucket: no access keys, nothing to leak or rotate.
export const imagesBucket: R2BucketLike = env.IMAGES
