// One look for every card and highlight on the public site, so the sections
// read as one design. Class strings only (Tailwind), shared by the home page
// sections and the activity cards.

/** A card: rounded, white, hairline border and a soft shadow. */
export const card = 'rounded-2xl border border-line bg-card shadow-card'

/** A card that lifts on hover (see .lift in styles.css). */
export const liftCard = `${card} lift`

/** An icon in a soft green tile. */
export const iconTile =
  'inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary'

/** The same tile in the blood red (blood-related items only). */
export const bloodTile =
  'inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#fbe9e8] text-blood'

/** A step or item number in a soft green tile. */
export const numberTile =
  'inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent font-heading text-lg font-bold text-primary'

/** A date or tag: a rounded pill. */
export const pill =
  'inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-brand-deep'

/** A list item with a small green tick in front (pair with a CircleCheck icon). */
export const tickItem = 'flex gap-3 text-base leading-[1.65] text-copy'

/** Body paragraphs in a section. */
export const bodyText =
  'max-w-[68ch] text-[17px] leading-[1.8] text-zinc-800 md:text-[19px]'
