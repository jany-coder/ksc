import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

import { cn } from '../lib/utils.ts'
import { Input } from './ui/input.tsx'

// A password field with a show/hide button. Typing a long password blind on a
// phone is a common source of "wrong password" for older users.
export function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type'>) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        className={cn('pe-10', className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান'}
        aria-pressed={visible}
        className="absolute inset-y-0 end-0 flex w-10 items-center justify-center rounded-e-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}
