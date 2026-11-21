import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  Check,
  Copy,
  KeyRound,
  Pencil,
  Phone,
  ShieldCheck,
  ShieldMinus,
  ShieldPlus,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react'
import { useId, useState } from 'react'
import type { ReactNode } from 'react'

import {
  makeAdminFn,
  makeSuperAdminFn,
  removeAdminFn,
} from '../../lib/admins.functions.ts'
import {
  ageOn,
  daysBetween,
  formatDate,
  todayInDhaka,
} from '../../lib/datetime.ts'
import { useLang, useNumber, useT } from '../../lib/i18n/index.tsx'
import type { MessageKey } from '../../lib/i18n/messages.ts'
import { bloodLabel } from '../../lib/member-options.ts'
import {
  GENDER_LABEL_KEY,
  MARITAL_LABEL_KEY,
  formatAddress,
} from '../../lib/member-profile.ts'
import {
  archiveMemberFn,
  setMemberStatusFn,
} from '../../lib/members.functions.ts'
import type { MemberDetail } from '../../lib/members.server.ts'
import { resetMemberPasswordFn } from '../../lib/password.functions.ts'
import { can, canManageMember } from '../../lib/permissions.ts'
import type { Role } from '../../lib/permissions.ts'
import { cn } from '../../lib/utils.ts'
import { Button, buttonVariants } from '../ui/button.tsx'

// One member's details and the admin actions on them, shared by the quick-look
// drawer and the full profile page, so both always show the same thing.

export type Actor = { id: string; role: Role }

const dash = <span className="text-muted-foreground">—</span>

export const sectionTitle =
  'text-xs font-semibold tracking-wide text-muted-foreground uppercase'
// Left-aligned, full-width rows, 44px tall on a phone.
const actionButton = 'h-11 justify-start sm:h-9'

export function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const id = useId()
  return (
    <section aria-labelledby={id}>
      <h3 id={id} className={cn(sectionTitle, 'mb-2')}>
        {title}
      </h3>
      <dl className="m-0 grid grid-cols-1 gap-x-4 gap-y-3 rounded-lg border border-border bg-card p-3 sm:grid-cols-2">
        {children}
      </dl>
    </section>
  )
}

export function Field({
  label,
  wide,
  children,
}: {
  label: string
  // Spans both columns (long values such as the address).
  wide?: boolean
  children: ReactNode
}) {
  return (
    <div className={cn('min-w-0', wide && 'sm:col-span-2')}>
      <dt className="mb-0.5 text-xs text-muted-foreground">{label}</dt>
      <dd className="m-0 text-sm break-words text-foreground">{children}</dd>
    </div>
  )
}

/** Call, copy the number, edit: the actions used most. */
export function QuickActions({
  member,
  actor,
}: {
  member: MemberDetail
  actor: Actor
}) {
  const t = useT()
  const [copied, setCopied] = useState(false)
  async function copyPhone() {
    try {
      await navigator.clipboard.writeText(member.phone)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (old browser, no permission): the number is on screen.
    }
  }
  // Big enough for a thumb on a phone (44px), denser from sm up.
  const size = 'h-11 sm:h-9'
  return (
    <div className="grid grid-cols-3 gap-2">
      <a
        href={`tel:${member.phone}`}
        className={cn(buttonVariants({ variant: 'default' }), size)}
      >
        <Phone aria-hidden="true" />
        {t('drawer.call')}
      </a>
      <Button
        type="button"
        variant="outline"
        className={size}
        onClick={() => void copyPhone()}
      >
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {copied ? t('drawer.copied') : t('drawer.copy')}
      </Button>
      {can(actor.role, 'members.write') ? (
        <Link
          to="/admin/members/$id/edit"
          params={{ id: member.id }}
          className={cn(buttonVariants({ variant: 'outline' }), size)}
        >
          <Pencil aria-hidden="true" />
          {t('drawer.editShort')}
        </Link>
      ) : (
        <span />
      )}
    </div>
  )
}

