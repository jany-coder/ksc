import { useQueryClient } from '@tanstack/react-query'
import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

import { ActivityForm } from '../../../components/admin/activity-form.tsx'
import { createActivityFn } from '../../../lib/activities.functions.ts'
import type { ActivityFormInput } from '../../../lib/activity-form.ts'
import { listPublicImagesFn } from '../../../lib/images.functions.ts'
import { can } from '../../../lib/permissions.ts'

export const Route = createFileRoute('/admin/activities/new')({
  head: () => ({ meta: [{ title: 'নতুন কার্যক্রম — কলমা সোশ্যাল ক্লাব' }] }),
  beforeLoad: ({ context }) => {
    // The server function checks again; this just keeps people off the page.
    if (!can(context.member.role, 'content.write'))
      throw redirect({ to: '/admin' })
  },
  // The gallery photos the cover can be picked from.
  loader: () => listPublicImagesFn({ data: { limit: 100 } }),
  component: NewActivityPage,
})

const EMPTY: ActivityFormInput = {
  title: '',
  description: '',
  category: '',
  eventDate: '',
  eventTime: '',
  location: '',
  status: 'draft',
  featured: false,
  coverImageId: '',
}

function NewActivityPage() {
  const photos = Route.useLoaderData()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return (
    <main className="px-4 py-6 md:p-6">
      <nav aria-label="পথ" className="mb-3 text-sm text-muted-foreground">
        <Link to="/admin/activities" className="hover:text-foreground">
          কার্যক্রম
        </Link>
        <span className="mx-1.5 text-zinc-300" aria-hidden="true">
          /
        </span>
        <span className="text-foreground">নতুন</span>
      </nav>
      <h1 className="text-2xl font-semibold">নতুন কার্যক্রম</h1>

      <ActivityForm
        initial={EMPTY}
        photos={photos}
        onSubmit={async (values) => {
          const result = await createActivityFn({ data: values })
          if (!result.ok)
            return { ok: false, message: 'তথ্য ঠিক নেই। ফর্মটি আবার দেখে নিন।' }
          // Cached lists would not show the new activity until they expire.
          await queryClient.invalidateQueries({ queryKey: ['activities'] })
          await navigate({ to: '/admin/activities' })
          return { ok: true }
        }}
      />
    </main>
  )
}
