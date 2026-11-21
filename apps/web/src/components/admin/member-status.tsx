import { useT } from '../../lib/i18n/index.tsx'
import { STATUS_LABEL_KEY } from '../../lib/member-options.ts'
import type { MemberStatus } from '../../lib/member-options.ts'
import type { MessageKey } from '../../lib/i18n/messages.ts'
import type { Role } from '../../lib/permissions.ts'
import { cn } from '../../lib/utils.ts'

// Status and role chips, shared by the drawer and the member edit page.

const STATUS_STYLE: Record<MemberStatus, { chip: string; dot: string }> = {
  active: {
    chip: 'border-green-200 bg-green-50 text-green-800',
    dot: 'bg-green-600',
  },
  pending: {
    chip: 'border-yellow-200 bg-yellow-50 text-yellow-900',
    dot: 'bg-yellow-600',
  },
  suspended: {
    chip: 'border-zinc-200 bg-zinc-100 text-zinc-700',
    dot: 'bg-zinc-400',
  },
}

export const ROLE_LABEL_KEY = {
  super_admin: 'role.super_admin',
  admin: 'role.admin',
  member: 'role.member',
} as const satisfies Record<Role, MessageKey>

export function StatusBadge({ status }: { status: MemberStatus }) {
  const t = useT()
  const style = STATUS_STYLE[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
        style.chip,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('size-1.5 rounded-full', style.dot)}
      />
      {t(STATUS_LABEL_KEY[status])}
    </span>
  )
}

/** Only for the club's admins; a plain member gets no chip. */
export function RoleBadge({ role }: { role: Role }) {
  const t = useT()
  if (role === 'member') return null
  return (
    <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs font-semibold text-zinc-700">
      {t(ROLE_LABEL_KEY[role])}
    </span>
  )
}
