import { Link } from '@tanstack/react-router'

// Address, email and Facebook are the club's real details from CLAUDE.md. The
// phone number is not known yet, so it stays a visible placeholder.
const linkClass = 'text-mint underline-offset-2 hover:underline'

export function SiteFooter() {
  return (
    <footer className="bg-footer pt-14 pb-10 text-[#c3cfc8]">
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-8">
        <div className="flex flex-wrap gap-12 pb-10">
          <div className="min-w-0 flex-[999_1_300px]">
            <div className="mb-4 flex items-center gap-3">
              <img
                src="/logo.png"
                alt=""
                width={44}
                height={35}
                className="h-[35px] w-11 object-contain"
              />
              <span className="font-heading text-xl font-bold text-background">
                কলমা সোশ্যাল ক্লাব
              </span>
            </div>
            <p className="max-w-[44ch] text-[17px] leading-relaxed">
              একসাথে, এক সুন্দর আগামীর জন্য।
            </p>
          </div>

          <div className="min-w-0 flex-[1_1_220px]">
            <h3 className="mb-3.5 text-[17px] font-semibold text-background">
              ঠিকানা
            </h3>
            <p className="text-[17px] leading-[1.8]">
              গ্রাম: কলমা ১ (আমতলা)
              <br />
              ডাকঘর: ডেইরি ফার্ম
              <br />
              থানা: সাভার, ঢাকা
            </p>
          </div>

          <div className="min-w-0 flex-[1_1_220px]">
            <h3 className="mb-3.5 text-[17px] font-semibold text-background">
              যোগাযোগ
            </h3>
            <p className="text-[17px] leading-[1.8]">
              <a
                href="mailto:kalmasocialclub24@gmail.com"
                className={`${linkClass} break-all`}
              >
                kalmasocialclub24@gmail.com
              </a>
              <br />
              মোবাইল: [নম্বর দিন]
              <br />
              <a
                href="https://www.facebook.com/profile.php?id=100068969464914"
                className={linkClass}
                rel="noopener noreferrer"
              >
                ফেসবুক পেজ
              </a>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-4 border-t border-[#2a3831] pt-6 text-[15px]">
          <span>© ২০২৬ কলমা সোশ্যাল ক্লাব</span>
          <Link
            to="/login"
            className="text-mint underline-offset-2 hover:underline"
          >
            অ্যাডমিন লগইন
          </Link>
        </div>
      </div>
    </footer>
  )
}
