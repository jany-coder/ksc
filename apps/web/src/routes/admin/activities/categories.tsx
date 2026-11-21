import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import {
  CategoryDialog,
  categoriesQuery,
} from '../../../components/admin/category-dialog.tsx'
import { Button } from '../../../components/ui/button.tsx'
import {
  deleteCategoryFn,
  updateCategoryFn,
} from '../../../lib/activity-categories.functions.ts'
import type { ActivityCategory } from '../../../lib/activity-category.ts'
import { useNumber, useT } from '../../../lib/i18n/index.tsx'
import { langOfMatches } from '../../../lib/i18n/core.ts'
import type { HeadArgs } from '../../../lib/i18n/core.ts'
import { tFor } from '../../../lib/i18n/messages.ts'
import { can } from '../../../lib/permissions.ts'

// The kinds of activity: add, rename, hide, delete. Super admin only; the
// server functions check the same permission.
export const Route = createFileRoute('/admin/activities/categories')({
  head: ({ matches }: HeadArgs) => ({
    meta: [{ title: tFor(langOfMatches(matches))('kind.pageTitle') }],
  }),
  beforeLoad: ({ context }) => {
    if (!can(context.member.role, 'categories.manage'))
      throw redirect({ to: '/admin/activities' })
  },
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(categoriesQuery()),
  errorComponent: KindsError,
  component: KindsPage,
})

function KindsError() {
  const t = useT()
  return (
    <main className="px-4 py-6 md:p-6">
      <p role="alert" className="text-red-700">
        {t('kind.loadError')}
      </p>
    </main>
  )
}

function KindsPage() {
  const t = useT()
  const { data: kinds } = useSuspenseQuery(categoriesQuery())
  // null: closed; 'new': adding; a kind: renaming it.
  const [dialog, setDialog] = useState<'new' | ActivityCategory | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <main className="flex flex-col gap-4 px-4 py-6 md:p-6">
      <nav
        aria-label={t('a.breadcrumb')}
        className="text-sm text-muted-foreground"
      >
        <Link to="/admin/activities" className="hover:text-foreground">
          {t('act.title')}
        </Link>
        <span className="mx-1.5 text-zinc-300" aria-hidden="true">
          /
        </span>
        <span className="text-foreground">{t('kind.title')}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-0.5 text-2xl font-semibold">{t('kind.title')}</h1>
          <p className="max-w-[640px] text-sm text-muted-foreground">
            {t('kind.lead')}
          </p>
        </div>
        <Button type="button" onClick={() => setDialog('new')}>
          <Plus aria-hidden="true" />
          {t('kind.add')}
        </Button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="max-w-[760px] overflow-hidden rounded-[10px] border border-border bg-card">
        {kinds.length > 0 ? (
          <ul className="divide-y divide-zinc-100">
            {kinds.map((kind) => (
              <KindRow
                key={kind.id}
                kind={kind}
                onEdit={() => setDialog(kind)}
                onError={setError}
              />
            ))}
          </ul>
        ) : (
          <p className="px-4 py-10 text-center text-muted-foreground">
            {t('kind.empty')}
          </p>
        )}
      </div>
      <p className="max-w-[760px] text-[13px] text-muted-foreground">
        {t('kind.hiddenNote')}
      </p>

      {dialog && (
        <CategoryDialog
          {...(dialog === 'new' ? {} : { editing: dialog })}
          onClose={() => setDialog(null)}
        />
      )}
    </main>
  )
}

function KindRow({
  kind,
  onEdit,
  onError,
}: {
  kind: ActivityCategory
  onEdit: () => void
  onError: (message: string | null) => void
}) {
  const t = useT()
  const number = useNumber()
  const queryClient = useQueryClient()
  const [busy, setBusy] = useState(false)

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['activity-categories'] }),
      queryClient.invalidateQueries({ queryKey: ['activities'] }),
    ])
  }

  async function toggleHidden() {
    setBusy(true)
    onError(null)
    try {
      const result = await updateCategoryFn({
        data: {
          id: kind.id,
          values: { nameBn: kind.nameBn, nameEn: kind.nameEn },
          hidden: !kind.hidden,
        },
      })
      if (!result.ok) onError(t('kind.errSave'))
      await refresh()
    } catch {
      onError(t('kind.errSave'))
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!window.confirm(t('kind.deleteConfirm', { name: kind.nameBn }))) return
    setBusy(true)
    onError(null)
    try {
      const result = await deleteCategoryFn({ data: { id: kind.id } })
      // Someone used it in the meantime: the database refused.
      if (!result.ok && result.code === 'IN_USE') onError(t('kind.inUse'))
      await refresh()
    } catch {
      onError(t('a.deleteFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
      <div className="min-w-0 grow">
        <p className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{kind.nameBn}</span>
          {kind.hidden && (
            <span className="rounded-[5px] border border-border bg-secondary px-1.5 py-px text-[11px] font-semibold text-zinc-600">
              {t('kind.hidden')}
            </span>
          )}
        </p>
        <p className="text-[13px] text-muted-foreground">
          <span lang="en">{kind.nameEn}</span>
          {' · '}
          {kind.activityCount > 0
            ? t('kind.used', { n: number(kind.activityCount) })
            : t('kind.unused')}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 sm:h-8"
          disabled={busy}
          onClick={onEdit}
        >
          <Pencil aria-hidden="true" />
          {t('a.edit')}
          <span className="sr-only">: {kind.nameBn}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 sm:h-8"
          disabled={busy}
          onClick={() => void toggleHidden()}
        >
          {kind.hidden ? (
            <Eye aria-hidden="true" />
          ) : (
            <EyeOff aria-hidden="true" />
          )}
          {kind.hidden ? t('kind.show') : t('kind.hide')}
          <span className="sr-only">: {kind.nameBn}</span>
        </Button>
        {/* Only a kind no activity uses can go; the others are hidden instead. */}
        {kind.activityCount === 0 && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="h-10 sm:h-8"
            disabled={busy}
            onClick={() => void remove()}
          >
            <Trash2 aria-hidden="true" />
            {t('a.delete')}
            <span className="sr-only">: {kind.nameBn}</span>
          </Button>
        )}
      </div>
    </li>
  )
}
