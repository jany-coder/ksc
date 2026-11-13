import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/')({
  head: () => ({ meta: [{ title: 'অ্যাডমিন প্যানেল — কলমা সোশ্যাল ক্লাব' }] }),
  component: AdminHome,
})

// Placeholder until the dashboard from the design canvas is built.
function AdminHome() {
  return (
    <main className="px-4 py-6 md:p-6">
      <h1 className="text-2xl font-semibold">ড্যাশবোর্ড</h1>
      <p className="mt-2 text-muted-foreground">[ড্যাশবোর্ড শীঘ্রই আসছে]</p>
    </main>
  )
}
