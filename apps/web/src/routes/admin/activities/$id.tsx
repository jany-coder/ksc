import { useQueryClient } from '@tanstack/react-query'
import {
  Link,
  createFileRoute,
  notFound,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useState } from 'react'

import { ActivityForm } from '../../../components/admin/activity-form.tsx'
import { Button } from '../../../components/ui/button.tsx'
import {
  deleteActivityFn,
  getActivityFn,
  updateActivityFn,
} from '../../../lib/activities.functions.ts'
import { listPublicImagesFn } from '../../../lib/images.functions.ts'
import { useT } from '../../../lib/i18n/index.tsx'
import { langOfMatches } from '../../../lib/i18n/core.ts'
import type { HeadArgs } from '../../../lib/i18n/core.ts'
import { tFor } from '../../../lib/i18n/messages.ts'
import { can } from '../../../lib/permissions.ts'

export const Route = createFileRoute('/admin/activities/$id')({
  head: ({ matches }: HeadArgs) => ({
    meta: [{ title: tFor(langOfMatches(matches))('act.editPageTitle') }],
  }),
  beforeLoad: ({ context }) => {
    // The server functions check again; this just keeps people off the page.
    if (!can(context.member.role, 'content.write'))
      throw redirect({ to: '/admin' })
  },
  loader: async ({ params }) => {
    const [activity, photos] = await Promise.all([
      getActivityFn({ data: { id: params.id } }),
      listPublicImagesFn({ data: { limit: 100 } }),
    ])
    if (!activity) throw notFound()
    return { activity, photos }
  },
  notFoundComponent: ActivityNotFound,
  component: EditActivityPage,
})

function ActivityNotFound() {
  const t = useT()
  return (
    <main className="px-4 py-6 md:p-6">
      <p className="mb-3">{t('act.notFound')}</p>
      <Link to="/admin/activities" className="text-primary hover:underline">
        {t('act.backToList')}
      </Link>
    </main>
  )
}

function EditActivityPage() {
  const t = useT()
  const { activity, photos } = Route.useLoaderData()
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function remove() {
    setDeleting(true)
    setDeleteError(null)
    try {
      // "Not found" means it is already gone, which is the outcome we wanted.
      await deleteActivityFn({ data: { id } })
      await queryClient.invalidateQueries({ queryKey: ['activities'] })
      await navigate({ to: '/admin/activities' })
    } catch {
      setDeleteError(t('a.deleteFailed'))
      setDeleting(false)
      setConfirming(false)
    }
  }

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
        <span className="text-foreground">{t('a.edit')}</span>
      </nav>
      <h1 className="text-2xl font-semibold">{t('act.editTitle')}</h1>

      <ActivityForm
        initial={activity}
        photos={photos}
        submitLabel={t('a.save')}
        onSubmit={async (values) => {
          const result = await updateActivityFn({ data: { id, values } })
          if (!result.ok)
            return {
              ok: false,
              message:
                result.code === 'NOT_FOUND'
                  ? t('act.gone')
                  : t('a.invalidForm'),
            }
          await queryClient.invalidateQueries({ queryKey: ['activities'] })
          await navigate({ to: '/admin/activities' })
          return { ok: true }
        }}
        extra={
          <section className="rounded-[10px] border border-red-200 bg-card p-5">
            <h2 className="mb-2 text-[15px] font-semibold">
              {t('act.deleteTitle')}
            </h2>
            {deleteError && (
              <p role="alert" className="mb-2 text-sm text-red-700">
                {deleteError}
              </p>
            )}
            {confirming ? (
              <>
                <p className="mb-2.5 text-sm text-red-800">
                  {t('act.deleteConfirm')}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={deleting}
                    onClick={() => void remove()}
                  >
                    {t('a.yesDelete')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={deleting}
                    onClick={() => setConfirming(false)}
                  >
                    {t('a.no')}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-2.5 text-[13px] text-muted-foreground">
                  {t('a.hideInstead')}
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setConfirming(true)}
                >
                  {t('a.delete')}
                </Button>
              </>
            )}
          </section>
        }
      />
    </main>
  )
}
