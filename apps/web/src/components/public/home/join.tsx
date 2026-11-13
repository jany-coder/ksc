// "Become a member". The application form is NOT built yet: it collects
// personal data from the public, so it needs a consent checkbox (CLAUDE.md
// section 3, absent from the canvas) and spam protection first. Until then
// this shows the real way to reach the club. A dead form would mislead.
export function Join() {
  return (
    <section
      id="jogdin"
      className="scroll-mt-4 border-t border-line bg-panel py-14 md:py-[88px]"
    >
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center gap-12 px-5 md:px-8">
        <div className="min-w-0 flex-[999_1_400px]">
          <h2 className="mb-3.5 text-[28px] font-bold text-brand-deep md:text-[40px]">
            সদস্য হতে চান?
          </h2>
          <p className="max-w-[56ch] text-[17px] leading-[1.7] text-copy md:text-[19px]">
            আমাদের কমিটি যাচাই করে আপনার সাথে যোগাযোগ করবে। সদস্যদের তথ্য শুধু
            ক্লাবের কাজে ব্যবহৃত হয় এবং ওয়েবসাইটে প্রকাশ করা হয় না।
          </p>
        </div>
        <div className="min-w-0 flex-[1_1_360px] rounded-[10px] border border-line bg-card p-[30px]">
          <p className="mb-2.5 text-lg font-semibold text-ink">
            [অনলাইন আবেদন ফরম শীঘ্রই আসছে]
          </p>
          <p className="text-[17px] leading-[1.7] text-copy">
            আপাতত ইমেইলে ক্লাবের সাথে যোগাযোগ করুন:
            <br />
            <a
              href="mailto:kalmasocialclub24@gmail.com"
              className="break-all font-semibold text-primary underline-offset-2 hover:underline"
            >
              kalmasocialclub24@gmail.com
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
