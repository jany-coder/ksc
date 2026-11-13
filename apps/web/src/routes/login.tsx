import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { PasswordInput } from '../components/password-input.tsx'
import { Button } from '../components/ui/button.tsx'
import { Input } from '../components/ui/input.tsx'
import { Label } from '../components/ui/label.tsx'
import { authClient } from '../lib/auth-client.ts'
import { getCurrentMemberFn } from '../lib/auth.functions.ts'
import { normalizePhone } from '../lib/phone.ts'

export const Route = createFileRoute('/login')({
  head: () => ({
    meta: [
      { title: 'সাইন ইন — কলমা সোশ্যাল ক্লাব' },
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
    .refine((v) => normalizePhone(v) !== null, 'সঠিক মোবাইল নম্বর লিখুন'),
  password: z.string().min(1, 'পাসওয়ার্ড লিখুন'),
})
type Values = z.infer<typeof schema>

// Server error codes -> Bengali text. Anything unknown gets the generic line.
function messageFor(code: string | undefined): string {
  switch (code) {
    case 'INVALID_USERNAME_OR_PASSWORD':
      return 'নম্বর বা পাসওয়ার্ড ঠিক নয়। পরপর ৫ বার ভুল হলে ১৫ মিনিটের জন্য সাইন ইন বন্ধ থাকবে।'
    case 'ACCOUNT_LOCKED':
      return 'অনেকবার ভুল হয়েছে। ১৫ মিনিট পরে আবার চেষ্টা করুন।'
    default:
      return 'সাইন ইন করা গেল না। একটু পরে আবার চেষ্টা করুন।'
  }
}

function LoginPage() {
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
        setFormError(messageFor(error.code))
        return
      }
      await navigate({ to: '/admin' })
    } catch {
      setFormError('সংযোগে সমস্যা হয়েছে। ইন্টারনেট দেখে আবার চেষ্টা করুন।')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center font-heading text-sm font-semibold">
          কলমা সোশ্যাল ক্লাব
        </p>
        <div className="rounded-xl border border-border bg-card p-6">
          <h1 className="text-2xl font-semibold">সাইন ইন</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ক্লাবের অ্যাডমিন প্যানেলে ঢুকতে মোবাইল নম্বর ও পাসওয়ার্ড দিন।
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-6 space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="phone">মোবাইল নম্বর</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="username"
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                {...register('phone')}
              />
              {errors.phone && (
                <p id="phone-error" className="text-sm text-red-700">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
                {...register('password')}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-red-700">
                  {errors.password.message}
                </p>
              )}
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
              {isSubmitting ? 'অপেক্ষা করুন…' : 'সাইন ইন'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
