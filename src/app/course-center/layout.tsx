import PageLayout from '@/components/PageLayout'

export default function CourseCenterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PageLayout user={{ name: 'Mo老师', role: 'AI · 高级教师' }}>
      {children}
    </PageLayout>
  )
}
