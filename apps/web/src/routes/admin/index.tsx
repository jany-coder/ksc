import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  Bell,
  CalendarDays,
  Droplet,
  Image,
  ImagePlus,
  Plus,
  UserPlus,
  Users,
} from 'lucide-react'

import {
  Attention,
  ContentCard,
  DonorTiles,
  NextActivities,
  StatTile,
  StatusBreakdown,
} from '../../components/admin/dashboard.tsx'
import type { AttentionItem } from '../../components/admin/dashboard.tsx'
import { buttonVariants } from '../../components/ui/button.tsx'
import { getDashboardFn } from '../../lib/dashboard.functions.ts'
import { formatDate, todayInDhaka } from '../../lib/datetime.ts'
import { formatBytes } from '../../lib/image-limits.ts'
import { useLang, useNumber, useT } from '../../lib/i18n/index.tsx'
import { langOfMatches } from '../../lib/i18n/core.ts'
import type { HeadArgs } from '../../lib/i18n/core.ts'
import { tFor } from '../../lib/i18n/messages.ts'
import { BLOOD_GROUPS } from '../../lib/member-options.ts'
import { can } from '../../lib/permissions.ts'

const dashboardQuery = () =>
  queryOptions({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardFn(),
  })

export const Route = createFileRoute('/admin/')({
  head: ({ matches }: HeadArgs) => ({
    meta: [{ title: tFor(langOfMatches(matches))('dash.pageTitle') }],
  }),
  loader: ({ context }) =>
    // Only admins see numbers; a plain member has nothing to load.
    can(context.member.role, 'members.read')
      ? context.queryClient.ensureQueryData(dashboardQuery())
      : undefined,
  errorComponent: DashboardError,
  component: AdminHome,
})

function DashboardError() {
  const t = useT()
  return (
    <main className="px-4 py-6 md:p-6">
      <p role="alert" className="text-red-700">
        {t('dash.loadError')}
      </p>
    </main>
  )
}

/** The first word of a name, for the greeting. */
const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name

function AdminHome() {
  const t = useT()
  const lang = useLang()
  const { member } = Route.useRouteContext()
  return (
    <main className="flex flex-col gap-4 px-4 py-6 md:p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-muted-foreground">
            {t('dash.eyebrow')} · {formatDate(todayInDhaka(), lang)}
          </p>
          <h1 className="mt-0.5 text-2xl font-semibold sm:text-[28px]">
            {t('dash.hello', { name: firstName(member.name) })}
          </h1>
          <p className="mt-1 max-w-[620px] text-sm text-muted-foreground">
            {t('dash.lead')}
          </p>
        </div>
        <QuickActions canAddMembers={can(member.role, 'members.write')} />
      </header>
      {can(member.role, 'members.read') && <Figures />}
    </main>
  )
}

function QuickActions({ canAddMembers }: { canAddMembers: boolean }) {
  const t = useT()
  const outline = buttonVariants({ variant: 'outline' })
  return (
    <nav aria-label={t('dash.quick')} className="flex flex-wrap gap-2">
      {canAddMembers && (
        <Link to="/admin/members/new" className={outline}>
          <UserPlus aria-hidden="true" />
          {t('dash.addMember')}
        </Link>
      )}
      <Link to="/admin/notices/new" className={outline}>
        <Bell aria-hidden="true" />
        {t('dash.addNotice')}
      </Link>
      <Link to="/admin/gallery" className={outline}>
        <ImagePlus aria-hidden="true" />
        {t('dash.addPhotos')}
      </Link>
      <Link to="/admin/activities/new" className={buttonVariants()}>
        <Plus aria-hidden="true" />
        {t('dash.addActivity')}
      </Link>
    </nav>
  )
}

function Figures() {
  const t = useT()
  const lang = useLang()
  const number = useNumber()
  const { data } = useSuspenseQuery(dashboardQuery())
  const donorTotal = BLOOD_GROUPS.reduce((sum, g) => sum + data.donors[g], 0)
  const activityTotal = data.activities.published + data.activities.draft

  // Only what is actually waiting, most urgent first; an empty list shows
  // "All clear".
  const candidates: (AttentionItem | false)[] = [
    data.members.pending > 0 && {
      key: 'pending',
      tone: 'warn',
      count: data.members.pending,
      label: t('dash.attPending'),
      to: '/admin/members',
      search: { status: 'pending' },
    },
    data.photos.state !== 'ok' && {
      key: 'storage',
      tone: 'warn',
      count: null,
      label:
        data.photos.state === 'full'
          ? t('dash.attStorageFull')
          : t('dash.attStorageWarn'),
      to: '/admin/gallery',
    },
    data.photos.unfiled > 0 && {
      key: 'unfiled',
      tone: 'info',
      count: data.photos.unfiled,
      label: t('dash.attUnfiled'),
      to: '/admin/gallery',
      search: { activity: 'none' },
    },
    data.activities.withoutPhotos > 0 && {
      key: 'no-photos',
      tone: 'info',
      count: data.activities.withoutPhotos,
      label: t('dash.attNoPhotos'),
      to: '/admin/activities',
      search: { status: 'published' },
    },
    data.activities.draft > 0 && {
      key: 'drafts',
      tone: 'info',
      count: data.activities.draft,
      label: t('dash.attDrafts'),
      to: '/admin/activities',
      search: { status: 'draft' },
    },
    data.notices.draft > 0 && {
      key: 'notice-drafts',
      tone: 'info',
      count: data.notices.draft,
      label: t('dash.attNoticeDrafts'),
      to: '/admin/notices',
    },
  ]
  const attention = candidates.filter((item) => item !== false)

  return (
    <>
      {/* The four headline numbers. */}
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
        <StatTile
          to="/admin/members"
          icon={Users}
          tone="green"
          label={t('dash.tileMembers')}
          value={number(data.members.all)}
          detail={t('dash.tileMembersSub', {
            active: number(data.members.active),
            n: number(data.newThisMonth),
          })}
        />
        <StatTile
          to="/admin/activities"
          icon={CalendarDays}
          tone="blue"
          label={t('dash.tileActivities')}
          value={number(activityTotal)}
          detail={t('dash.tileActivitiesSub', {
            upcoming: number(data.activities.upcoming),
            draft: number(data.activities.draft),
          })}
        />
        <StatTile
          to="/admin/members"
          icon={Droplet}
          tone="red"
          label={t('dash.tileDonors')}
          value={number(donorTotal)}
          detail={t('dash.tileDonorsSub')}
        />
        <StatTile
          to="/admin/gallery"
          icon={Image}
          tone="violet"
          label={t('dash.tilePhotos')}
          value={number(data.photos.total)}
          detail={t('dash.tilePhotosSub', {
            used: formatBytes(data.photos.usedBytes, lang),
          })}
        />
      </div>

      {/* Wide screens: three columns. A phone: one, in reading order. */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Attention items={attention} />
        <NextActivities items={data.nextActivities} />
        <StatusBreakdown counts={data.members} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <DonorTiles donors={data.donors} />
        </div>
        <ContentCard notices={data.notices} photos={data.photos} />
      </div>
    </>
  )
}
