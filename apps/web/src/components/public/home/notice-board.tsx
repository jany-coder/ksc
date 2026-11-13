import { cn } from '../../../lib/utils.ts'

// "Notice board". Real notices come in as props. Until then, placeholders: in
// particular no made-up urgent notice, since a fake blood request on a public
// site could cause real harm.
export type Notice = {
  id: string
  title: string
  body: string
  dateLabel: string
  urgent?: boolean
}

const PLACEHOLDERS: Notice[] = [1, 2, 3].map((n) => ({
  id: `placeholder-${n}`,
  title: '[নোটিশের শিরোনাম]',
  body: '[নোটিশের বিবরণ]',
  dateLabel: '[তারিখ]',
}))

export function NoticeBoard({ items = [] }: { items?: Notice[] }) {
  const shown = items.length > 0 ? items : PLACEHOLDERS
  return (
    <section id="notice" className="scroll-mt-4 py-14 md:py-[92px]">
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap gap-14 px-5 md:px-8">
        <div className="min-w-0 flex-[1_1_280px]">
          <h2 className="mb-3.5 text-[28px] font-bold text-brand-deep md:text-[40px]">
            নোটিশ বোর্ড
          </h2>
          <p className="text-[17px] leading-[1.65] text-copy md:text-[19px]">
            ক্লাবের ঘোষণা, সিদ্ধান্ত ও জরুরি খবর এখানে প্রকাশ করা হয়।
          </p>
        </div>
        <ul className="m-0 flex min-w-0 flex-[999_1_460px] list-none flex-col border-t border-line p-0">
          {shown.map((n) => (
            <li
              key={n.id}
              className="flex flex-wrap gap-5 border-b border-line py-[26px]"
            >
              <span className="flex-[0_0_96px] pt-[3px] text-[15px] text-subtle">
                {n.dateLabel}
              </span>
              <div className="min-w-0 flex-[999_1_240px]">
                <h3
                  className={cn(
                    'mb-1.5 flex flex-wrap items-center gap-2.5 text-xl font-semibold text-ink',
                  )}
                >
                  {n.urgent && (
                    <span className="rounded bg-[#fbe8e7] px-[9px] py-[3px] font-sans text-[13px] font-semibold text-[#9e2a23]">
                      জরুরি
                    </span>
                  )}
                  {n.title}
                </h3>
                <p className="text-base leading-[1.65] text-copy">{n.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
