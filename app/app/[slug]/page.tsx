import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getApp, ACCOUNT_APPS } from '@/lib/apps'
import { MiniAppHome } from '@/components/app/mini-app-home'

export function generateStaticParams() {
  return ACCOUNT_APPS.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const app = getApp(slug)
  if (!app) return { title: 'EILPS' }
  return {
    title: `${app.name} · EILPS`,
    description: app.intro,
  }
}

export default async function AppHomePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!getApp(slug)) return notFound()
  return <MiniAppHome slug={slug} />
}
