import { notFound } from 'next/navigation'
import { getApp } from '@/lib/apps'
import { OnboardingFlow } from '@/components/app/onboarding-flow'

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!getApp(slug)) return notFound()
  return <OnboardingFlow slug={slug} />
}
