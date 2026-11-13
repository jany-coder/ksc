import { cn } from '../../lib/utils.ts'

type Props = Omit<React.ComponentProps<'input'>, 'type'> & {
  label: React.ReactNode
  description?: React.ReactNode
}

// A native checkbox wrapped in its <label>, so the whole line is clickable and
// screen readers announce the text. The green comes from `accent-primary`.
function CheckboxField({ label, description, className, ...props }: Props) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-2.5', className)}>
      <input
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary"
        {...props}
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm leading-snug font-medium">{label}</span>
        {description && (
          <span className="text-[13px] leading-snug text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </label>
  )
}

export { CheckboxField }