/** Blood group large, then whether they donate and when they last did. */
export function BloodSection({ member }: { member: MemberDetail }) {
  const t = useT()
  const lang = useLang()
  const number = useNumber()
  const daysAgo = member.lastDonationDate
    ? daysBetween(member.lastDonationDate, todayInDhaka())
    : null
  return (
    <section aria-labelledby="member-blood">
      <h3 id="member-blood" className={cn(sectionTitle, 'mb-2')}>
        {t('drawer.sectionBlood')}
      </h3>
      <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-3">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-secondary text-xl font-bold tabular-nums">
          {member.bloodGroup ? bloodLabel(member.bloodGroup) : '?'}
        </div>
        <dl className="m-0 grid min-w-0 grow gap-1.5 text-sm">
          <div className="flex flex-wrap gap-x-1.5">
            <dt className="text-muted-foreground">{t('drawer.willing')}:</dt>
            <dd className="m-0 font-medium">
              {member.willingToDonate ? t('a.yes') : t('a.no')}
            </dd>
          </div>
          <div className="flex flex-wrap gap-x-1.5">
            <dt className="text-muted-foreground">
              {t('drawer.lastDonation')}:
            </dt>
            <dd className="m-0 font-medium">
              {member.lastDonationDate ? (
                <>
                  {formatDate(member.lastDonationDate, lang)}
                  {daysAgo !== null && daysAgo >= 0 && (
                    <span className="font-normal text-muted-foreground">
                      {' '}
                      ({t('drawer.daysAgo', { n: number(daysAgo) })})
                    </span>
                  )}
                </>
              ) : (
                t('drawer.never')
              )}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

export function ContactSection({ member }: { member: MemberDetail }) {
  const t = useT()
  return (
    <Section title={t('drawer.sectionContact')}>
      <Field label={t('drawer.mobile')}>
        <span className="tabular-nums">{member.phone}</span>
      </Field>
      <Field label={t('drawer.email')}>
        {member.email ? (
          <a
            href={`mailto:${member.email}`}
            className="break-all text-primary hover:underline"
          >
            {member.email}
          </a>
        ) : (
          dash
        )}
      </Field>
      {/* One line, in the usual order: easy to read out on the phone. */}
      <Field label={t('profile.address')} wide>
        {formatAddress(member) || dash}
      </Field>
    </Section>
  )
}

/** Only the fields that are filled in, and how many are still empty. */
export function PersonalSection({
  member,
  canEdit,
}: {
  member: MemberDetail
  canEdit: boolean
}) {
  const t = useT()
  const lang = useLang()
  const number = useNumber()
  const rows: { label: string; value: ReactNode }[] = []
  const add = (label: MessageKey, value: ReactNode | null) => {
    if (value !== null) rows.push({ label: t(label), value })
  }
  add('profile.fatherName', member.fatherName)
  add('profile.motherName', member.motherName)
  add(
    'profile.dateOfBirth',
    member.dateOfBirth
      ? `${formatDate(member.dateOfBirth, lang)} (${t('drawer.age', {
          n: number(ageOn(member.dateOfBirth, todayInDhaka())),
        })})`
      : null,
  )
  add(
    'profile.gender',
    member.gender ? t(GENDER_LABEL_KEY[member.gender]) : null,
  )
  add(
    'profile.maritalStatus',
    member.maritalStatus ? t(MARITAL_LABEL_KEY[member.maritalStatus]) : null,
  )
  add('profile.occupation', member.occupation)
  add('profile.organization', member.organization)
  const missing = 7 - rows.length

  return (
    <section aria-labelledby="member-personal">
      <h3 id="member-personal" className={cn(sectionTitle, 'mb-2')}>
        {t('profile.personal')}
      </h3>
      <div className="rounded-lg border border-border bg-card p-3">
        {rows.length > 0 && (
          <dl className="m-0 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            {rows.map((row) => (
              <Field key={row.label} label={row.label}>
                {row.value}
              </Field>
            ))}
          </dl>
        )}
        {missing > 0 && (
          <p
            className={cn(
              'm-0 text-[13px] text-muted-foreground',
              rows.length > 0 && 'mt-3 border-t border-border pt-2.5',
            )}
          >
            {rows.length === 0
              ? t('drawer.personalEmpty')
              : t('drawer.personalMissing', { n: number(missing) })}
            {canEdit && (
              <>
                {' '}
                <Link
                  to="/admin/members/$id/edit"
                  params={{ id: member.id }}
                  className="font-medium text-primary hover:underline"
                >
                  {t('drawer.fillIn')}
                </Link>
              </>
            )}
          </p>
        )}
      </div>
    </section>
  )
}

