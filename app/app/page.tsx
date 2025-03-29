import { PageHeader } from '@/components/page-header';
import { LeaderAnalysisClient } from '@/components/leaders/leader-analysis-client';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Leader Network Analyzer" 
        description="Analyze political leaders and their relationship networks using AI and news data."
      />
      
      <main className="container mx-auto px-4 py-8">
        <LeaderAnalysisClient />
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>Leader Network Analyzer - Powered by Next.js, OpenAI, and GDELT</p>
          <p className="mt-2">© {new Date().getFullYear()} All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
