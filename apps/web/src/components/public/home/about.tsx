// "About us". The text is the club's own description from the approved design,
// to be confirmed by the club before launch.
const PARAGRAPHS = [
  '২০২৪ সালে এলাকার একদল উদ্যমী তরুণের হাত ধরে কলমা সোশ্যাল ক্লাবের পথচলা শুরু। শুরু থেকেই আমরা ক্লাবটিকে কেবল নির্দিষ্ট কিছু মানুষের মিলনকেন্দ্র হিসেবে রাখিনি।',
  'প্রবীণদের অভিজ্ঞতা আর যুবসমাজের প্রাণশক্তি — দুটোকে একসাথে কাজে লাগিয়ে আমরা এমন এক সমাজ গড়তে চাই, যেখানে প্রতিটি মানুষ একে অপরের পরিপূরক।',
  'ক্লাবের প্রতিটি সদস্য কেবল সদস্য নন — তাঁরা প্রত্যেকে পরিবর্তনের একজন সক্রিয় কারিগর।',
]

const VALUES = [
  { title: 'অরাজনৈতিক', text: 'ক্লাব কোনো রাজনৈতিক দলের সাথে যুক্ত নয়।' },
  { title: 'অসাম্প্রদায়িক', text: 'ধর্ম-বর্ণ নির্বিশেষে সবার জন্য উন্মুক্ত।' },
  { title: 'সমান অংশীদারিত্ব', text: 'নবীন-প্রবীণ সব সদস্যের মত সমান গুরুত্ব পায়।' },
  { title: 'জ্ঞানভিত্তিক', text: 'ঐতিহ্য রক্ষা করে শিক্ষা ও সচেতনতার পথে এগোনো।' },
]

export function About() {
  return (
    <section id="porichiti" className="scroll-mt-4 py-14 md:py-[92px]">
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap gap-12 px-5 md:gap-16 md:px-8">
        <div className="min-w-0 flex-[999_1_420px]">
          <h2 className="mb-6 text-[28px] font-bold text-brand-deep md:text-[40px]">
            আমাদের পরিচিতি
          </h2>
          {PARAGRAPHS.map((text) => (
            <p
              key={text}
              className="mb-5 max-w-[64ch] text-[17px] leading-[1.8] text-zinc-800 last:mb-0 md:text-[19px]"
            >
              {text}
            </p>
          ))}
        </div>
        <ul className="m-0 flex min-w-0 flex-[1_1_280px] list-none flex-col gap-0.5 overflow-hidden rounded-[10px] border border-line bg-line p-0">
          {VALUES.map((v) => (
            <li key={v.title} className="bg-card px-[26px] py-6">
              <h3 className="mb-1.5 text-[19px] font-semibold text-brand-deep">
                {v.title}
              </h3>
              <p className="text-base leading-[1.65] text-copy">{v.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
