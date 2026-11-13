import { Link, useNavigate } from '@tanstack/react-router'
import {
  Bell,
  CalendarDays,
  Droplet,
  Image,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { authClient } from '../../lib/auth-client.ts'
import { useT } from '../../lib/i18n/index.tsx'
import type { MessageKey } from '../../lib/i18n/messages.ts'
import type { Role } from '../../lib/permissions.ts'
import { cn } from '../../lib/utils.ts'
import { LangToggle } from '../lang-toggle.tsx'
import { Button } from '../ui/button.tsx'

type Props = {
  member: { name: string; role: Role }
  children: React.ReactNode
}

// Pages that exist get a link. The rest are shown, as in the approved design,
// but greyed out and not clickable until they are built.
type NavItem = {
  label: MessageKey
  icon: LucideIcon
  to?:
    | '/admin'
    | '/admin/members'
    | '/admin/activities'
    | '/admin/notices'
    | '/admin/gallery'
}
const NAV: NavItem[] = [
  { label: 'shell.dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'shell.members', icon: Users, to: '/admin/members' },
  { label: 'shell.donors', icon: Droplet },
  { label: 'shell.activities', icon: CalendarDays, to: '/admin/activities' },
  { label: 'shell.gallery', icon: Image, to: '/admin/gallery' },
  { label: 'shell.notices', icon: Bell, to: '/admin/notices' },
  { label: 'shell.settings', icon: Settings },
]

const ROLE_LABEL_KEY = {
  super_admin: 'role.super_admin',
  admin: 'role.admin',
  member: 'role.member',
} as const satisfies Record<Role, MessageKey>

// First letter as a person sees it. Bengali letters can be several code points
// (conjuncts), so cut by grapheme rather than by character.
function initialOf(name: string): string {
  const first = new Intl.Segmenter('bn', { granularity: 'grapheme' })
    .segment(name.trim())
    [Symbol.iterator]()
    .next()
  return first.done ? '?' : first.value.segment
}

const itemClass =
  'flex min-h-9 shrink-0 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium'

export function AdminShell({ member, children }: Props) {
  const t = useT()
  const navigate = useNavigate()

  async function signOut() {
    await authClient.signOut()
    await navigate({ to: '/login' })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <aside className="flex shrink-0 flex-col border-b border-border bg-sidebar p-3 md:w-60 md:border-r md:border-b-0">
        <div className="flex items-center gap-2.5 px-2 pt-1.5 pb-3 md:pb-4">
          <img
            src="/logo.png"
            alt=""
            width={30}
            height={24}
            className="h-6 w-[30px] object-contain"
          />
          <span className="flex min-w-0 flex-col">
            <span className="font-heading text-sm leading-tight font-semibold">
              {t('site.name')}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('shell.admin')}
            </span>
          </span>
        </div>

        <nav
          aria-label={t('nav.main')}
          className="flex gap-0.5 overflow-x-auto md:flex-col"
        >
          {NAV.map(({ label, icon: Icon, to }) =>
            to ? (
              <Link
                key={label}
                to={to}
                activeOptions={{ exact: to === '/admin' }}
                className={cn(
                  itemClass,
                  'text-zinc-600 hover:bg-secondary hover:text-foreground',
                )}
                activeProps={{
                  className:
                    'bg-accent font-semibold text-accent-foreground hover:bg-accent hover:text-accent-foreground',
                }}
              >
                <Icon className="size-[17px]" aria-hidden="true" />
                {t(label)}
              </Link>
            ) : (
              <span
                key={label}
                aria-disabled="true"
                title={t('shell.soon')}
                className={cn(itemClass, 'cursor-not-allowed text-zinc-400')}
              >
                <Icon className="size-[17px]" aria-hidden="true" />
                {t(label)}
              </span>
            ),
          )}
        </nav>

        <div className="mt-3 border-t border-border pt-3 md:mt-auto">
          <LangToggle className="w-full justify-center" />
        </div>

        <div className="mt-3 flex items-center gap-2.5 border-t border-border pt-3">
          <span
            aria-hidden="true"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
          >
            {initialOf(member.name)}
          </span>
          <span className="flex min-w-0 grow flex-col">
            <span className="truncate text-[13px] font-medium">
              {member.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {t(ROLE_LABEL_KEY[member.role])}
            </span>
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={signOut}
            aria-label={t('shell.signOut')}
          >
            <LogOut aria-hidden="true" />
          </Button>
        </div>
      </aside>

      <div className="min-w-0 grow">{children}</div>
    </div>
  )
}
