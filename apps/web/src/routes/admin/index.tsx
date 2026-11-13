import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { Button } from '../../components/ui/button.tsx'
import { authClient } from '../../lib/auth-client.ts'

export const Route = createFileRoute('/admin/')({
  head: () => ({ meta: [{ title: 'অ্যাডমিন প্যানেল — কলমা সোশ্যাল ক্লাব' }] }),
  component: AdminHome,
})

// Placeholder until the dashboard from the design canvas is built.
function AdminHome() {
  const navigate = useNavigate()

  async function signOut() {
    await authClient.signOut()
    await navigate({ to: '/login' })
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">অ্যাডমিন প্যানেল</h1>
      <p className="mt-2 text-muted-foreground">[ড্যাশবোর্ড শীঘ্রই আসছে]</p>
      <Button variant="outline" className="mt-6" onClick={signOut}>
        সাইন আউট
      </Button>
    </main>
  )
}
