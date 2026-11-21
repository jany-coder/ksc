import { useQueryClient } from '@tanstack/react-query'
import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

import { ActivityForm } from '../../../components/admin/activity-form.tsx'
import { categoriesQuery } from '../../../components/admin/category-dialog.tsx'
import { createActivityFn } from '../../../lib/activities.functions.ts'
import type { ActivityFormInput } from '../../../lib/activity-form.ts'
import { useT } from '../../../lib/i18n/index.tsx'
import { langOfMatches } from '../../../lib/i18n/core.ts'
import type { HeadArgs } from '../../../lib/i18n/core.ts'
import { tFor } from '../../../lib/i18n/messages.ts'
import { can } from '../../../lib/permissions.ts'

export const Route = createFileRoute('/admin/activities/new')({
  head: ({ matches }: HeadArgs) => ({
    meta: [{ title: tFor(langOfMatches(matches))('act.newPageTitle') }],
  }),
  beforeLoad: ({ context }) => {
    // The server function checks again; this just keeps people off the page.
    if (!can(context.member.role, 'content.write'))
      throw redirect({ to: '/admin' })
  },
  // The kinds for the form's "Type" list.
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(categoriesQuery()),
  component: NewActivityPage,
})

const EMPTY: ActivityFormInput = {
  title: '',
  description: '',
  categoryId: '',
  eventDate: '',
  eventTime: '',
  location: '',
  status: 'draft',
  featured: false,
}

function NewActivityPage() {
  const t = useT()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { member } = Route.useRouteContext()

  return (
    <main className="px-4 py-6 md:p-6">
      <nav
        aria-label={t('a.breadcrumb')}
        className="mb-3 text-sm text-muted-foreground"
      >
        <Link to="/admin/activities" className="hover:text-foreground">
          {t('act.title')}
        </Link>
        <span className="mx-1.5 text-zinc-300" aria-hidden="true">
          /
        </span>
        <span className="text-foreground">{t('a.new')}</span>
      </nav>
      <h1 className="text-2xl font-semibold">{t('act.add')}</h1>

      <ActivityForm
        initial={EMPTY}
        photoCount={null}
        canManageKinds={can(member.role, 'categories.manage')}
        onSubmit={async (values) => {
          const result = await createActivityFn({ data: values })
          if (!result.ok) return { ok: false, message: t('a.invalidForm') }
          // Cached lists would not show the new activity until they expire.
          await queryClient.invalidateQueries({ queryKey: ['activities'] })
          // Straight on to its edit page, where its photos are added.
          await navigate({
            to: '/admin/activities/$id',
            params: { id: result.id },
          })
          return { ok: true }
        }}
      />
    </main>
  )
}
