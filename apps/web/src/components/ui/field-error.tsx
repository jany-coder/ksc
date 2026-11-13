import { useTMessage } from '../../lib/i18n/index.tsx'

// A form field's error line. `message` is usually a message KEY from a schema;
// it is shown in the reader's language.
export function FieldError({
  id,
  message,
  className = 'text-sm text-red-700',
}: {
  id: string
  message?: string | undefined
  className?: string
}) {
  const tm = useTMessage()
  return message ? (
    <p id={id} className={className}>
      {tm(message)}
    </p>
  ) : null
}
