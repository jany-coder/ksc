import { queryOptions, useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Maximize2, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { useT } from '../../lib/i18n/index.tsx'
import { getMemberFn } from '../../lib/members.functions.ts'
import { can } from '../../lib/permissions.ts'
import { Button } from '../ui/button.tsx'
import {
  ActionMessages,
  BloodSection,
  ContactSection,
  ManageSection,
  MembershipSection,
  PendingBanner,
  PersonalSection,
  QuickActions,
  canManage,
  useMemberActions,
} from './member-details.tsx'
import type { Actor } from './member-details.tsx'
import { MemberAvatar } from './member-photo.tsx'
import { RoleBadge, StatusBadge } from './member-status.tsx'

export const memberDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ['members', 'detail', id],
    queryFn: () => getMemberFn({ data: { id } }),
  })

/**
 * The quick look at one member, over the members list: call them, check their
 * blood group, approve an application, without leaving the list (its filters
 * and scroll stay put). "Full profile" opens the member's own page.
 *
 * Built on the browser's own <dialog> element: showModal() gives us the dark
 * backdrop, the Esc key and a focus trap for free, so none of that is
 * hand-written. The URL (?member=<id>) decides whether it is open, so a refresh
 * or a shared link opens the same drawer, and the phone's back button closes it.
 */
export function MemberDrawer({
  memberId,
  actor,
  onClose,
}: {
  memberId: string
  // The signed-in admin. Used only to decide which buttons to show; the server
  // functions check the same rules again.
  actor: Actor
  onClose: () => void
}) {
  const t = useT()
  const dialog = useRef<HTMLDialogElement>(null)
  // Archived: the member is gone from the list, so close the drawer.
  const actions = useMemberActions(memberId, onClose)
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
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <StatusBadge status={member.status} />
                  <RoleBadge role={member.role} />
                </div>
              )}
              {member && (
                <Link
                  to="/admin/members/$id"
                  params={{ id: memberId }}
                  className="mt-2 inline-flex min-h-8 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <Maximize2 aria-hidden="true" className="size-3.5" />
                  {t('drawer.fullProfile')}
                </Link>
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
            <div className="mt-3">
              <QuickActions member={member} actor={actor} />
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
              <ActionMessages actions={actions} />
              {member.status === 'pending' && canManage(actor, member) && (
                <PendingBanner actions={actions} />
              )}
              <BloodSection member={member} />
              <ContactSection member={member} />
              <PersonalSection
                member={member}
                canEdit={can(actor.role, 'members.write')}
              />
              <MembershipSection member={member} />
              {canManage(actor, member) && (
                <ManageSection
                  member={member}
                  actor={actor}
                  actions={actions}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </dialog>
  )
}
