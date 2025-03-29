'use client';

import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for D3-dependent components
const LeaderAnalysis = dynamic(
  () => import('@/components/leaders/leader-analysis').then(mod => ({ default: mod.LeaderAnalysis })),
  { ssr: false }
);

export function LeaderAnalysisClient() {
  return <LeaderAnalysis />;
}
