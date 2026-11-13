import { Link } from '@tanstack/react-router'

import { useT } from '../../lib/i18n/index.tsx'

// Address, email and Facebook are the club's real details from CLAUDE.md. The
// phone number is not known yet, so it stays a visible placeholder.
const linkClass = 'text-mint underline-offset-2 hover:underline'

export function SiteFooter() {
  const t = useT()
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
                {t('site.name')}
              </span>
            </div>
            <p className="max-w-[44ch] text-[17px] leading-relaxed">
              {t('site.tagline')}
            </p>
          </div>

          <div className="min-w-0 flex-[1_1_220px]">
            <h3 className="mb-3.5 text-[17px] font-semibold text-background">
              {t('footer.address')}
            </h3>
            <p className="text-[17px] leading-[1.8]">
              {t('footer.village')}
              <br />
              {t('footer.post')}
              <br />
              {t('footer.thana')}
            </p>
          </div>

          <div className="min-w-0 flex-[1_1_220px]">
            <h3 className="mb-3.5 text-[17px] font-semibold text-background">
              {t('footer.contact')}
            </h3>
            <p className="text-[17px] leading-[1.8]">
              <a
                href="mailto:kalmasocialclub24@gmail.com"
                className={`${linkClass} break-all`}
              >
                kalmasocialclub24@gmail.com
              </a>
              <br />
              {t('footer.mobile')}
              <br />
              <a
                href="https://www.facebook.com/profile.php?id=100068969464914"
                className={linkClass}
                rel="noopener noreferrer"
              >
                {t('footer.facebook')}
              </a>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-4 border-t border-[#2a3831] pt-6 text-[15px]">
          <span>{t('footer.copyright')}</span>
          <Link
            to="/login"
            className="text-mint underline-offset-2 hover:underline"
          >
            {t('footer.adminLogin')}
          </Link>
        </div>
      </div>
    </footer>
  )
}
