import type { ReactNode } from 'react'

import { cn } from '../../lib/utils.ts'

/**
 * The top of a home page section: a short accent bar, the title and its
 * subtitle. Intro paragraphs (children) sit beside the title on wide screens
 * and under it on a phone, so long text reads as two calm columns instead of
 * one wall. `tone="dark"` is for the sections on deep green.
 */
export function SectionHeading({
  title,
  subtitle,
  tone = 'light',
  children,
  className,
}: {
  title: string
  subtitle?: string
  tone?: 'light' | 'dark'
  children?: ReactNode
  className?: string
}) {
  const dark = tone === 'dark'
  return (
    <div
      className={cn(
        'mb-10 grid gap-5 md:mb-14',
        children && 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:gap-14',
        className,
      )}
    >
      <div className="min-w-0">
        <span
          aria-hidden="true"
          className={cn(
            'mb-4 block h-1 w-12 rounded-full',
            dark ? 'bg-mint' : 'bg-primary',
          )}
        />
        <h2
          className={cn(
            'text-[28px] leading-tight font-bold md:text-[40px]',
            dark ? 'text-white' : 'text-brand-deep',
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              'mt-2 font-heading text-lg font-semibold md:text-xl',
              dark ? 'text-mint' : 'text-primary',
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex min-w-0 flex-col gap-4 lg:pt-5">{children}</div>
      )}
    </div>
  )
}
