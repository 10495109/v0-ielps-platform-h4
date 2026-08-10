import { notFound } from 'next/navigation'
import { getApp, getScreen } from '@/lib/apps'
import { ScreenView } from '@/components/app/screen-view'

export default async function ScreenPage({
  params,
}: {
  params: Promise<{ slug: string; screen: string }>
}) {
  const { slug, screen } = await params
  const app = getApp(slug)
  if (!app) return notFound()
  if (!getScreen(app, screen)) return notFound()
  return <ScreenView slug={slug} screenSlug={screen} />
}
