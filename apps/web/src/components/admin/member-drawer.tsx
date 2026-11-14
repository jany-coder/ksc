import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Pencil, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { formatDate } from '../../lib/datetime.ts'
import { useLang, useT } from '../../lib/i18n/index.tsx'
import type { MessageKey } from '../../lib/i18n/messages.ts'
import { STATUS_LABEL_KEY, bloodLabel } from '../../lib/member-options.ts'
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

export const memberDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ['members', 'detail', id],
    queryFn: () => getMemberFn({ data: { id } }),
  })

const ROLE_LABEL_KEY = {
  super_admin: 'role.super_admin',
  admin: 'role.admin',
  member: 'role.member',
} as const satisfies Record<Role, MessageKey>

const dash = <span className="text-muted-foreground">—</span>

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-zinc-100 py-2.5">
      <dt className="mb-0.5 text-xs text-muted-foreground">{label}</dt>
      <dd className="m-0 text-sm text-foreground">{children}</dd>
    </div>
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
      className="m-0 ms-auto h-dvh max-h-none w-full max-w-[420px] border-s border-border bg-card p-0 text-foreground shadow-xl backdrop:bg-black/30"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2
              id="member-drawer-title"
              className="text-lg font-semibold break-words"
            >
              {member ? member.name : t('drawer.title')}
            </h2>
            {member && (
              <p className="text-[13px] text-muted-foreground">
                {t(STATUS_LABEL_KEY[member.status])}
                {member.role !== 'member' &&
                  ` · ${t(ROLE_LABEL_KEY[member.role])}`}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t('a.close')}
            onClick={() => dialog.current?.close()}
          >
            <X aria-hidden="true" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
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
            <dl className="m-0">
              <Field label={t('drawer.mobile')}>
                <span className="tabular-nums">{member.phone}</span>
              </Field>
              <Field label={t('drawer.email')}>{member.email ?? dash}</Field>
              <Field label={t('drawer.blood')}>
                {member.bloodGroup ? bloodLabel(member.bloodGroup) : dash}
              </Field>
              <Field label={t('drawer.willing')}>
                {member.willingToDonate ? t('a.yes') : t('a.no')}
              </Field>
              <Field label={t('drawer.lastDonation')}>
                {member.lastDonationDate
                  ? formatDate(member.lastDonationDate, lang)
                  : dash}
              </Field>
              <Field label={t('drawer.address')}>
                {member.address ?? dash}
              </Field>
              <Field label={t('drawer.area')}>{member.area ?? dash}</Field>
              <Field label={t('drawer.occupation')}>
                {member.occupation ?? dash}
              </Field>
              <Field label={t('drawer.joined')}>
                {formatDate(member.joinedDate, lang)}
              </Field>
              <Field label={t('drawer.consent')}>
                {formatDate(member.consentDate, lang)}
              </Field>
            </dl>
          )}
        </div>

        {member &&
          can(actor.role, 'members.write') &&
          !canManageMember(actor, member) && (
            // Yourself or another admin: details can be edited, but status,
            // password and role actions stay with the rules in canManageMember.
            <div className="flex flex-col gap-2 border-t border-border px-5 py-4">
              <Link
                to="/admin/members/$id"
                params={{ id: memberId }}
                className={buttonVariants({ variant: 'outline' })}
              >
                <Pencil aria-hidden="true" />
                {t('drawer.edit')}
              </Link>
            </div>
          )}

        {member &&
          can(actor.role, 'members.write') &&
          canManageMember(actor, member) && (
            <div className="flex flex-col gap-2 border-t border-border px-5 py-4">
              {actionError && (
                <p role="alert" className="text-sm text-red-700">
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
              <Link
                to="/admin/members/$id"
                params={{ id: memberId }}
                className={buttonVariants({ variant: 'outline' })}
              >
                <Pencil aria-hidden="true" />
                {t('drawer.edit')}
              </Link>
              {member.hasLogin && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={resetMutation.isPending}
                  onClick={() => {
                    if (window.confirm(t('drawer.resetConfirm')))
                      resetMutation.mutate()
                  }}
                >
                  {t('drawer.reset')}
                </Button>
              )}
              {can(actor.role, 'admins.manage') && member.role === 'member' && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={makeAdminMutation.isPending}
                  onClick={() => {
                    if (window.confirm(t('drawer.makeAdminConfirm')))
                      makeAdminMutation.mutate()
                  }}
                >
                  {t('drawer.makeAdmin')}
                </Button>
              )}
              {can(actor.role, 'admins.manage') &&
                member.role !== 'super_admin' && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={makeSuperMutation.isPending}
                    onClick={() => {
                      if (window.confirm(t('drawer.makeSuperConfirm')))
                        makeSuperMutation.mutate()
                    }}
                  >
                    {t('drawer.makeSuper')}
                  </Button>
                )}
              {can(actor.role, 'admins.manage') && member.role === 'admin' && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={removeAdminMutation.isPending}
                  onClick={() => {
                    if (window.confirm(t('drawer.removeAdminConfirm')))
                      removeAdminMutation.mutate()
                  }}
                >
                  {t('drawer.removeAdmin')}
                </Button>
              )}
              {member.status === 'suspended' ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate('active')}
                >
                  {t('drawer.activate')}
                </Button>
              ) : (
                <>
                  {member.status === 'pending' && (
                    <Button
                      type="button"
                      disabled={statusMutation.isPending}
                      onClick={() => statusMutation.mutate('active')}
                    >
                      {t('drawer.activate')}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate('suspended')}
                  >
                    {t('drawer.suspend')}
                  </Button>
                </>
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
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate()}
                      >
                        {t('a.yesDelete')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
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
                    className="text-red-700 hover:bg-red-50"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    {t('drawer.delete')}
                  </Button>
                ))}
            </div>
          )}
      </div>
    </dialog>
  )
}
