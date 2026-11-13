import { QueryClient } from '@tanstack/react-query'
import {
  Link,
  createRouter as createTanStackRouter,
} from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'

// Shown for any URL that matches no route. Without this the router falls back
// to a bare <p>Not Found</p> and logs a warning on every miss.
function NotFound() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">পাতাটি পাওয়া যায়নি</h1>
      <p className="mt-4 text-lg">
        <Link to="/" className="underline">
          হোম পেজে ফিরে যান
        </Link>
      </p>
    </main>
  )
}

export function getRouter() {
  // A NEW QueryClient for every call. On the server that means one per request,
  // so one admin's cached member list can never be served to another admin.
  // Never hoist this to module scope.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000 } },
  })

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: NotFound,
  })

  // Data fetched on the server is sent to the browser with the page and reused
  // there, instead of being fetched a second time. Also wraps the app in
  // QueryClientProvider.
  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
