import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { formatBnDate } from '../../lib/bn-datetime.ts'
import { STATUS_LABEL, bloodLabel } from '../../lib/member-options.ts'
import {
  archiveMemberFn,
  getMemberFn,
  setMemberStatusFn,
} from '../../lib/members.functions.ts'
import { can, canManageMember } from '../../lib/permissions.ts'
import type { Role } from '../../lib/permissions.ts'
import { Button } from '../ui/button.tsx'

export const memberDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ['members', 'detail', id],
    queryFn: () => getMemberFn({ data: { id } }),
  })

const ROLE_LABEL: Record<Role, string> = {
  super_admin: 'সুপার অ্যাডমিন',
  admin: 'অ্যাডমিন',
  member: 'সদস্য',
}

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
  const dialog = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const deleteMutation = useMutation({
    mutationFn: () => archiveMemberFn({ data: { id: memberId } }),
    onSuccess: async (result) => {
      if (!result.ok) {
        setActionError('সদস্যকে মোছা গেল না।')
        setConfirmingDelete(false)
        return
      }
      await queryClient.invalidateQueries({ queryKey: ['members'] })
      onClose() // the member is gone from the list, so close the drawer
    },
    onError: () => {
      setActionError('সদস্যকে মোছা গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।')
      setConfirmingDelete(false)
    },
  })
  const statusMutation = useMutation({
    mutationFn: (status: 'active' | 'suspended') =>
      setMemberStatusFn({ data: { id: memberId, status } }),
    onSuccess: async (result) => {
      if (!result.ok) {
        setActionError('এই পরিবর্তন করা গেল না।')
        return
      }
      setActionError(null)
      // The list and the drawer both show the status.
      await queryClient.invalidateQueries({ queryKey: ['members'] })
    },
    onError: () =>
      setActionError('এই পরিবর্তন করা গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।'),
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
              {member ? member.name : 'সদস্যের তথ্য'}
            </h2>
            {member && (
              <p className="text-[13px] text-muted-foreground">
                {STATUS_LABEL[member.status]}
                {member.role !== 'member' && ` · ${ROLE_LABEL[member.role]}`}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="বন্ধ করুন"
            onClick={() => dialog.current?.close()}
          >
            <X aria-hidden="true" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {isPending && <p className="py-6 text-muted-foreground">লোড হচ্ছে…</p>}
          {isError && (
            <p role="alert" className="py-6 text-red-700">
              তথ্য লোড করা গেল না। আবার চেষ্টা করুন।
            </p>
          )}
          {member === null && (
            <p className="py-6 text-muted-foreground">এই সদস্যকে পাওয়া যায়নি।</p>
          )}
          {member && (
            <dl className="m-0">
              <Field label="মোবাইল">
                <span className="tabular-nums">{member.phone}</span>
              </Field>
              <Field label="ইমেইল">{member.email ?? dash}</Field>
              <Field label="রক্তের গ্রুপ">
                {member.bloodGroup ? bloodLabel(member.bloodGroup) : dash}
              </Field>
              <Field label="রক্তদানে আগ্রহী">
                {member.willingToDonate ? 'হ্যাঁ' : 'না'}
              </Field>
              <Field label="সর্বশেষ রক্তদান">
                {member.lastDonationDate
                  ? formatBnDate(member.lastDonationDate)
                  : dash}
              </Field>
              <Field label="ঠিকানা">{member.address ?? dash}</Field>
              <Field label="এলাকা">{member.area ?? dash}</Field>
              <Field label="পেশা">{member.occupation ?? dash}</Field>
              <Field label="যোগদানের তারিখ">
                {formatBnDate(member.joinedDate)}
              </Field>
              <Field label="তথ্য ব্যবহারে সম্মতি দিয়েছেন">
                {formatBnDate(member.consentDate)}
              </Field>
            </dl>
          )}
        </div>

        {member &&
          can(actor.role, 'members.write') &&
          canManageMember(actor, member) && (
            <div className="flex flex-col gap-2 border-t border-border px-5 py-4">
              {actionError && (
                <p role="alert" className="text-sm text-red-700">
                  {actionError}
                </p>
              )}
              {member.status === 'suspended' ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate('active')}
                >
                  সক্রিয় করুন
                </Button>
              ) : (
                <>
                  {member.status === 'pending' && (
                    <Button
                      type="button"
                      disabled={statusMutation.isPending}
                      onClick={() => statusMutation.mutate('active')}
                    >
                      সক্রিয় করুন
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate('suspended')}
                  >
                    স্থগিত করুন
                  </Button>
                </>
              )}
              {can(actor.role, 'members.delete') &&
                (confirmingDelete ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="mb-2.5 text-sm text-red-800">
                      সদস্যকে তালিকা থেকে সরিয়ে দেওয়া হবে এবং ৩০ দিন পর স্থায়ীভাবে
                      মুছে যাবে। নিশ্চিত?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate()}
                      >
                        হ্যাঁ, মুছে ফেলুন
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setConfirmingDelete(false)}
                      >
                        না
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
                    সদস্যকে মুছে ফেলুন
                  </Button>
                ))}
            </div>
          )}
      </div>
    </dialog>
  )
}