export function MembershipSection({ member }: { member: MemberDetail }) {
  const t = useT()
  const lang = useLang()
  return (
    <Section title={t('drawer.sectionMembership')}>
      <Field label={t('drawer.joined')}>
        {formatDate(member.joinedDate, lang)}
      </Field>
      <Field label={t('drawer.consent')}>
        {formatDate(member.consentDate, lang)}
      </Field>
      <Field label={t('drawer.login')}>
        {member.hasLogin ? t('a.yes') : t('a.no')}
      </Field>
    </Section>
  )
}

/**
 * The admin actions on one member, with their messages. `onDeleted` runs after
 * the member is archived (the drawer closes, the page goes back to the list).
 * Which buttons show follows canManageMember; the server checks it again.
 */
export function useMemberActions(memberId: string, onDeleted: () => void) {
  const t = useT()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  // Shown once after a reset. Lives only in this component: leaving forgets
  // it, and it is never put in the URL or the query cache.
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['members'] })

  const reset = useMutation({
    mutationFn: () => resetMemberPasswordFn({ data: { id: memberId } }),
    onSuccess: (result) => {
      if (!result.ok) {
        setError(
          result.code === 'NO_LOGIN'
            ? t('drawer.errNoLogin')
            : t('drawer.errReset'),
        )
        return
      }
      setError(null)
      setTempPassword(result.tempPassword)
    },
    onError: () => setError(t('drawer.errResetNet')),
  })
  const makeAdmin = useMutation({
    mutationFn: () => makeAdminFn({ data: { id: memberId } }),
    onSuccess: async (result) => {
      if (!result.ok) {
        setError(t('drawer.errMakeAdmin'))
        return
      }
      setError(null)
      setTempPassword(result.tempPassword)
      await refresh()
    },
    onError: () => setError(t('drawer.errMakeAdmin')),
  })
  const makeSuper = useMutation({
    mutationFn: () => makeSuperAdminFn({ data: { id: memberId } }),
    onSuccess: async (result) => {
      if (!result.ok) {
        setError(t('drawer.errMakeAdmin'))
        return
      }
      setError(null)
      // Null for an admin who keeps their password.
      setTempPassword(result.tempPassword)
      await refresh()
    },
    onError: () => setError(t('drawer.errMakeAdmin')),
  })
  const removeAdmin = useMutation({
    mutationFn: () => removeAdminFn({ data: { id: memberId } }),
    onSuccess: async (result) => {
      if (!result.ok) {
        setError(t('drawer.errRemoveAdmin'))
        return
      }
      setError(null)
      setTempPassword(null)
      await refresh()
    },
    onError: () => setError(t('drawer.errRemoveAdmin')),
  })
  const remove = useMutation({
    mutationFn: () => archiveMemberFn({ data: { id: memberId } }),
    onSuccess: async (result) => {
      if (!result.ok) {
        setError(t('drawer.errDelete'))
        setConfirmingDelete(false)
        return
      }
      await refresh()
      onDeleted()
    },
    onError: () => {
      setError(t('drawer.errDeleteNet'))
      setConfirmingDelete(false)
    },
  })
  const status = useMutation({
    mutationFn: (next: 'active' | 'suspended') =>
      setMemberStatusFn({ data: { id: memberId, status: next } }),
    onSuccess: async (result) => {
      if (!result.ok) {
        setError(t('drawer.errChange'))
        return
      }
      setError(null)
      await refresh()
    },
    onError: () => setError(t('drawer.errChangeNet')),
  })

  return {
    error,
    tempPassword,
    confirmingDelete,
    setConfirmingDelete,
    reset,
    makeAdmin,
    makeSuper,
    removeAdmin,
    remove,
    status,
  }
}

export type MemberActions = ReturnType<typeof useMemberActions>

export const canManage = (actor: Actor, member: MemberDetail) =>
  can(actor.role, 'members.write') && canManageMember(actor, member)

/** The last action's error, or a one-time temporary password. */
export function ActionMessages({ actions }: { actions: MemberActions }) {
  const t = useT()
  return (
    <>
      {actions.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {actions.error}
        </p>
      )}
      {actions.tempPassword && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-3"
        >
          <p className="mb-1.5 text-sm text-green-900">
            {t('drawer.tempPassword')}
          </p>
          <code className="block rounded border border-green-200 bg-card px-2 py-1.5 font-mono text-base break-all select-all">
            {actions.tempPassword}
          </code>
        </div>
      )}
    </>
  )
}

