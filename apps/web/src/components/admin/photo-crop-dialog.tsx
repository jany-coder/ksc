import { useEffect, useRef, useState } from 'react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'

import type { CropArea } from '../../lib/image-resize.ts'
import { useT } from '../../lib/i18n/index.tsx'
import { Button } from '../ui/button.tsx'

/**
 * Choose the square part of a photo to keep, the way phones and most apps do
 * it: drag the photo under a fixed square, pinch or use the slider to zoom.
 * The cropping itself happens afterwards on a canvas (lib/image-resize.ts);
 * this only reports which square, in the photo's own pixels.
 *
 * react-easy-crop handles the dragging, pinch-zoom and arrow keys. The dialog
 * is the browser's own <dialog> (dark backdrop, Esc and a focus trap for free),
 * full screen on a phone and a centred panel from sm up.
 */
export function PhotoCropDialog({
  file,
  busy,
  error,
  onCancel,
  onSave,
}: {
  file: File
  busy: boolean
  error: string | null
  onCancel: () => void
  onSave: (area: CropArea) => void
}) {
  const t = useT()
  const dialog = useRef<HTMLDialogElement>(null)
  const [src, setSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)

  // A temporary local URL for the chosen file; freed when the dialog goes.
  useEffect(() => {
    const url = URL.createObjectURL(file)
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    const el = dialog.current
    if (el && !el.open) el.showModal()
  }, [])

  return (
    <dialog
      ref={dialog}
      aria-labelledby="photo-crop-title"
      // No closing half-way through an upload.
      onCancel={(e) => {
        if (busy) e.preventDefault()
      }}
      onClose={onCancel}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-card p-0 text-foreground backdrop:bg-black/50 sm:m-auto sm:h-auto sm:max-w-md sm:rounded-[10px] sm:border sm:border-border sm:shadow-xl"
    >
      <div className="flex h-full flex-col gap-4 p-4 sm:p-5">
        <div>
          <h2 id="photo-crop-title" className="text-lg font-semibold">
            {t('memberPhoto.cropTitle')}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {t('memberPhoto.cropHint')}
          </p>
        </div>

        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-zinc-900">
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={1}
              maxZoom={4}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setArea(pixels)}
              mediaProps={{ alt: '' }}
              cropperProps={{ 'aria-label': t('memberPhoto.cropArea') }}
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="photo-crop-zoom" className="text-sm font-medium">
            {t('memberPhoto.zoom')}
          </label>
          <input
            id="photo-crop-zoom"
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-11 grow accent-primary sm:h-9"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        {/* At the bottom of the screen on a phone, under the thumb. */}
        <div className="mt-auto flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 sm:h-9"
            disabled={busy}
            onClick={() => dialog.current?.close()}
          >
            {t('a.cancel')}
          </Button>
          <Button
            type="button"
            className="h-11 sm:h-9"
            disabled={busy || !area}
            onClick={() => {
              if (area) onSave(area)
            }}
          >
            {busy ? t('a.wait') : t('memberPhoto.cropSave')}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
