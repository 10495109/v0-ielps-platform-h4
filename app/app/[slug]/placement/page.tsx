import { notFound } from 'next/navigation'
import { PlacementTest } from '@/components/placement-test'

export default async function PlacementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!['adult', 'junior'].includes(slug)) return notFound()
  return <PlacementTest slug={slug as 'adult' | 'junior'} />
}
