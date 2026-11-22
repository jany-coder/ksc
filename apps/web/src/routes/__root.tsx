import type { QueryClient } from '@tanstack/react-query'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { getSavedTheme, themeClass } from '../lib/admin-theme.ts'
import { LangProvider } from '../lib/i18n/index.tsx'
import { langOfMatches, resolveLang } from '../lib/i18n/core.ts'
import type { HeadArgs } from '../lib/i18n/core.ts'
import { tFor } from '../lib/i18n/messages.ts'
import { getSavedLang } from '../lib/i18n/saved-lang.ts'
import { getSiteOrigin } from '../lib/site-origin.ts'
import appCss from '../styles.css?url'

// What every route's loader can reach through `context`.
export type RouterContext = { queryClient: QueryClient }

export const Route = createRootRouteWithContext<RouterContext>()({
  // The page's language, for <html lang> and for every text on it. Public pages
  // are decided by the URL (/en/...); admin and login by the saved choice.
  // Also the admin panel's light / dark class, decided here so the server
  // renders it (see lib/admin-theme.ts). Runs on every page change, so leaving
  // the admin panel drops it.
  beforeLoad: ({ location }) => {
    const theme = getSavedTheme() ?? 'light'
    return {
      lang: resolveLang(location.pathname, getSavedLang()),
      // For the absolute addresses in link previews (see lib/social.ts).
      origin: getSiteOrigin(),
      adminTheme: theme,
      themeClass: themeClass(location.pathname, theme),
    }
  },
  head: ({ matches }: HeadArgs) => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        // The default page title; most pages set their own.
        title: tFor(langOfMatches(matches))('site.name'),
      },
    ],
    // Marks the page as having JavaScript before anything is drawn, for
    // effects that should wait for it (the hero's typing line).
    scripts: [{ children: "document.documentElement.dataset.js=''" }],
    links: [
      { rel: 'icon', type: 'image/png', href: '/logo.png' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { lang, themeClass: theme } = Route.useRouteContext()
  return (
    // Browser extensions (Grammarly etc.) inject attributes onto <html> and
    // <body> before React hydrates. suppressHydrationWarning silences only
    // attribute mismatches on these two elements, not on their children.
    <html lang={lang} className={theme} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <LangProvider lang={lang}>{children}</LangProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
