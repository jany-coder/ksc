import type { QueryClient } from '@tanstack/react-query'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { LangProvider } from '../lib/i18n/index.tsx'
import { resolveLang } from '../lib/i18n/core.ts'
import { getSavedLang } from '../lib/i18n/saved-lang.ts'
import appCss from '../styles.css?url'

// What every route's loader can reach through `context`.
export type RouterContext = { queryClient: QueryClient }

export const Route = createRootRouteWithContext<RouterContext>()({
  // The page's language, for <html lang> and for every text on it. Public pages
  // are decided by the URL (/en/...); admin and login by the saved choice.
  beforeLoad: ({ location }) => ({
    lang: resolveLang(location.pathname, getSavedLang()),
  }),
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'কলমা সোশ্যাল ক্লাব',
      },
    ],
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
        href: 'https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@500;600;700&family=Hind+Siliguri:wght@400;500;600;700&display=swap',
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
  const { lang } = Route.useRouteContext()
  return (
    // Browser extensions (Grammarly etc.) inject attributes onto <html> and
    // <body> before React hydrates. suppressHydrationWarning silences only
    // attribute mismatches on these two elements, not on their children.
    <html lang={lang} suppressHydrationWarning>
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
