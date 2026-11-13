import {
  Link,
  createRouter as createTanStackRouter,
} from '@tanstack/react-router'
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
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: NotFound,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
