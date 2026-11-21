import type { CSSProperties } from 'react'

import { bloodLabel } from '../../lib/member-options.ts'
import type { BloodGroup } from '../../lib/member-options.ts'
import { cn } from '../../lib/utils.ts'

// Each blood group's colour (defined in styles.css, light and dark).
const COLOR_VAR: Record<BloodGroup, string> = {
  'A+': 'var(--blood-a-pos)',
  'A-': 'var(--blood-a-neg)',
  'B+': 'var(--blood-b-pos)',
  'B-': 'var(--blood-b-neg)',
  'AB+': 'var(--blood-ab-pos)',
  'AB-': 'var(--blood-ab-neg)',
  'O+': 'var(--blood-o-pos)',
  'O-': 'var(--blood-o-neg)',
}

/** The group's colour, for a bar or a dot. */
export const bloodColor = (group: BloodGroup) => COLOR_VAR[group]

/**
 * Style for anything tinted with a group's colour: a very light wash of it
 * behind, a slightly stronger border. The text stays the normal text colour,
 * so it is readable in both themes whatever the hue.
 */
export function bloodTint(group: BloodGroup): CSSProperties {
  const color = COLOR_VAR[group]
  return {
    backgroundColor: `color-mix(in oklab, ${color} 13%, var(--card))`,
    borderColor: `color-mix(in oklab, ${color} 45%, var(--card))`,
  }
}

const SIZES = {
  // In tables and lists.
  sm: 'min-w-[42px] gap-1 rounded-md px-1.5 py-0.5 text-xs',
  // In a header next to the name.
  md: 'gap-1.5 rounded-full px-2.5 py-0.5 text-[13px]',
} as const

/** "A+" in its group's colour: a tinted pill with a dot of the full colour. */
export function BloodChip({
  group,
  size = 'sm',
  className,
}: {
  group: BloodGroup
  size?: keyof typeof SIZES
  className?: string
}) {
  return (
    <span
      style={bloodTint(group)}
      className={cn(
        'inline-flex items-center justify-center border font-semibold whitespace-nowrap text-foreground tabular-nums',
        SIZES[size],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: COLOR_VAR[group] }}
      />
      {bloodLabel(group)}
    </span>
  )
}
