import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { PasswordInput } from '../components/password-input.tsx'
import { Button } from '../components/ui/button.tsx'
import { Label } from '../components/ui/label.tsx'
import { authClient } from '../lib/auth-client.ts'
import { getCurrentMemberFn } from '../lib/auth.functions.ts'
import { changePasswordSchema } from '../lib/password-rules.ts'
import { changePasswordFn } from '../lib/password.functions.ts'

export const Route = createFileRoute('/change-password')({
  head: () => ({
    meta: [
      { title: 'পাসওয়ার্ড পরিবর্তন — কলমা সোশ্যাল ক্লাব' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  beforeLoad: async () => {
    const member = await getCurrentMemberFn()
    if (!member) throw redirect({ to: '/login' })
    return { member }
  },
  component: ChangePasswordPage,
})

// The shared server rules plus a "type it twice" check that only the form needs.
const formSchema = changePasswordSchema
  .and(z.object({ confirm: z.string().min(1, 'নতুন পাসওয়ার্ড আবার লিখুন') }))
  .refine((v) => v.newPassword === v.confirm, {
    message: 'দুটি পাসওয়ার্ড মিলছে না',
    path: ['confirm'],
  })
type Values = z.infer<typeof formSchema>

const serverMessages: Record<string, string> = {
  WRONG_PASSWORD:
    'বর্তমান পাসওয়ার্ড ঠিক নয়। পরপর ৫ বার ভুল হলে ১৫ মিনিটের জন্য বন্ধ থাকবে।',
  ACCOUNT_LOCKED: 'অনেকবার ভুল হয়েছে। ১৫ মিনিট পরে আবার চেষ্টা করুন।',
  UNAUTHENTICATED: 'সেশন শেষ হয়ে গেছে। আবার সাইন ইন করুন।',
}

function ChangePasswordPage() {
  const { member } = Route.useRouteContext()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(formSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  })

  async function onSubmit(values: Values) {
    setFormError(null)
    try {
      const result = await changePasswordFn({
        data: {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
      })
      if (!result.ok) {
        setFormError(
          serverMessages[result.code] ??
            'পাসওয়ার্ড বদলানো গেল না। একটু পরে আবার চেষ্টা করুন।',
        )
        return
      }
      await navigate({ to: '/admin' })
    } catch {
      setFormError('সংযোগে সমস্যা হয়েছে। ইন্টারনেট দেখে আবার চেষ্টা করুন।')
    }
  }

  async function signOut() {
    await authClient.signOut()
    await navigate({ to: '/login' })
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center font-heading text-sm font-semibold">
          কলমা সোশ্যাল ক্লাব
        </p>
        <div className="rounded-xl border border-border bg-card p-6">
          <h1 className="text-2xl font-semibold">নতুন পাসওয়ার্ড দিন</h1>

          {member.mustChangePassword ? (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              আপনার পাসওয়ার্ড অস্থায়ী। নতুন পাসওয়ার্ড না দেওয়া পর্যন্ত অন্য কোনো পাতায়
              যাওয়া যাবে না।
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              আপনার পাসওয়ার্ড বদলান। অন্য সব ডিভাইস থেকে সাইন আউট হয়ে যাবে।
            </p>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-6 space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">
                {member.mustChangePassword
                  ? 'অস্থায়ী পাসওয়ার্ড'
                  : 'বর্তমান পাসওয়ার্ড'}
              </Label>
              <PasswordInput
                id="currentPassword"
                autoComplete="current-password"
                aria-invalid={errors.currentPassword ? true : undefined}
                aria-describedby={
                  errors.currentPassword ? 'currentPassword-error' : undefined
                }
                {...register('currentPassword')}
              />
              {errors.currentPassword && (
                <p id="currentPassword-error" className="text-sm text-red-700">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword">নতুন পাসওয়ার্ড</Label>
              <PasswordInput
                id="newPassword"
                autoComplete="new-password"
                aria-invalid={errors.newPassword ? true : undefined}
                aria-describedby="newPassword-hint newPassword-error"
                {...register('newPassword')}
              />
              <p
                id="newPassword-hint"
                className="text-sm text-muted-foreground"
              >
                কমপক্ষে ৮টি অক্ষর।
              </p>
              {errors.newPassword && (
                <p id="newPassword-error" className="text-sm text-red-700">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">নতুন পাসওয়ার্ড আবার লিখুন</Label>
              <PasswordInput
                id="confirm"
                autoComplete="new-password"
                aria-invalid={errors.confirm ? true : undefined}
                aria-describedby={errors.confirm ? 'confirm-error' : undefined}
                {...register('confirm')}
              />
              {errors.confirm && (
                <p id="confirm-error" className="text-sm text-red-700">
                  {errors.confirm.message}
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
              {isSubmitting ? 'অপেক্ষা করুন…' : 'পাসওয়ার্ড বদলান'}
            </Button>
          </form>
        </div>

        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm" onClick={signOut}>
            সাইন আউট
          </Button>
        </div>
      </div>
    </main>
  )
}
