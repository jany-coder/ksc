import '@tanstack/react-start/server-only'

import { and, eq, isNull } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { auditLog, members } from '../db/schema/index.ts'
import {
  MAX_MEMBER_PHOTO_BYTES,
  MAX_MEMBER_PHOTO_SMALL_BYTES,
  isValidDimension,
  looksLikeWebp,
  memberPhotoKey,
  smallPhotoKey,
} from './image-limits.ts'
import { imagesBucket } from './r2.server.ts'

// A member's photo is personal data: admins only (CLAUDE.md section 3).
// Callers check the permission first: members.write to change, members.read to
// view (see routes/api/member-photo/$id.ts). Stored in the same R2 bucket as the
// gallery, under members/, which the public gallery route can never reach (it
// only builds images/<uuid>/... keys).

// A fresh random name each time: a replaced photo gets a new URL, so no
// browser keeps showing the old one.
const keyFor = (memberId: string) =>
  memberPhotoKey(memberId, crypto.randomUUID())

/** Both files of a photo: the 600px one and the 128px one for the list. */
export const bothSizes = (key: string) => [key, smallPhotoKey(key)]

export type MemberPhotoResult =
  | { ok: true }
  | {
      ok: false
      code: 'NOT_FOUND' | 'INVALID_INPUT' | 'NOT_WEBP' | 'TOO_LARGE'
    }

async function currentKey(memberId: string) {
  const [row] = await db
    .select({ key: members.photoR2Key })
    .from(members)
    .where(and(eq(members.id, memberId), isNull(members.archivedAt)))
    .limit(1)
  return row
}

/** Store a new photo for a member, replacing (and deleting) any old one. */
export async function saveMemberPhoto(
  actorId: string,
  memberId: string,
  input: {
    bytes: ArrayBuffer
    small: ArrayBuffer
    width: number
    height: number
  },
): Promise<MemberPhotoResult> {
  if (!isValidDimension(input.width) || !isValidDimension(input.height))
    return { ok: false, code: 'INVALID_INPUT' }
  if (
    input.bytes.byteLength > MAX_MEMBER_PHOTO_BYTES ||
    input.small.byteLength > MAX_MEMBER_PHOTO_SMALL_BYTES
  )
    return { ok: false, code: 'TOO_LARGE' }
  // Trust the bytes, not the browser's claim about the file type.
  if (
    !looksLikeWebp(new Uint8Array(input.bytes)) ||
    !looksLikeWebp(new Uint8Array(input.small))
  )
    return { ok: false, code: 'NOT_WEBP' }

  const row = await currentKey(memberId)
  if (!row) return { ok: false, code: 'NOT_FOUND' }

  const key = keyFor(memberId)
  const webp = { httpMetadata: { contentType: 'image/webp' } }
  await Promise.all([
    imagesBucket.put(key, input.bytes, webp),
    imagesBucket.put(smallPhotoKey(key), input.small, webp),
  ])
  try {
    await db.batch([
      db
        .update(members)
        .set({ photoR2Key: key })
        .where(eq(members.id, memberId)),
      // Who and whom, nothing else (no personal data in the log).
      db.insert(auditLog).values({
        actorId,
        action: 'member.photo',
        targetType: 'member',
        targetId: memberId,
      }),
    ])
  } catch (error) {
    await imagesBucket.delete(bothSizes(key)) // nothing points at them
    throw error
  }
  // Older photos have no small copy; deleting a missing key is harmless.
  if (row.key) await imagesBucket.delete(bothSizes(row.key))
  return { ok: true }
}

/** Remove a member's photo, file included. */
export async function deleteMemberPhoto(
  actorId: string,
  memberId: string,
): Promise<MemberPhotoResult> {
  const row = await currentKey(memberId)
  if (!row) return { ok: false, code: 'NOT_FOUND' }
  if (!row.key) return { ok: true }
  await db.batch([
    db
      .update(members)
      .set({ photoR2Key: null })
      .where(eq(members.id, memberId)),
    db.insert(auditLog).values({
      actorId,
      action: 'member.photoRemove',
      targetType: 'member',
      targetId: memberId,
    }),
  ])
  await imagesBucket.delete(bothSizes(row.key))
  return { ok: true }
}

/**
 * The photo file for a member (archived ones too, for the archive view), or
 * null. `small` asks for the 128px copy; photos saved before there was one fall
 * back to the big file.
 */
export async function getMemberPhotoObject(memberId: string, small: boolean) {
  const [row] = await db
    .select({ key: members.photoR2Key })
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1)
  if (!row?.key) return null
  if (small) {
    const object = await imagesBucket.get(smallPhotoKey(row.key))
    if (object) return object
  }
  return imagesBucket.get(row.key)
}
