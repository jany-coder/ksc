import '@tanstack/react-start/server-only'

import { and, desc, eq, sql } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { auditLog, members } from '../db/schema/index.ts'
import { MEMBER_STATUSES } from './member-options.ts'
import type { MemberStatus } from './member-options.ts'

// What happened to one member, newest first: who did what, and when. Read from
// the audit log, which by design holds no personal data, only who, what and
// which row (CLAUDE.md section 3); the one detail kept is a status change's
// from/to. Call requirePermission('members.read') first.

export type HistoryEntry = {
  id: string
  action: string
  // The admin who did it; null for the member's own application, or for an
  // admin whose record has since been purged.
  actorName: string | null
  // Dhaka time, "YYYY-MM-DD" and "HH:MM".
  date: string
  time: string
  // Only for a status change.
  from?: MemberStatus
  to?: MemberStatus
}

const isStatus = (v: unknown): v is MemberStatus =>
  typeof v === 'string' && (MEMBER_STATUSES as readonly string[]).includes(v)

export async function memberHistory(
  memberId: string,
  limit = 50,
): Promise<HistoryEntry[]> {
  const rows = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      actorName: members.name,
      date: sql<string>`to_char(${auditLog.createdAt} at time zone 'Asia/Dhaka', 'YYYY-MM-DD')`,
      time: sql<string>`to_char(${auditLog.createdAt} at time zone 'Asia/Dhaka', 'HH24:MI')`,
      meta: auditLog.meta,
    })
    .from(auditLog)
    .leftJoin(members, eq(auditLog.actorId, members.id))
    .where(
      and(eq(auditLog.targetType, 'member'), eq(auditLog.targetId, memberId)),
    )
    .orderBy(desc(auditLog.createdAt), desc(auditLog.id))
    .limit(limit)

  return rows.map(({ meta, ...row }) => {
    const m = (meta ?? {}) as { from?: unknown; to?: unknown }
    return row.action === 'member.status_change' &&
      isStatus(m.from) &&
      isStatus(m.to)
      ? { ...row, from: m.from, to: m.to }
      : row
  })
}
