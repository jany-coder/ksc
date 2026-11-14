import { Link } from '@tanstack/react-router'

import { useLocaleParams, useT } from '../../../lib/i18n/index.tsx'
import { buttonVariants } from '../../ui/button.tsx'

// "Become a member": a short invitation that links to the application form
// at /join, where the consent checkbox and spam protection live.
export function Join() {
  const t = useT()
  const localeParams = useLocaleParams()
  return (
    <section
      id="join"
      className="scroll-mt-4 md:scroll-mt-20 bg-primary py-14 text-primary-foreground md:py-[88px]"
    >
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center gap-12 px-5 md:px-8">
        <div className="min-w-0 flex-[999_1_400px]">
          <h2 className="mb-3.5 text-[28px] font-bold text-white md:text-[40px]">
            {t('joinSection.title')}
          </h2>
          <p className="max-w-[56ch] text-[17px] leading-[1.7] text-mint-soft md:text-[19px]">
            {t('joinSection.lead')}
          </p>
        </div>
        <div className="min-w-0 flex-[1_1_360px] rounded-[10px] border border-line bg-card p-[30px]">
          <Link
            to="/{-$locale}/join"
            params={localeParams}
            className={buttonVariants({
              size: 'lg',
              className: 'mb-4 h-12 px-6 text-[17px]',
            })}
          >
            {t('joinSection.apply')}
          </Link>
          <p className="text-[17px] leading-[1.7] text-copy">
            {t('joinSection.orEmail')}
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
