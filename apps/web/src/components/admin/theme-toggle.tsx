import { useRouteContext, useRouter } from '@tanstack/react-router'
import { Monitor, Moon, Sun } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { saveTheme } from '../../lib/admin-theme.ts'
import type { AdminTheme } from '../../lib/admin-theme.ts'
import { useT } from '../../lib/i18n/index.tsx'
import type { MessageKey } from '../../lib/i18n/messages.ts'
import { cn } from '../../lib/utils.ts'

const OPTIONS: { value: AdminTheme; icon: LucideIcon; label: MessageKey }[] = [
  { value: 'light', icon: Sun, label: 'theme.light' },
  { value: 'dark', icon: Moon, label: 'theme.dark' },
  { value: 'system', icon: Monitor, label: 'theme.system' },
]

/**
 * Light, dark, or the same as the device. Three real radio buttons (one
 * choice of three), drawn as a segmented control. The choice is saved in a
 * cookie; the router then re-reads it and the root layout swaps the class on
 * <html> (see lib/admin-theme.ts), so nothing reloads.
 */
export function ThemeToggle() {
  const t = useT()
  const router = useRouter()
  // Read from the cookie by the root route, so this re-renders on a change.
  const current = useRouteContext({
    from: '__root__',
    select: (c) => c.adminTheme,
  })

  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{t('theme.label')}</legend>
      <div className="grid grid-cols-3 gap-0.5 rounded-lg border border-border bg-secondary p-0.5">
        {OPTIONS.map(({ value, icon: Icon, label }) => (
          <label
            key={value}
            title={value === 'system' ? t('theme.systemHint') : undefined}
            className={cn(
              'flex min-h-8 cursor-pointer items-center justify-center gap-1 rounded-md px-1 text-xs font-medium',
              'has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50',
              current === value
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <input
              type="radio"
              name="admin-theme"
              value={value}
              checked={current === value}
              onChange={() => {
                saveTheme(value)
                void router.invalidate()
              }}
              className="sr-only"
            />
            <Icon aria-hidden="true" className="size-3.5 shrink-0" />
            <span className="truncate">{t(label)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
