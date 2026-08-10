import { notFound } from 'next/navigation'
import { getApp, getScreen, ACCOUNT_APPS } from '@/lib/apps'
import { ScreenView } from '@/components/app/screen-view'

export function generateStaticParams() {
  return ACCOUNT_APPS.flatMap((app) =>
    app.screens.map((screen) => ({ slug: app.slug, screen: screen.slug })),
  )
}

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
