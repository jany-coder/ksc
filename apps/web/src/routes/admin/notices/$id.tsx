import { useQueryClient } from '@tanstack/react-query'
import {
  Link,
  createFileRoute,
  notFound,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useState } from 'react'

import { NoticeForm } from '../../../components/admin/notice-form.tsx'
import { Button } from '../../../components/ui/button.tsx'
import {
  deleteNoticeFn,
  getNoticeFn,
  updateNoticeFn,
} from '../../../lib/notices.functions.ts'
import { can } from '../../../lib/permissions.ts'

export const Route = createFileRoute('/admin/notices/$id')({
  head: () => ({ meta: [{ title: 'নোটিশ সম্পাদনা — কলমা সোশ্যাল ক্লাব' }] }),
  beforeLoad: ({ context }) => {
    // The server functions check again; this just keeps people off the page.
    if (!can(context.member.role, 'content.write'))
      throw redirect({ to: '/admin' })
  },
  loader: async ({ params }) => {
    const notice = await getNoticeFn({ data: { id: params.id } })
    if (!notice) throw notFound()
    return notice
  },
  notFoundComponent: () => (
    <main className="px-4 py-6 md:p-6">
      <p className="mb-3">এই নোটিশটি পাওয়া যায়নি (হয়তো মুছে ফেলা হয়েছে)।</p>
      <Link to="/admin/notices" className="text-primary hover:underline">
        নোটিশের তালিকায় ফিরুন
      </Link>
    </main>
  ),
  component: EditNoticePage,
})

function EditNoticePage() {
  const notice = Route.useLoaderData()
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function remove() {
    setDeleting(true)
    setDeleteError(null)
    try {
      // "Not found" means it is already gone, which is the outcome we wanted.
      await deleteNoticeFn({ data: { id } })
      await queryClient.invalidateQueries({ queryKey: ['notices'] })
      await navigate({ to: '/admin/notices' })
    } catch {
      setDeleteError('মোছা গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।')
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <main className="px-4 py-6 md:p-6">
      <nav aria-label="পথ" className="mb-3 text-sm text-muted-foreground">
        <Link to="/admin/notices" className="hover:text-foreground">
          নোটিশ
        </Link>
        <span className="mx-1.5 text-zinc-300" aria-hidden="true">
          /
        </span>
        <span className="text-foreground">সম্পাদনা</span>
      </nav>
      <h1 className="text-2xl font-semibold">নোটিশ সম্পাদনা</h1>

      <NoticeForm
        initial={notice}
        submitLabel="সংরক্ষণ করুন"
        onSubmit={async (values) => {
          const result = await updateNoticeFn({ data: { id, values } })
          if (!result.ok)
            return {
              ok: false,
              message:
                result.code === 'NOT_FOUND'
                  ? 'নোটিশটি আর নেই।'
                  : 'তথ্য ঠিক নেই। ফর্মটি আবার দেখে নিন।',
            }
          await queryClient.invalidateQueries({ queryKey: ['notices'] })
          await navigate({ to: '/admin/notices' })
          return { ok: true }
        }}
        extra={
          <section className="rounded-[10px] border border-red-200 bg-card p-5">
            <h2 className="mb-2 text-[15px] font-semibold">নোটিশ মুছুন</h2>
            {deleteError && (
              <p role="alert" className="mb-2 text-sm text-red-700">
                {deleteError}
              </p>
            )}
            {confirming ? (
              <>
                <p className="mb-2.5 text-sm text-red-800">
                  নোটিশটি স্থায়ীভাবে মুছে যাবে। নিশ্চিত?
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={deleting}
                    onClick={() => void remove()}
                  >
                    হ্যাঁ, মুছে ফেলুন
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={deleting}
                    onClick={() => setConfirming(false)}
                  >
                    না
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-2.5 text-[13px] text-muted-foreground">
                  আর দরকার না হলে মুছে ফেলুন। শুধু লুকাতে চাইলে অবস্থা "খসড়া" করে
                  সংরক্ষণ করুন।
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setConfirming(true)}
                >
                  মুছে ফেলুন
                </Button>
              </>
            )}
          </section>
        }
      />
    </main>
  )
}
