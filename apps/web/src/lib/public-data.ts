import type { QueryClient } from '@tanstack/react-query'

/**
 * Data for a public page, kept in the query cache for a short while (the
 * QueryClient's staleTime, 30 seconds) and shared by both languages. None of
 * it depends on the language (texts in both are in the data), so switching
 * language, or coming back to a page, shows it at once instead of asking the
 * server again. Older than that, it is fetched afresh.
 *
 * The cache filled while the server renders the page is sent to the browser
 * with it, so even the first switch needs no request.
 */
export function publicData<T>(
  queryClient: QueryClient,
  key: readonly unknown[],
  fetch: () => Promise<T>,
): Promise<T> {
  return queryClient.fetchQuery({
    queryKey: ['public', ...key],
    queryFn: fetch,
  })
}
