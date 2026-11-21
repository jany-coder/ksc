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
// A 4 MB phone photo becomes ~300-500 KB at 1600px wide, plus a ~100-150 KB
// thumbnail at 800px. That keeps uploads fast on weak connections and keeps R2 inside its
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

function newCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new ResizeError('UNREADABLE')
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  return { canvas, context }
}

/**
 * Draw `area` of `source` at `width` x `height`, keeping it sharp.
 *
 * A canvas shrinking a photo in one big jump (a 4000px phone photo straight to
 * 800px) reads only a few of the pixels it passes over, which leaves jagged
 * edges and a soft, grainy look. Halving step by step, each step with the
 * browser's best smoothing, lets every pixel count, the way photo editors do it.
 */
function drawArea(
  source: CanvasImageSource,
  area: CropArea,
  width: number,
  height: number,
): HTMLCanvasElement {
  let from = source
  let box = area
  while (box.width / 2 >= width && box.height / 2 >= height) {
    const w = Math.round(box.width / 2)
    const h = Math.round(box.height / 2)
    const step = newCanvas(w, h)
    step.context.drawImage(
      from,
      box.x,
      box.y,
      box.width,
      box.height,
      0,
      0,
      w,
      h,
    )
    from = step.canvas
    box = { x: 0, y: 0, width: w, height: h }
  }
  const out = newCanvas(width, height)
  out.context.drawImage(
    from,
    box.x,
    box.y,
    box.width,
    box.height,
    0,
    0,
    width,
    height,
  )
  return out.canvas
}

function drawScaled(
  source: CanvasImageSource & { width: number; height: number },
  targetWidth: number,
) {
  // Never enlarge a small photo.
  const scale = Math.min(1, targetWidth / source.width)
  const width = Math.max(1, Math.round(source.width * scale))
  const height = Math.max(1, Math.round(source.height * scale))
  const whole = { x: 0, y: 0, width: source.width, height: source.height }
  return { canvas: drawArea(source, whole, width, height), width, height }
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
    // From the large copy, which is already smooth: one more halving.
    const thumb = drawScaled(full.canvas, THUMB_WIDTH)
    // High quality first; lower only for a photo too busy to fit the limit.
    return {
      full: await encodeUnder(
        full.canvas,
        [0.9, 0.85, 0.78, 0.7],
        MAX_FULL_BYTES,
      ),
      thumb: await encodeUnder(
        thumb.canvas,
        [0.88, 0.8, 0.7, 0.6],
        MAX_THUMB_BYTES,
      ),
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
const drawCrop = (bitmap: ImageBitmap, area: CropArea, side: number) =>
  drawArea(bitmap, area, side, side)

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
        [0.9, 0.82, 0.72, 0.62],
        MAX_MEMBER_PHOTO_BYTES,
      ),
      small: await encodeUnder(
        drawCrop(bitmap, area, small),
        [0.88, 0.75, 0.65],
        MAX_MEMBER_PHOTO_SMALL_BYTES,
      ),
      side,
    }
  } finally {
    bitmap.close()
  }
}