/** An application waiting for approval: the one thing to do. */
export function PendingBanner({ actions }: { actions: MemberActions }) {
  const t = useT()
  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-yellow-200 bg-yellow-50 p-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="m-0 text-sm text-yellow-900">{t('drawer.pendingNote')}</p>
      <Button
        type="button"
        className="h-11 shrink-0 sm:h-9"
        disabled={actions.status.isPending}
        onClick={() => actions.status.mutate('active')}
      >
        {t('drawer.approve')}
      </Button>
    </div>
  )
}

/** Password, role, status and delete. Shown only when the actor may manage this member. */
export function ManageSection({
  member,
  actor,
  actions,
}: {
  member: MemberDetail
  actor: Actor
  actions: MemberActions
}) {
  const t = useT()
  const confirmThen = (question: MessageKey, run: () => void) => () => {
    if (window.confirm(t(question))) run()
  }
  return (
    <section aria-labelledby="member-manage" className="flex flex-col gap-2">
      <h3 id="member-manage" className={sectionTitle}>
        {t('drawer.sectionManage')}
      </h3>
      {member.hasLogin && (
        <Button
          type="button"
          variant="outline"
          className={actionButton}
          disabled={actions.reset.isPending}
          onClick={confirmThen('drawer.resetConfirm', () =>
            actions.reset.mutate(),
          )}
        >
          <KeyRound aria-hidden="true" />
          {t('drawer.reset')}
        </Button>
      )}
      {can(actor.role, 'admins.manage') && member.role === 'member' && (
        <Button
          type="button"
          variant="outline"
          className={actionButton}
          disabled={actions.makeAdmin.isPending}
          onClick={confirmThen('drawer.makeAdminConfirm', () =>
            actions.makeAdmin.mutate(),
          )}
        >
          <ShieldPlus aria-hidden="true" />
          {t('drawer.makeAdmin')}
        </Button>
      )}
      {can(actor.role, 'admins.manage') && member.role !== 'super_admin' && (
        <Button
          type="button"
          variant="outline"
          className={actionButton}
          disabled={actions.makeSuper.isPending}
          onClick={confirmThen('drawer.makeSuperConfirm', () =>
            actions.makeSuper.mutate(),
          )}
        >
          <ShieldCheck aria-hidden="true" />
          {t('drawer.makeSuper')}
        </Button>
      )}
      {can(actor.role, 'admins.manage') && member.role === 'admin' && (
        <Button
          type="button"
          variant="outline"
          className={actionButton}
          disabled={actions.removeAdmin.isPending}
          onClick={confirmThen('drawer.removeAdminConfirm', () =>
            actions.removeAdmin.mutate(),
          )}
        >
          <ShieldMinus aria-hidden="true" />
          {t('drawer.removeAdmin')}
        </Button>
      )}
      {member.status === 'suspended' ? (
        <Button
          type="button"
          variant="outline"
          className={actionButton}
          disabled={actions.status.isPending}
          onClick={() => actions.status.mutate('active')}
        >
          <UserCheck aria-hidden="true" />
          {t('drawer.activate')}
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          className={cn(actionButton, 'text-red-700 hover:bg-red-50')}
          disabled={actions.status.isPending}
          onClick={() => actions.status.mutate('suspended')}
        >
          <UserX aria-hidden="true" />
          {t('drawer.suspend')}
        </Button>
      )}
      {can(actor.role, 'members.delete') &&
        (actions.confirmingDelete ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="mb-2.5 text-sm text-red-800">
              {t('drawer.deleteConfirm')}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="destructive"
                className="h-11 sm:h-9"
                disabled={actions.remove.isPending}
                onClick={() => actions.remove.mutate()}
              >
                {t('a.yesDelete')}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 sm:h-9"
                onClick={() => actions.setConfirmingDelete(false)}
              >
                {t('a.no')}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className={cn(actionButton, 'text-red-700 hover:bg-red-50')}
            onClick={() => actions.setConfirmingDelete(true)}
          >
            <Trash2 aria-hidden="true" />
            {t('drawer.delete')}
          </Button>
        ))}
    </section>
  )
}
