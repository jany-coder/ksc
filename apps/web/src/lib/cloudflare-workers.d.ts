// The part of Cloudflare's runtime types this app uses. Declared by hand instead
// of installing @cloudflare/workers-types, whose global types clash with the
// browser (DOM) types the rest of the app relies on.
// `cloudflare:workers` only exists inside the Worker runtime: import it from
// server-only files (see r2.server.ts), never from code that tests or the
// browser load.
interface R2ObjectBodyLike {
  body: ReadableStream
  httpEtag: string
  size: number
}

interface R2BucketLike {
  put: (
    key: string,
    value: ArrayBuffer,
    options?: {
      httpMetadata?: { contentType?: string; cacheControl?: string }
    },
  ) => Promise<unknown>
  get: (key: string) => Promise<R2ObjectBodyLike | null>
  delete: (keys: string | string[]) => Promise<void>
}

declare module 'cloudflare:workers' {
  // Names match the bindings in wrangler.jsonc.
  export const env: { IMAGES: R2BucketLike }
}
