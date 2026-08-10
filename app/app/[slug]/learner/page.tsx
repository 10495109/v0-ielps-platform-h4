import { notFound } from 'next/navigation'
import { getApp } from '@/lib/apps'
import { PLAYER_VARIANTS } from '@/lib/lesson-player/variants'
import { LessonPlayer } from '@/components/lesson-player/lesson-player'

export default async function LearnerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const app = getApp(slug)
  if (!app || !PLAYER_VARIANTS[slug]) return notFound()
  return <LessonPlayer slug={slug} />
}

export function generateStaticParams() {
  return Object.keys(PLAYER_VARIANTS).map((slug) => ({ slug }))
}
