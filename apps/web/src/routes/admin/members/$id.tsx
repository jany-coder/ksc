import { useQueryClient } from '@tanstack/react-query'
import {
  Link,
  createFileRoute,
  notFound,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { ChangePhoneForm } from '../../../components/admin/change-phone-form.tsx'
import { MemberEditForm } from '../../../components/admin/member-edit-form.tsx'
import { MemberPhotoEditor } from '../../../components/admin/member-photo.tsx'
import { langOfMatches } from '../../../lib/i18n/core.ts'
import type { HeadArgs } from '../../../lib/i18n/core.ts'
import { useLang, useT } from '../../../lib/i18n/index.tsx'
import { formatDate } from '../../../lib/datetime.ts'
import type { MemberStatus } from '../../../lib/member-options.ts'
import type { Role } from '../../../lib/permissions.ts'
import {
  RoleBadge,
  StatusBadge,
} from '../../../components/admin/member-status.tsx'
import { tFor } from '../../../lib/i18n/messages.ts'
import { memberToEditValues } from '../../../lib/member-form.ts'
import {
  changeMemberPhoneFn,
  getMemberFn,
  updateMemberFn,
} from '../../../lib/members.functions.ts'
import { can } from '../../../lib/permissions.ts'

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
  const router = useRouter()

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
      <p className="mt-0.5 max-w-3xl text-sm text-muted-foreground">
        {t('memberEdit.lead')}
      </p>

      {/* Phone: one column, photo and summary first. Wide screens: the form
          on the left, photo and summary in a side panel that stays in view. */}
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:order-2">
          <MemberPhotoEditor
            memberId={id}
            name={member.name}
            photoUrl={member.photoUrl}
            onChanged={async () => {
              // Reload this page's member (new photo URL) and the drawer's copy.
              await router.invalidate()
              await queryClient.invalidateQueries({ queryKey: ['members'] })
            }}
          />
          <MemberSummary member={member} />
        </aside>
        <div className="flex min-w-0 flex-col gap-5 lg:order-1">
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
                      : t('a.invalidForm'),
                }
              await queryClient.invalidateQueries({ queryKey: ['members'] })
              // Back to the list with this member's drawer open, to see the result.
              await navigate({ to: '/admin/members', search: { member: id } })
              return { ok: true }
            }}
          />
          {can(actor.role, 'members.changePhone') && member.id !== actor.id && (
            <ChangePhoneForm
              onSubmit={async (phone) => {
                const result = await changeMemberPhoneFn({
                  data: { id, phone },
                })
                if (!result.ok)
                  return {
                    ok: false,
                    message:
                      result.code === 'PHONE_TAKEN'
                        ? t('memberEdit.phoneTaken')
                        : result.code === 'NOT_FOUND'
                          ? t('memberEdit.gone')
                          : t('memberEdit.phoneInvalid'),
                  }
                await queryClient.invalidateQueries({ queryKey: ['members'] })
                await router.invalidate()
                return { ok: true }
              }}
            />
          )}
        </div>
      </div>
    </main>
  )
}

/** Status, role and the membership dates, at a glance. */
function MemberSummary({
  member,
}: {
  member: {
    status: MemberStatus
    role: Role
    joinedDate: string
    consentDate: string
    hasLogin: boolean
  }
}) {
  const t = useT()
  const lang = useLang()
  return (
    <section
      aria-labelledby="member-summary"
      className="rounded-[10px] border border-border bg-card p-4 sm:p-5"
    >
      <h2 id="member-summary" className="mb-3 text-[15px] font-semibold">
        {t('drawer.sectionMembership')}
      </h2>
      <div className="mb-3 flex flex-wrap gap-1.5">
        <StatusBadge status={member.status} />
        <RoleBadge role={member.role} />
      </div>
      <dl className="m-0 grid grid-cols-2 gap-3 text-sm lg:grid-cols-1">
        <div>
          <dt className="text-xs text-muted-foreground">
            {t('drawer.joined')}
          </dt>
          <dd className="m-0">{formatDate(member.joinedDate, lang)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            {t('drawer.consent')}
          </dt>
          <dd className="m-0">{formatDate(member.consentDate, lang)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{t('drawer.login')}</dt>
          <dd className="m-0">{member.hasLogin ? t('a.yes') : t('a.no')}</dd>
        </div>
      </dl>
      <p className="mt-3 text-[13px] text-muted-foreground">
        {t('memberEdit.statusHint')}
      </p>
    </section>
  )
}
