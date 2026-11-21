import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
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
  X,
} from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'

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
  getMemberFn,
  setMemberStatusFn,
} from '../../lib/members.functions.ts'
import {
  makeAdminFn,
  makeSuperAdminFn,
  removeAdminFn,
} from '../../lib/admins.functions.ts'
import { resetMemberPasswordFn } from '../../lib/password.functions.ts'
import { can, canManageMember } from '../../lib/permissions.ts'
import type { Role } from '../../lib/permissions.ts'
import { Button, buttonVariants } from '../ui/button.tsx'
import { cn } from '../../lib/utils.ts'
import type { MemberDetail } from '../../lib/members.server.ts'
import { MemberAvatar } from './member-photo.tsx'
import { RoleBadge, StatusBadge } from './member-status.tsx'

export const memberDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ['members', 'detail', id],
    queryFn: () => getMemberFn({ data: { id } }),
  })

const dash = <span className="text-muted-foreground">—</span>

const sectionTitle =
  'text-xs font-semibold tracking-wide text-muted-foreground uppercase'
// Left-aligned, full-width rows, 44px tall on a phone.
const actionButton = 'h-11 justify-start sm:h-9'

function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = useId()
  return (
    <section aria-labelledby={id}>
      <h3 id={id} className={cn(sectionTitle, 'mb-2')}>
        {title}
      </h3>
      <dl className="m-0 grid grid-cols-1 gap-x-4 gap-y-3 rounded-lg border border-border p-3 sm:grid-cols-2">
        {children}
      </dl>
    </section>
  )
}

