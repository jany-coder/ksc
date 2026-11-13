import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { PasswordInput } from '../components/password-input.tsx'
import { Button } from '../components/ui/button.tsx'
import { Input } from '../components/ui/input.tsx'
import { LangToggle } from '../components/lang-toggle.tsx'
import { Label } from '../components/ui/label.tsx'
import { authClient } from '../lib/auth-client.ts'
import { getCurrentMemberFn } from '../lib/auth.functions.ts'
import { FieldError } from '../components/ui/field-error.tsx'
import { useT } from '../lib/i18n/index.tsx'
import { langOfMatches } from '../lib/i18n/core.ts'
import type { HeadArgs } from '../lib/i18n/core.ts'
import { tFor } from '../lib/i18n/messages.ts'
import { normalizePhone } from '../lib/phone.ts'

export const Route = createFileRoute('/login')({
  head: ({ matches }: HeadArgs) => ({
    meta: [
      { title: tFor(langOfMatches(matches))('auth.pageTitleSignIn') },
      // Member and admin pages are never indexed (CLAUDE.md section 3).
      { name: 'robots', content: 'noindex' },
    ],
  }),
  // Already signed in? No reason to see the form.
  beforeLoad: async () => {
    if (await getCurrentMemberFn()) throw redirect({ to: '/admin' })
  },
  component: LoginPage,
})

// Same rule the server applies, so typos are caught before a request is sent.
// The server does the real check; this only saves a round trip.
const schema = z.object({
  phone: z
    .string()
    .trim()
    .refine((v) => normalizePhone(v) !== null, 'val.phoneInvalid'),
  password: z.string().min(1, 'val.passwordRequired'),
})
type Values = z.infer<typeof schema>

// Server error codes -> message keys. Anything unknown gets the generic line.
function messageKeyFor(
  code: string | undefined,
): 'auth.errorWrong' | 'auth.errorLocked' | 'auth.errorGeneric' {
  switch (code) {
    case 'INVALID_USERNAME_OR_PASSWORD':
      return 'auth.errorWrong'
    case 'ACCOUNT_LOCKED':
      return 'auth.errorLocked'
    default:
      return 'auth.errorGeneric'
  }
}

function LoginPage() {
  const t = useT()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', password: '' },
  })

  async function onSubmit(values: Values) {
    setFormError(null)
    try {
      const { error } = await authClient.signIn.username({
        username: values.phone,
        password: values.password,
      })
      if (error) {
        setFormError(t(messageKeyFor(error.code)))
        return
      }
      await navigate({ to: '/admin' })
    } catch {
      setFormError(t('auth.errorNetwork'))
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-heading text-sm font-semibold">{t('site.name')}</p>
          <LangToggle />
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h1 className="text-2xl font-semibold">{t('auth.signIn')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('auth.signInLead')}
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-6 space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t('auth.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="username"
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                {...register('phone')}
              />
              <FieldError id="phone-error" message={errors.phone?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
                {...register('password')}
              />
              <FieldError
                id="password-error"
                message={errors.password?.message}
              />
            </div>

            {formError && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {formError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('auth.wait') : t('auth.signIn')}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
