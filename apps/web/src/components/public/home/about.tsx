import { useT } from '../../../lib/i18n/index.tsx'
import type { MessageKey } from '../../../lib/i18n/messages.ts'

// "About us". The text is the club's own description from the approved design,
// to be confirmed by the club before launch (the English too).
const PARAGRAPHS: MessageKey[] = ['about.p1', 'about.p2', 'about.p3']

const VALUES: { title: MessageKey; text: MessageKey }[] = [
  { title: 'about.v1Title', text: 'about.v1Text' },
  { title: 'about.v2Title', text: 'about.v2Text' },
  { title: 'about.v3Title', text: 'about.v3Text' },
  { title: 'about.v4Title', text: 'about.v4Text' },
]

export function About() {
  const t = useT()
  return (
    <section
      id="about"
      className="scroll-mt-4 md:scroll-mt-16 py-14 md:py-[92px]"
    >
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap gap-12 px-5 md:gap-16 md:px-8">
        <div className="min-w-0 flex-[999_1_420px]">
          <h2 className="mb-6 text-[28px] font-bold text-brand-deep md:text-[40px]">
            {t('about.title')}
          </h2>
          {PARAGRAPHS.map((key) => (
            <p
              key={key}
              className="mb-5 max-w-[64ch] text-[17px] leading-[1.8] text-zinc-800 last:mb-0 md:text-[19px]"
            >
              {t(key)}
            </p>
          ))}
        </div>
        <ul className="m-0 flex min-w-0 flex-[1_1_280px] list-none flex-col gap-0.5 overflow-hidden rounded-[10px] border border-line bg-line p-0">
          {VALUES.map((v) => (
            <li key={v.title} className="bg-card px-[26px] py-6">
              <h3 className="mb-1.5 text-[19px] font-semibold text-brand-deep">
                {t(v.title)}
              </h3>
              <p className="text-base leading-[1.65] text-copy">{t(v.text)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
