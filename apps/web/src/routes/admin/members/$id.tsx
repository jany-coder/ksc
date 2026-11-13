import { useQueryClient } from '@tanstack/react-query'
import {
  Link,
  createFileRoute,
  notFound,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { MemberEditForm } from '../../../components/admin/member-edit-form.tsx'
import { langOfMatches } from '../../../lib/i18n/core.ts'
import type { HeadArgs } from '../../../lib/i18n/core.ts'
import { useT } from '../../../lib/i18n/index.tsx'
import { tFor } from '../../../lib/i18n/messages.ts'
import { memberToEditValues } from '../../../lib/member-form.ts'
import { getMemberFn, updateMemberFn } from '../../../lib/members.functions.ts'
import { can, canManageMember } from '../../../lib/permissions.ts'

export const Route = createFileRoute('/admin/members/$id')({
  head: ({ matches }: HeadArgs) => ({
    meta: [{ title: tFor(langOfMatches(matches))('memberEdit.pageTitle') }],
  }),
  beforeLoad: ({ context }) => {
    // The server function checks again; this just keeps people off the page.
    if (!can(context.member.role, 'members.write'))
      throw redirect({ to: '/admin/members' })
  },
  loader: async ({ params }) => {
    const member = await getMemberFn({ data: { id: params.id } })
    if (!member) throw notFound()
    return member
  },
  notFoundComponent: MemberNotFound,
  component: EditMemberPage,
})

function MemberNotFound() {
  const t = useT()
  return (
    <main className="px-4 py-6 md:p-6">
      <p className="mb-3">{t('memberEdit.notFound')}</p>
      <Link to="/admin/members" className="text-primary hover:underline">
        {t('memberNew.back')}
      </Link>
    </main>
  )
}

function EditMemberPage() {
  const t = useT()
  const member = Route.useLoaderData()
  const { member: actor } = Route.useRouteContext()
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Same rule the server applies (never yourself; only a super admin edits an
  // admin). The server function refuses it too: this just explains instead of
  // showing a form that would fail.
  const allowed = canManageMember(
    { id: actor.id, role: actor.role },
    { id: member.id, role: member.role },
  )

  return (
    <main className="px-4 py-6 md:p-6">
      <Link
        to="/admin/members"
        search={{ member: id }}
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t('memberNew.back')}
      </Link>
      <h1 className="text-2xl font-semibold">{t('memberEdit.title')}</h1>
      <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">
        {t('memberEdit.lead')}
      </p>

      {allowed ? (
        <MemberEditForm
          initial={memberToEditValues(member)}
          phone={member.phone}
          onSubmit={async (values) => {
            const result = await updateMemberFn({ data: { id, values } })
            if (!result.ok)
              return {
                ok: false,
                message:
                  result.code === 'NOT_FOUND'
                    ? t('memberEdit.gone')
                    : result.code === 'FORBIDDEN'
                      ? t('memberEdit.forbidden')
                      : t('a.invalidForm'),
              }
            await queryClient.invalidateQueries({ queryKey: ['members'] })
            // Back to the list with this member's drawer open, to see the result.
            await navigate({ to: '/admin/members', search: { member: id } })
            return { ok: true }
          }}
        />
      ) : (
        <p
          role="alert"
          className="mt-5 max-w-2xl rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {t('memberEdit.forbidden')}
        </p>
      )}
    </main>
  )
}
