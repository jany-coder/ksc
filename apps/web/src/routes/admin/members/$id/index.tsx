import { useSuspenseQuery } from '@tanstack/react-query'
import {
  Link,
  createFileRoute,
  notFound,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import {
  ActionMessages,
  BloodSection,
  ContactSection,
  HistorySection,
  ManageSection,
  MembershipSection,
  PendingBanner,
  PersonalSection,
  QuickActions,
  canManage,
  useMemberActions,
} from '../../../../components/admin/member-details.tsx'
import { memberDetailQuery } from '../../../../components/admin/member-drawer.tsx'
import { BloodChip } from '../../../../components/admin/blood-chip.tsx'
import { MemberAvatar } from '../../../../components/admin/member-photo.tsx'
import {
  RoleBadge,
  StatusBadge,
} from '../../../../components/admin/member-status.tsx'
import { langOfMatches } from '../../../../lib/i18n/core.ts'
import type { HeadArgs } from '../../../../lib/i18n/core.ts'
import { useT } from '../../../../lib/i18n/index.tsx'
import { tFor } from '../../../../lib/i18n/messages.ts'
import { can } from '../../../../lib/permissions.ts'

// One member's full profile: everything in one place, photo included. The
// drawer over the list is the quick look; this is the page for reading an
// application through or working on one member. Same data and the same query
// cache as the drawer, so a change in one shows in the other.
export const Route = createFileRoute('/admin/members/$id/')({
  head: ({ matches }: HeadArgs) => ({
    meta: [{ title: tFor(langOfMatches(matches))('memberProfile.pageTitle') }],
  }),
  beforeLoad: ({ context }) => {
    // The server function checks again; this just keeps people off the page.
    if (!can(context.member.role, 'members.read'))
      throw redirect({ to: '/admin' })
  },
  loader: async ({ params, context }) => {
    const member = await context.queryClient.ensureQueryData(
      memberDetailQuery(params.id),
    )
    if (!member) throw notFound()
  },
  notFoundComponent: ProfileNotFound,
  component: ProfilePage,
})

function BackLink() {
  const t = useT()
  return (
    <Link
      to="/admin/members"
      className="mb-3 inline-flex min-h-8 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {t('memberProfile.back')}
    </Link>
  )
}

function ProfileNotFound() {
  const t = useT()
  return (
    <main className="px-4 py-6 md:p-6">
      <BackLink />
      <p>{t('memberProfile.notFound')}</p>
    </main>
  )
}

function ProfilePage() {
  const { id } = Route.useParams()
  const { member: actor } = Route.useRouteContext()
  const navigate = useNavigate()
  const { data: member } = useSuspenseQuery(memberDetailQuery(id))
  // Archived: they are gone, so back to the list.
  const actions = useMemberActions(id, () => {
    void navigate({ to: '/admin/members' })
  })

  // Deleted while the page was open.
  if (!member) return <ProfileNotFound />
  const manage = canManage(actor, member)

  return (
    <main className="px-4 py-6 md:p-6">
      <BackLink />

      {/* Who: big photo, name, state, blood group, and the main actions. */}
      <header className="flex flex-col gap-4 rounded-[10px] border border-border bg-card p-4 sm:flex-row sm:items-center sm:p-5">
        <MemberAvatar
          photoUrl={member.photoUrl}
          name={member.name}
          className="size-24 text-4xl sm:size-32 sm:text-5xl"
        />
        <div className="flex min-w-0 grow flex-col gap-3">
          <div>
            <h1 className="text-2xl leading-tight font-semibold break-words">
              {member.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <StatusBadge status={member.status} />
              <RoleBadge role={member.role} />
              {member.bloodGroup && (
                <BloodChip group={member.bloodGroup} size="md" />
              )}
              <span className="text-sm text-muted-foreground tabular-nums">
                {member.phone}
              </span>
            </div>
          </div>
          <div className="sm:max-w-md">
            <QuickActions member={member} actor={actor} />
          </div>
        </div>
      </header>

      <div className="mt-5 flex flex-col gap-5">
        <ActionMessages actions={actions} />
        {member.status === 'pending' && manage && (
          <PendingBanner actions={actions} />
        )}
      </div>

      {/* Wide screens: the details left, blood, membership and actions in a
          side column. A phone: one column, in that order. */}
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <ContactSection member={member} />
          <PersonalSection
            member={member}
            canEdit={can(actor.role, 'members.write')}
          />
          <HistorySection memberId={id} />
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <BloodSection member={member} />
          <MembershipSection member={member} />
          {manage && (
            <ManageSection member={member} actor={actor} actions={actions} />
          )}
        </div>
      </div>
    </main>
  )
}
