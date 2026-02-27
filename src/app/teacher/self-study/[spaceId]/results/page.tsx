'use client'

import { use } from 'react'
import SpaceResults from '../../components/SpaceResults'

interface SpaceResultsPageProps {
  params: Promise<{
    spaceId: string
  }>
}

export default function SpaceResultsPage({ params }: SpaceResultsPageProps) {
  const { spaceId } = use(params)
  return <SpaceResults spaceId={spaceId} />
}
