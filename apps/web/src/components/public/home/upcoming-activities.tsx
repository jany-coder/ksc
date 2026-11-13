// "Upcoming activities". It takes real activities as props. Until the club has
// published some, three placeholder cards keep the layout and make clear what
// goes where. Nothing here is invented: an event the club never planned must
// not appear on its public site (CLAUDE.md section 8).
export type UpcomingActivity = {
  id: string
  title: string
  description: string
  dateLabel: string
  location: string
  imageUrl?: string
}

const PLACEHOLDERS: UpcomingActivity[] = [1, 2, 3].map((n) => ({
  id: `placeholder-${n}`,
  title: '[কার্যক্রমের শিরোনাম]',
  description: '[কার্যক্রমের বিবরণ]',
  dateLabel: '[তারিখ]',
  location: '[স্থান]',
}))

export function UpcomingActivities({
  items = [],
}: {
  items?: UpcomingActivity[]
}) {
  const shown = items.length > 0 ? items : PLACEHOLDERS
  return (
    <section
      id="upcoming"
      className="scroll-mt-4 border-y border-line bg-panel py-14 md:py-[92px]"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-8">
        <div className="mb-9 md:mb-11">
          <h2 className="mb-2.5 text-[28px] font-bold text-brand-deep md:text-[40px]">
            আসন্ন কার্যক্রম
          </h2>
          <p className="text-[17px] text-copy md:text-[19px]">
            যেসব আয়োজনে আপনি অংশ নিতে পারেন
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-6">
          {shown.map((item) => (
            <article
              key={item.id}
              className="flex flex-col overflow-hidden rounded-[10px] border border-line bg-card"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="h-[170px] w-full object-cover"
                />
              ) : (
                <div className="flex h-[170px] items-center justify-center border-b border-[#dce3dd] bg-[#e8ede9] p-3 text-center text-sm text-subtle">
                  ছবি — [কার্যক্রমের ছবি দিন]
                </div>
              )}
              <div className="flex grow flex-col gap-3 px-[26px] pt-[26px] pb-7">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-[5px] bg-[#e3f0e9] px-[11px] py-[5px] text-sm font-semibold text-brand-deep">
                    {item.dateLabel}
                  </span>
                  <span className="text-[15px] text-subtle">
                    {item.location}
                  </span>
                </div>
                <h3 className="text-[23px] font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="text-[17px] leading-[1.7] text-copy">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
