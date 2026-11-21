import {
  FULL_WIDTH,
  MAX_FULL_BYTES,
  MAX_MEMBER_PHOTO_BYTES,
  MAX_MEMBER_PHOTO_SMALL_BYTES,
  MEMBER_PHOTO_SMALL_WIDTH,
  MEMBER_PHOTO_WIDTH,
  MAX_THUMB_BYTES,
  THUMB_WIDTH,
} from './image-limits.ts'

// Browser only: shrinks a photo BEFORE it is uploaded (CLAUDE.md section 7).
// A 4 MB phone photo becomes ~250 KB at 1600px wide, plus a ~30 KB thumbnail at
// 400px. That keeps uploads fast on weak connections and keeps R2 inside its
// free allowance.
export type ResizedImage = {
  full: Blob
  thumb: Blob
  width: number
  height: number
}

export type ResizeErrorCode = 'UNREADABLE' | 'WEBP_UNSUPPORTED' | 'TOO_BIG'

export class ResizeError extends Error {
  readonly code: ResizeErrorCode
  constructor(code: ResizeErrorCode) {
    super(code)
    this.name = 'ResizeError'
    this.code = code
  }
}

function toWebp(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        // A browser that cannot write WebP quietly hands back a PNG instead.
        if (!blob || blob.type !== 'image/webp')
          reject(new ResizeError('WEBP_UNSUPPORTED'))
        else resolve(blob)
      },
      'image/webp',
      quality,
    )
  })
}

function drawScaled(bitmap: ImageBitmap, targetWidth: number) {
  // Never enlarge a small photo.
  const scale = Math.min(1, targetWidth / bitmap.width)
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new ResizeError('UNREADABLE')
  context.drawImage(bitmap, 0, 0, width, height)
  return { canvas, width, height }
}

// Try a good quality first; step down only if the file is still too big.
async function encodeUnder(
  canvas: HTMLCanvasElement,
  qualities: number[],
  maxBytes: number,
): Promise<Blob> {
  for (const quality of qualities) {
    const blob = await toWebp(canvas, quality)
    if (blob.size <= maxBytes) return blob
  }
  throw new ResizeError('TOO_BIG')
}

export async function resizeForUpload(file: File): Promise<ResizedImage> {
  let bitmap: ImageBitmap
  try {
    // Applies the phone's rotation (EXIF), so portrait photos stay upright.
    bitmap = await createImageBitmap(file)
  } catch {
    throw new ResizeError('UNREADABLE')
  }
  try {
    const full = drawScaled(bitmap, FULL_WIDTH)
    const thumb = drawScaled(bitmap, THUMB_WIDTH)
    return {
      full: await encodeUnder(full.canvas, [0.82, 0.72, 0.62], MAX_FULL_BYTES),
      thumb: await encodeUnder(thumb.canvas, [0.75, 0.6, 0.5], MAX_THUMB_BYTES),
      width: full.width,
      height: full.height,
    }
  } finally {
    bitmap.close()
  }
}

export type UploadOutcome = { ok: true } | { ok: false; code: string }

/** Send the two files to /api/images (see routes/api/images.ts). */
export async function uploadResized(
  image: ResizedImage,
  // The activity to file the photo under; null for none.
  activityId: string | null = null,
): Promise<UploadOutcome> {
  const form = new FormData()
  if (activityId) form.set('activityId', activityId)
  form.set('full', image.full, 'full.webp')
  form.set('thumb', image.thumb, 'thumb.webp')
  form.set('width', String(image.width))
  form.set('height', String(image.height))
  const response = await fetch('/api/images', { method: 'POST', body: form })
  const body = (await response.json().catch(() => null)) as {
    ok?: boolean
    code?: string
  } | null
  return response.ok && body?.ok
    ? { ok: true }
    : { ok: false, code: body?.code ?? 'FAILED' }
}

/** The part of the photo the admin kept, in the photo's own pixels. */
export type CropArea = { x: number; y: number; width: number; height: number }

export type MemberPhotoFiles = { photo: Blob; small: Blob; side: number }

// Draw the kept square into a new square canvas `side` pixels wide.
function drawCrop(bitmap: ImageBitmap, area: CropArea, side: number) {
  const canvas = document.createElement('canvas')
  canvas.width = side
  canvas.height = side
  const context = canvas.getContext('2d')
  if (!context) throw new ResizeError('UNREADABLE')
  context.imageSmoothingQuality = 'high'
  context.drawImage(
    bitmap,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    side,
    side,
  )
  return canvas
}

/**
 * A member's photo, cropped to the square the admin chose: one WebP at most
 * 600px a side (under 200 KB) and a 128px copy for the members list.
 */
export async function cropMemberPhoto(
  file: File,
  area: CropArea,
): Promise<MemberPhotoFiles> {
  let bitmap: ImageBitmap
  try {
    // Turned upright from the phone's EXIF, the same way the <img> in the
    // cropper shows it, so the crop lands where the admin put it.
    bitmap = await createImageBitmap(file)
  } catch {
    throw new ResizeError('UNREADABLE')
  }
  try {
    // Never enlarge: a small crop stays its own size.
    const side = Math.max(
      1,
      Math.min(MEMBER_PHOTO_WIDTH, Math.round(area.width)),
    )
    const small = Math.min(MEMBER_PHOTO_SMALL_WIDTH, side)
    return {
      photo: await encodeUnder(
        drawCrop(bitmap, area, side),
        [0.82, 0.72, 0.62],
        MAX_MEMBER_PHOTO_BYTES,
      ),
      small: await encodeUnder(
        drawCrop(bitmap, area, small),
        [0.8, 0.65],
        MAX_MEMBER_PHOTO_SMALL_BYTES,
      ),
      side,
    }
  } finally {
    bitmap.close()
  }
}
