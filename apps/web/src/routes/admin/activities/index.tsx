import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { ActivitiesTable } from '../../../components/admin/activities-table.tsx'
import { buttonVariants } from '../../../components/ui/button.tsx'
import { listActivitiesFn } from '../../../lib/activities.functions.ts'
import { can } from '../../../lib/permissions.ts'

const activitiesQuery = () =>
  queryOptions({
    queryKey: ['activities', 'list'],
    queryFn: () => listActivitiesFn(),
  })

export const Route = createFileRoute('/admin/activities/')({
  head: () => ({ meta: [{ title: 'কার্যক্রম — কলমা সোশ্যাল ক্লাব' }] }),
  beforeLoad: ({ context }) => {
    // Keeps people off the page; the server function checks the permission too.
    if (!can(context.member.role, 'content.write'))
      throw redirect({ to: '/admin' })
  },
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(activitiesQuery()),
  errorComponent: () => (
    <main className="px-4 py-6 md:p-6">
      <p role="alert" className="text-red-700">
        কার্যক্রমের তালিকা লোড করা গেল না। পাতাটি রিফ্রেশ করে দেখুন।
      </p>
    </main>
  ),
  component: ActivitiesPage,
})

function ActivitiesPage() {
  const { data: rows } = useSuspenseQuery(activitiesQuery())

  return (
    <main className="flex flex-col gap-4 px-4 py-6 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-0.5 text-2xl font-semibold">কার্যক্রম</h1>
          <p className="text-sm text-muted-foreground">
            প্রকাশিত কার্যক্রম ওয়েবসাইটের হোমপেজে দেখা যায়। খসড়া শুধু অ্যাডমিন দেখতে
            পান।
          </p>
        </div>
        <Link to="/admin/activities/new" className={buttonVariants()}>
          <Plus aria-hidden="true" />
          নতুন কার্যক্রম
        </Link>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-border bg-card">
        {rows.length > 0 ? (
          <ActivitiesTable rows={rows} />
        ) : (
          <p className="px-4 py-10 text-center text-muted-foreground">
            এখনো কোনো কার্যক্রম যোগ হয়নি।
          </p>
        )}
      </div>
    </main>
  )
}
