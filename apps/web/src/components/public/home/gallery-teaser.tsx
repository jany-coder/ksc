// A taste of the gallery, on the dark section. Photos come in as props; until
// real ones are uploaded, six placeholder tiles keep the grid. The full gallery
// page and its link come later, so no dead button is shown here.
export type GalleryPhoto = {
  id: string
  caption: string
  thumbUrl: string
}

const PLACEHOLDERS = [
  'রক্তদান ক্যাম্প',
  'ত্রাণ বিতরণ',
  'খেলাধুলা',
  'সাধারণ সভা',
  'শিক্ষা সহায়তা',
  'পরিচ্ছন্নতা অভিযান',
]

export function GalleryTeaser({ photos = [] }: { photos?: GalleryPhoto[] }) {
  return (
    <section
      id="gallery"
      className="scroll-mt-4 bg-brand-deep py-14 md:py-[92px]"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-8">
        <div className="mb-9 md:mb-11">
          <h2 className="mb-2.5 text-[28px] font-bold text-background md:text-[40px]">
            কাজের ছবি
          </h2>
          <p className="text-[17px] text-mint-muted md:text-[19px]">
            আমাদের কার্যক্রমের মুহূর্তগুলো
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4">
          {photos.length > 0
            ? photos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.thumbUrl}
                  alt={photo.caption}
                  loading="lazy"
                  className="h-[230px] w-full rounded-lg object-cover"
                />
              ))
            : PLACEHOLDERS.map((label, i) => (
                <div
                  key={label}
                  className="flex h-[230px] items-center justify-center rounded-lg border border-mint-line bg-[#164a35] p-3 text-center text-sm text-mint-muted"
                >
                  ছবি {['১', '২', '৩', '৪', '৫', '৬'][i]} — [{label}]
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}
