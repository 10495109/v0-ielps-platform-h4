import { notFound } from 'next/navigation'
import { getApp, ACCOUNT_APPS } from '@/lib/apps'
import { OnboardingFlow } from '@/components/app/onboarding-flow'

export function generateStaticParams() {
  return ACCOUNT_APPS.map((app) => ({ slug: app.slug }))
}

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!getApp(slug)) return notFound()
  return <OnboardingFlow slug={slug} />
}