function Field({
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

/** Blood group large, then whether they donate and when they last did. */
function BloodSection({ member }: { member: MemberDetail }) {
  const t = useT()
  const lang = useLang()
  const number = useNumber()
  const daysAgo = member.lastDonationDate
    ? daysBetween(member.lastDonationDate, todayInDhaka())
    : null
  return (
    <section aria-labelledby="drawer-blood">
      <h3 id="drawer-blood" className={cn(sectionTitle, 'mb-2')}>
        {t('drawer.sectionBlood')}
      </h3>
      <div className="flex items-center gap-4 rounded-lg border border-border p-3">
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

/** Only the fields that are filled in, and how many are still empty. */
function PersonalSection({
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
    <section aria-labelledby="drawer-personal">
      <h3 id="drawer-personal" className={cn(sectionTitle, 'mb-2')}>
        {t('profile.personal')}
      </h3>
      <div className="rounded-lg border border-border p-3">
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
                  to="/admin/members/$id"
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

/**
 * Right-hand drawer with one member's full details.
 *
 * Built on the browser's own <dialog> element: showModal() gives us the dark
 * backdrop, the Esc key and a focus trap for free, so none of that is
 * hand-written. The URL (?member=<id>) decides whether it is open, so a refresh
 * or a shared link opens the same drawer.
 */
export function MemberDrawer({
  memberId,
  actor,
  onClose,
}: {
  memberId: string
  // The signed-in admin. Used only to decide which buttons to show; the server
  // function checks the same rules again.
  actor: { id: string; role: Role }
  onClose: () => void
}) {
  const t = useT()
  const lang = useLang()
  const dialog = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  // Shown once after a reset. Lives only in this component: closing the drawer
  // forgets it, and it is never put in the URL or the query cache.
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const resetMutation = useMutation({
    mutationFn: () => resetMemberPasswordFn({ data: { id: memberId } }),
    onSuccess: (result) => {
      if (!result.ok) {
        setActionError(
          result.code === 'NO_LOGIN'
            ? t('drawer.errNoLogin')
            : t('drawer.errReset'),
        )
        return
      }
      setActionError(null)
      setTempPassword(result.tempPassword)
    },
    onError: () => setActionError(t('drawer.errResetNet')),
  })
  const makeAdminMutation = useMutation({
    mutationFn: () => makeAdminFn({ data: { id: memberId } }),
    onSuccess: async (result) => {
      if (!result.ok) {
        setActionError(t('drawer.errMakeAdmin'))
        return
      }
      setActionError(null)
      setTempPassword(result.tempPassword)
      await queryClient.invalidateQueries({ queryKey: ['members'] })
    },
    onError: () => setActionError(t('drawer.errMakeAdmin')),
  })
  const makeSuperMutation = useMutation({
    mutationFn: () => makeSuperAdminFn({ data: { id: memberId } }),
    onSuccess: async (result) => {
      if (!result.ok) {
        setActionError(t('drawer.errMakeAdmin'))
        return
      }
      setActionError(null)
      // Null for an admin who keeps their password.
      setTempPassword(result.tempPassword)
      await queryClient.invalidateQueries({ queryKey: ['members'] })
    },
    onError: () => setActionError(t('drawer.errMakeAdmin')),
  })
  const removeAdminMutation = useMutation({
    mutationFn: () => removeAdminFn({ data: { id: memberId } }),
    onSuccess: async (result) => {
      if (!result.ok) {
        setActionError(t('drawer.errRemoveAdmin'))
        return
      }
      setActionError(null)
      setTempPassword(null)
      await queryClient.invalidateQueries({ queryKey: ['members'] })
    },
    onError: () => setActionError(t('drawer.errRemoveAdmin')),
  })
  const deleteMutation = useMutation({
    mutationFn: () => archiveMemberFn({ data: { id: memberId } }),
    onSuccess: async (result) => {
      if (!result.ok) {
        setActionError(t('drawer.errDelete'))
        setConfirmingDelete(false)
        return
      }
      await queryClient.invalidateQueries({ queryKey: ['members'] })
      onClose() // the member is gone from the list, so close the drawer
    },
    onError: () => {
      setActionError(t('drawer.errDeleteNet'))
      setConfirmingDelete(false)
    },
  })
  const statusMutation = useMutation({
    mutationFn: (status: 'active' | 'suspended') =>
      setMemberStatusFn({ data: { id: memberId, status } }),
    onSuccess: async (result) => {
      if (!result.ok) {
        setActionError(t('drawer.errChange'))
        return
      }
      setActionError(null)
      // The list and the drawer both show the status.
      await queryClient.invalidateQueries({ queryKey: ['members'] })
    },
    onError: () => setActionError(t('drawer.errChangeNet')),
  })
  const {
    data: member,
    isPending,
    isError,
  } = useQuery(memberDetailQuery(memberId))

  useEffect(() => {
    const el = dialog.current
    if (el && !el.open) el.showModal()
  }, [])

  const canManage =
    member != null &&
    can(actor.role, 'members.write') &&
    canManageMember(actor, member)
  const [copied, setCopied] = useState(false)
  async function copyPhone(phone: string) {
    try {
      await navigator.clipboard.writeText(phone)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (old browser, no permission): the number is on screen.
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="member-drawer-title"
      // Esc fires "cancel", then "close": either way, tell the URL.
      onClose={onClose}
      // A click on the backdrop lands on the <dialog> itself, not on its content.
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close()
      }}
      // Full width on a phone; a 480px panel on the right from sm up.
      className="m-0 ms-auto h-dvh max-h-none w-full max-w-none border-s border-border bg-card p-0 text-foreground shadow-xl backdrop:bg-black/30 sm:max-w-[480px]"
    >
      <div className="flex h-full flex-col">
        {/* Header: who, their state, and the actions used most. */}
        <div className="border-b border-border px-4 pt-4 pb-3 sm:px-5">
          <div className="flex items-start gap-3">
            {member && (
              <MemberAvatar
                photoUrl={member.photoUrl}
                name={member.name}
                className="size-16 text-2xl"
              />
            )}
            <div className="min-w-0 grow">
              <h2
                id="member-drawer-title"
                className="text-lg leading-snug font-semibold break-words"
              >
                {member ? member.name : t('drawer.title')}
              </h2>
              {member && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <StatusBadge status={member.status} />
                  <RoleBadge role={member.role} />
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('a.close')}
              onClick={() => dialog.current?.close()}
            >
              <X aria-hidden="true" />
            </Button>
          </div>

          {member && (
            // Big enough for a thumb on a phone (44px), denser from sm up.
            <div className="mt-3 grid grid-cols-3 gap-2">
              <a
                href={`tel:${member.phone}`}
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'h-11 sm:h-9',
                )}
              >
                <Phone aria-hidden="true" />
                {t('drawer.call')}
              </a>
              <Button
                type="button"
                variant="outline"
                className="h-11 sm:h-9"
                onClick={() => void copyPhone(member.phone)}
              >
                {copied ? (
                  <Check aria-hidden="true" />
                ) : (
                  <Copy aria-hidden="true" />
                )}
                {copied ? t('drawer.copied') : t('drawer.copy')}
              </Button>
              {can(actor.role, 'members.write') ? (
                <Link
                  to="/admin/members/$id"
                  params={{ id: memberId }}
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'h-11 sm:h-9',
                  )}
                >
                  <Pencil aria-hidden="true" />
                  {t('drawer.editShort')}
                </Link>
              ) : (
                <span />
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {isPending && (
            <p className="py-6 text-muted-foreground">{t('a.loading')}</p>
          )}
          {isError && (
            <p role="alert" className="py-6 text-red-700">
              {t('drawer.loadError')}
            </p>
          )}
          {member === null && (
            <p className="py-6 text-muted-foreground">{t('drawer.notFound')}</p>
          )}
          {member && (
            <div className="flex flex-col gap-5">
              {actionError && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {actionError}
                </p>
              )}
              {tempPassword && (
                <div
                  role="status"
                  className="rounded-lg border border-green-200 bg-green-50 p-3"
                >
                  <p className="mb-1.5 text-sm text-green-900">
                    {t('drawer.tempPassword')}
                  </p>
                  <code className="block rounded border border-green-200 bg-card px-2 py-1.5 font-mono text-base break-all select-all">
                    {tempPassword}
                  </code>
                </div>
              )}

              {/* An application waiting for approval: the one thing to do. */}
              {member.status === 'pending' && canManage && (
                <div className="flex flex-col gap-2.5 rounded-lg border border-yellow-200 bg-yellow-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="m-0 text-sm text-yellow-900">
                    {t('drawer.pendingNote')}
                  </p>
                  <Button
                    type="button"
                    className="h-11 shrink-0 sm:h-9"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate('active')}
                  >
                    {t('drawer.approve')}
                  </Button>
                </div>
              )}

              <BloodSection member={member} />

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

              <PersonalSection
                member={member}
                canEdit={can(actor.role, 'members.write')}
              />

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

              {canManage && (
                <section
                  aria-labelledby="drawer-manage"
                  className="flex flex-col gap-2"
                >
                  <h3 id="drawer-manage" className={sectionTitle}>
                    {t('drawer.sectionManage')}
                  </h3>
                  {member.hasLogin && (
                    <Button
                      type="button"
                      variant="outline"
                      className={actionButton}
                      disabled={resetMutation.isPending}
                      onClick={() => {
                        if (window.confirm(t('drawer.resetConfirm')))
                          resetMutation.mutate()
                      }}
                    >
                      <KeyRound aria-hidden="true" />
                      {t('drawer.reset')}
                    </Button>
                  )}
                  {can(actor.role, 'admins.manage') &&
                    member.role === 'member' && (
                      <Button
                        type="button"
                        variant="outline"
                        className={actionButton}
                        disabled={makeAdminMutation.isPending}
                        onClick={() => {
                          if (window.confirm(t('drawer.makeAdminConfirm')))
                            makeAdminMutation.mutate()
                        }}
                      >
                        <ShieldPlus aria-hidden="true" />
                        {t('drawer.makeAdmin')}
                      </Button>
                    )}
                  {can(actor.role, 'admins.manage') &&
                    member.role !== 'super_admin' && (
                      <Button
                        type="button"
                        variant="outline"
                        className={actionButton}
                        disabled={makeSuperMutation.isPending}
                        onClick={() => {
                          if (window.confirm(t('drawer.makeSuperConfirm')))
                            makeSuperMutation.mutate()
                        }}
                      >
                        <ShieldCheck aria-hidden="true" />
                        {t('drawer.makeSuper')}
                      </Button>
                    )}
                  {can(actor.role, 'admins.manage') &&
                    member.role === 'admin' && (
                      <Button
                        type="button"
                        variant="outline"
                        className={actionButton}
                        disabled={removeAdminMutation.isPending}
                        onClick={() => {
                          if (window.confirm(t('drawer.removeAdminConfirm')))
                            removeAdminMutation.mutate()
                        }}
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
                      disabled={statusMutation.isPending}
                      onClick={() => statusMutation.mutate('active')}
                    >
                      <UserCheck aria-hidden="true" />
                      {t('drawer.activate')}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        actionButton,
                        'text-red-700 hover:bg-red-50',
                      )}
                      disabled={statusMutation.isPending}
                      onClick={() => statusMutation.mutate('suspended')}
                    >
                      <UserX aria-hidden="true" />
                      {t('drawer.suspend')}
                    </Button>
                  )}
                  {can(actor.role, 'members.delete') &&
                    (confirmingDelete ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                        <p className="mb-2.5 text-sm text-red-800">
                          {t('drawer.deleteConfirm')}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="destructive"
                            className="h-11 sm:h-9"
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate()}
                          >
                            {t('a.yesDelete')}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-11 sm:h-9"
                            onClick={() => setConfirmingDelete(false)}
                          >
                            {t('a.no')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        className={cn(
                          actionButton,
                          'text-red-700 hover:bg-red-50',
                        )}
                        onClick={() => setConfirmingDelete(true)}
                      >
                        <Trash2 aria-hidden="true" />
                        {t('drawer.delete')}
                      </Button>
                    ))}
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </dialog>
  )
}
