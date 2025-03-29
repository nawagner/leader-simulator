'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NetworkGraph } from '@/components/leaders/network-graph';
import { NetworkInsights } from '@/components/leaders/network-insights';
import { LoadingSpinner } from '@/components/loading-spinner';

interface Entity {
  name: string;
  type: string;
  role: string;
}

interface Relationship {
  source: string;
  target: string;
  type: string;
  sentiment: string;
  strength: number;
  description: string;
  source_url?: string;
  source_date?: string;
}

interface NetworkData {
  entities: Entity[];
  relationships: Relationship[];
  insights: any;
  collection_timestamp: string;
  data_points_analyzed: number;
}

export function LeaderAnalysis() {
  const [leaderName, setLeaderName] = useState('');
  const [days, setDays] = useState(30);
  const [maxRecords, setMaxRecords] = useState(250);
  const [englishOnly, setEnglishOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [activeTab, setActiveTab] = useState<'graph' | 'insights'>('graph');

  const handleLeaderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLeaderName(e.target.value);
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDays(Number(e.target.value));
  };

  const handleMaxRecordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxRecords(Number(e.target.value));
  };

  const handleEnglishOnlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnglishOnly(e.target.checked);
  };

  const analyzeLeader = async () => {
    if (!leaderName.trim()) {
      setError('Please enter a leader name');
      toast.error('Please enter a leader name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/leaders/${encodeURIComponent(leaderName.trim())}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          days_back: days,
          max_records: maxRecords,
          english_only: englishOnly,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze leader network');
      }

      const data = await response.json();
      setNetworkData(data);
      toast.success(`Network analysis complete for ${leaderName}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Analyze Political Leader Network</CardTitle>
          <CardDescription>
            Enter a world leader's name to analyze their political network and relationships
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="leaderName">Leader Name</Label>
              <Input
                id="leaderName"
                type="text"
                placeholder="e.g., Joe Biden, Vladimir Putin"
                value={leaderName}
                onChange={handleLeaderNameChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="days">Days to Analyze</Label>
              <Input
                id="days"
                type="number"
                min="1"
                max="90"
                value={days}
                onChange={handleDaysChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxRecords">Max Records</Label>
              <Input
                id="maxRecords"
                type="number"
                min="10"
                max="500"
                value={maxRecords}
                onChange={handleMaxRecordsChange}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <input
              type="checkbox"
              id="englishOnly"
              checked={englishOnly}
              onChange={handleEnglishOnlyChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor="englishOnly" className="text-sm font-medium">English only (connect similar entities across languages)</Label>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button 
            onClick={analyzeLeader} 
            disabled={isLoading || !leaderName.trim()}
            size="lg"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Network'}
          </Button>
        </CardFooter>
        
        {error && (
          <div className="mt-4 p-3 border border-destructive bg-destructive/10 text-destructive rounded-md">
            <p>{error}</p>
          </div>
        )}
      </Card>

      {isLoading && (
        <Card className="flex justify-center items-center py-12">
          <LoadingSpinner />
          <p className="ml-3 text-lg">Analyzing leader network data...</p>
        </Card>
      )}

      {!isLoading && networkData && (
        <Card className="mt-8">
          <CardHeader className="pb-0">
            <div className="border-b">
              <nav className="flex">
                <Button
                  variant={activeTab === 'graph' ? 'default' : 'ghost'}
                  className="rounded-none"
                  onClick={() => setActiveTab('graph')}
                >
                  Network Graph
                </Button>
                <Button
                  variant={activeTab === 'insights' ? 'default' : 'ghost'}
                  className="rounded-none"
                  onClick={() => setActiveTab('insights')}
                >
                  Network Insights
                </Button>
              </nav>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
              <h3 className="text-lg font-semibold">
                Network analysis for <span className="text-blue-600">{leaderName}</span>
              </h3>
              <p className="text-sm text-gray-500">
                Based on {networkData.data_points_analyzed} news articles from the past {days} days
              </p>
            {activeTab === 'graph' && (
              <NetworkGraph 
                entities={networkData.entities} 
                relationships={networkData.relationships} 
              />
            )}

            {activeTab === 'insights' && (
              <NetworkInsights 
                insights={networkData.insights}
                entities={networkData.entities}
                collection_timestamp={networkData.collection_timestamp}
                data_points_analyzed={networkData.data_points_analyzed}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
