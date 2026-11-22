import type { HeadArgs, Lang } from './i18n/core.ts'
import { tFor } from './i18n/messages.ts'

// Open Graph tags: what Facebook, WhatsApp and Messenger show when someone
// shares a link to the site. They need absolute addresses (https://…), which
// is why the root route puts the site's origin into every page's context.

/** The site's origin, from the root route's context (see __root.tsx). */
export function originOfMatches(matches: HeadArgs['matches']): string {
  for (const match of matches) {
    const origin = (match.context as { origin?: unknown } | undefined)?.origin
    if (typeof origin === 'string') return origin
  }
  return ''
}

export type SocialImage = {
  /** Site-relative, e.g. "/api/media/<id>/full". */
  path: string
  width?: number
  height?: number
}

/**
 * The tags for one page. `path` is the Bengali path ("" for the home page,
 * "/gallery"); the English page gets "/en" in front.
 */
export function socialMeta({
  origin,
  lang,
  path,
  title,
  description,
  image,
}: {
  origin: string
  lang: Lang
  path: string
  title: string
  description: string
  image?: SocialImage | null
}) {
  const t = tFor(lang)
  const url = `${origin}${lang === 'en' ? '/en' : ''}${path || (lang === 'en' ? '' : '/')}`
  return [
    { property: 'og:site_name', content: t('site.name') },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: lang === 'en' ? 'en_US' : 'bn_BD' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    ...(image
      ? [
          { property: 'og:image', content: `${origin}${image.path}` },
          ...(image.width && image.height
            ? [
                { property: 'og:image:width', content: String(image.width) },
                { property: 'og:image:height', content: String(image.height) },
              ]
            : []),
          { name: 'twitter:card', content: 'summary_large_image' },
        ]
      : []),
  ]
}
