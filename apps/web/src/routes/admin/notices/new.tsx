import { useQueryClient } from '@tanstack/react-query'
import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

import { NoticeForm } from '../../../components/admin/notice-form.tsx'
import type { NoticeFormInput } from '../../../lib/notice-form.ts'
import { createNoticeFn } from '../../../lib/notices.functions.ts'
import { useT } from '../../../lib/i18n/index.tsx'
import { langOfMatches } from '../../../lib/i18n/core.ts'
import type { HeadArgs } from '../../../lib/i18n/core.ts'
import { tFor } from '../../../lib/i18n/messages.ts'
import { can } from '../../../lib/permissions.ts'

export const Route = createFileRoute('/admin/notices/new')({
  head: ({ matches }: HeadArgs) => ({
    meta: [{ title: tFor(langOfMatches(matches))('not.newPageTitle') }],
  }),
  beforeLoad: ({ context }) => {
    // The server function checks again; this just keeps people off the page.
    if (!can(context.member.role, 'content.write'))
      throw redirect({ to: '/admin' })
  },
  component: NewNoticePage,
})

const EMPTY: NoticeFormInput = {
  title: '',
  body: '',
  urgent: false,
  status: 'draft',
}

function NewNoticePage() {
  const t = useT()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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
        <span className="text-foreground">{t('a.new')}</span>
      </nav>
      <h1 className="text-2xl font-semibold">{t('not.add')}</h1>

      <NoticeForm
        initial={EMPTY}
        onSubmit={async (values) => {
          const result = await createNoticeFn({ data: values })
          if (!result.ok) return { ok: false, message: t('a.invalidForm') }
          // Cached lists would not show the new notice until they expire.
          await queryClient.invalidateQueries({ queryKey: ['notices'] })
          await navigate({ to: '/admin/notices' })
          return { ok: true }
        }}
      />
    </main>
  )
}
