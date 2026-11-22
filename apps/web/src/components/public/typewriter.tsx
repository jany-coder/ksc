import { useEffect, useLayoutEffect, useState } from 'react'

// Types a line out letter by letter, with a blinking cursor that fades once
// it is done. The whole line is what the server sends and what search
// engines, screen readers and a browser without JavaScript get; the typing
// is drawn over an invisible copy of it, so nothing below moves meanwhile.
// It stays still for anyone whose device asks for reduced motion.

// Letters as a reader sees them: a Bengali conjunct ("ন্দ") is several code
// points but appears at once, never half-typed.
function lettersOf(text: string): string[] {
  return [
    ...new Intl.Segmenter('bn', { granularity: 'grapheme' }).segment(text),
  ].map((part) => part.segment)
}

const START_MS = 650 // after the hero's lines have risen into place
const LETTER_MS = 85
const CURSOR_MS = 2600 // how long the cursor stays once the line is typed

export function Typewriter({ text }: { text: string }) {
  const letters = lettersOf(text)
  // null: show the whole line (the server, and before the effect runs).
  const [shown, setShown] = useState<number | null>(null)
  const [cursor, setCursor] = useState(false)

  // Before the first paint, so the full line never flashes and then vanishes.
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setShown(0)
    setCursor(true)
  }, [text])

  useEffect(() => {
    if (shown === null) return
    if (shown >= letters.length) {
      const timer = window.setTimeout(() => setCursor(false), CURSOR_MS)
      return () => window.clearTimeout(timer)
    }
    const timer = window.setTimeout(
      () => setShown(shown + 1),
      shown === 0 ? START_MS : LETTER_MS,
    )
    return () => window.clearTimeout(timer)
  }, [shown, letters.length])

  // Until the typing starts. With JavaScript on, CSS keeps it hidden (see
  // .typewriter-pending in styles.css), so it never shows and then vanishes.
  if (shown === null) return <span className="typewriter-pending">{text}</span>
  return (
    <span className="relative inline-block">
      {/* Holds the line's full size; read by screen readers. */}
      <span className="invisible">{text}</span>
      <span aria-hidden="true" className="absolute inset-0">
        {letters.slice(0, shown).join('')}
        {/* Zero width, so the cursor never pushes onto a new line: it hangs
            just after the last letter typed. */}
        {/* (The zero-width space gives it the line's height.) */}
        <span className="relative inline-block w-0">
          {'\u200b'}
          <span
            className={`typewriter-cursor absolute start-1 top-1/2 h-[0.95em] w-[2px] -translate-y-1/2 bg-current transition-opacity duration-500 ${cursor ? 'opacity-100' : 'opacity-0'}`}
          />
        </span>
      </span>
    </span>
  )
}
