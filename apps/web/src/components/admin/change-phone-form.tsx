import { useState } from 'react'

import { useT } from '../../lib/i18n/index.tsx'
import { Button } from '../ui/button.tsx'
import { Input } from '../ui/input.tsx'
import { Label } from '../ui/label.tsx'

export type ChangePhoneResult = { ok: true } | { ok: false; message: string }

/** Super admin only: fix a member's phone number. The server checks the role too. */
export function ChangePhoneForm({
  onSubmit,
}: {
  onSubmit: (phone: string) => Promise<ChangePhoneResult>
}) {
  const t = useT()
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  )

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage(null)
    try {
      const result = await onSubmit(phone)
      if (result.ok) {
        setPhone('')
        setMessage({ ok: true, text: t('memberEdit.phoneChanged') })
      } else setMessage({ ok: false, text: result.message })
    } catch {
      setMessage({ ok: false, text: t('memberEdit.errSave') })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="mt-5 max-w-2xl space-y-3 rounded-[10px] border border-border bg-card p-5"
    >
      <h2 className="text-[15px] font-semibold">
        {t('memberEdit.phoneChangeTitle')}
      </h2>
      <p className="text-[13px] text-muted-foreground">
        {t('memberEdit.phoneChangeHelp')}
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="newPhone">{t('memberEdit.phoneNew')}</Label>
        <Input
          id="newPhone"
          inputMode="tel"
          autoComplete="off"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="tabular-nums md:max-w-xs"
        />
      </div>
      {message && (
        <p
          role={message.ok ? 'status' : 'alert'}
          className={
            message.ok ? 'text-sm text-green-700' : 'text-sm text-red-700'
          }
        >
          {message.text}
        </p>
      )}
      <Button type="submit" variant="outline" disabled={busy || !phone.trim()}>
        {busy ? t('a.wait') : t('memberEdit.phoneChangeBtn')}
      </Button>
    </form>
  )
}
