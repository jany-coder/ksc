import { useQueryClient } from '@tanstack/react-query'
import {
  Link,
  createFileRoute,
  notFound,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useState } from 'react'

import { NoticeForm } from '../../../components/admin/notice-form.tsx'
import { Button } from '../../../components/ui/button.tsx'
import {
  deleteNoticeFn,
  getNoticeFn,
  updateNoticeFn,
} from '../../../lib/notices.functions.ts'
import { useT } from '../../../lib/i18n/index.tsx'
import { langOfMatches } from '../../../lib/i18n/core.ts'
import type { HeadArgs } from '../../../lib/i18n/core.ts'
import { tFor } from '../../../lib/i18n/messages.ts'
import { can } from '../../../lib/permissions.ts'

export const Route = createFileRoute('/admin/notices/$id')({
  head: ({ matches }: HeadArgs) => ({
    meta: [{ title: tFor(langOfMatches(matches))('not.editPageTitle') }],
  }),
  beforeLoad: ({ context }) => {
    // The server functions check again; this just keeps people off the page.
    if (!can(context.member.role, 'content.write'))
      throw redirect({ to: '/admin' })
  },
  loader: async ({ params }) => {
    const notice = await getNoticeFn({ data: { id: params.id } })
    if (!notice) throw notFound()
    return notice
  },
  notFoundComponent: NoticeNotFound,
  component: EditNoticePage,
})

function NoticeNotFound() {
  const t = useT()
  return (
    <main className="px-4 py-6 md:p-6">
      <p className="mb-3">{t('not.notFound')}</p>
      <Link to="/admin/notices" className="text-primary hover:underline">
        {t('not.backToList')}
      </Link>
    </main>
  )
}

function EditNoticePage() {
  const t = useT()
  const notice = Route.useLoaderData()
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
      await deleteNoticeFn({ data: { id } })
      await queryClient.invalidateQueries({ queryKey: ['notices'] })
      await navigate({ to: '/admin/notices' })
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
        <Link to="/admin/notices" className="hover:text-foreground">
          {t('not.title')}
        </Link>
        <span className="mx-1.5 text-zinc-300" aria-hidden="true">
          /
        </span>
        <span className="text-foreground">{t('a.edit')}</span>
      </nav>
      <h1 className="text-2xl font-semibold">{t('not.editTitle')}</h1>

      <NoticeForm
        initial={notice}
        submitLabel={t('a.save')}
        onSubmit={async (values) => {
          const result = await updateNoticeFn({ data: { id, values } })
          if (!result.ok)
            return {
              ok: false,
              message:
                result.code === 'NOT_FOUND'
                  ? t('not.gone')
                  : t('a.invalidForm'),
            }
          await queryClient.invalidateQueries({ queryKey: ['notices'] })
          await navigate({ to: '/admin/notices' })
          return { ok: true }
        }}
        extra={
          <section className="rounded-[10px] border border-red-200 bg-card p-5">
            <h2 className="mb-2 text-[15px] font-semibold">
              {t('not.deleteTitle')}
            </h2>
            {deleteError && (
              <p role="alert" className="mb-2 text-sm text-red-700">
                {deleteError}
              </p>
            )}
            {confirming ? (
              <>
                <p className="mb-2.5 text-sm text-red-800">
                  {t('not.deleteConfirm')}
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
