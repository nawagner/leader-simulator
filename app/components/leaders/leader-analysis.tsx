'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NetworkGraph } from '@/components/leaders/network-graph';
import { NetworkInsights } from '@/components/leaders/network-insights';
import { ScenarioPlanning } from '@/components/leaders/scenario-planning';
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
  const [leaderName, setLeaderName] = useState('Vladimir Putin');
  const [days, setDays] = useState(30);
  const [maxRecords, setMaxRecords] = useState(10);
  const [numConnections, setNumConnections] = useState(25); // Default to 12 top connections
  const [englishOnly, setEnglishOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [activeTab, setActiveTab] = useState<'graph' | 'insights' | 'scenario'>('graph');
  const [analysisMode, setAnalysisMode] = useState<'news' | 'web'>('web'); // Default to news analysis
  const [scenarioResult, setScenarioResult] = useState<any>(null);
  const [scenarioLoading, setScenarioLoading] = useState(false)
  
  // Debug logging to track data flow
  useEffect(() => {
    if (networkData) {
      console.log('[LeaderAnalysis] Network data loaded:', {
        entities: networkData.entities?.length || 0,
        relationships: networkData.relationships?.length || 0,
        mode: analysisMode
      });
    }
  }, [networkData, analysisMode]);

  const handleLeaderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLeaderName(e.target.value);
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDays(Number(e.target.value));
  };

  const handleMaxRecordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxRecords(Number(e.target.value));
  };

  const handleNumConnectionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumConnections(Number(e.target.value));
  };

  const handleEnglishOnlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnglishOnly(e.target.checked);
  };
  
  const handleAnalysisModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAnalysisMode(e.target.value as 'news' | 'web');
    console.log(`[LeaderAnalysis] Analysis mode changed to: ${e.target.value}`);
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
      let response;
      
      if (analysisMode === 'news') {
        // News-based analysis (existing functionality)
        response = await fetch(`/api/leaders/${encodeURIComponent(leaderName.trim())}`, {
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
      } else {
        // Web search-based analysis for top connections
        response = await fetch('/api/leaders/connections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            leader_name: leaderName.trim(),
            num_connections: numConnections,
            english_only: englishOnly,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze leader network');
      }

      const data = await response.json();
      setNetworkData(data);
      toast.success(
        analysisMode === 'news'
          ? `News-based network analysis complete for ${leaderName}` 
          : `Top ${numConnections} connections analyzed for ${leaderName}`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Analyze Political Leader Network</CardTitle>
          <CardDescription>
            Explore political networks using news analysis or web search connections
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
              <Label htmlFor="analysisMode">Analysis Mode</Label>
              <select
                id="analysisMode"
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                value={analysisMode}
                onChange={handleAnalysisModeChange}
              >
                <option value="news">News-based Analysis</option>
                <option value="web">Web Search Connections</option>
              </select>
            </div>
            
            {analysisMode === 'news' ? (
              <>
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
              </>
            ) : (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="numConnections">Number of Top Connections</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="numConnections"
                    type="number"
                    min="5"
                    max="30"
                    value={numConnections}
                    onChange={handleNumConnectionsChange}
                  />
                  {/* <span className="text-sm text-gray-500">(5-30)</span> */}
                </div>
              </div>
            )}
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
                {/* <Button
                  variant={activeTab === 'insights' ? 'default' : 'ghost'}
                  className="rounded-none"
                  onClick={() => setActiveTab('insights')}
                >
                  Network Insights
                </Button> */}
                <Button
                  variant={activeTab === 'scenario' ? 'default' : 'ghost'}
                  className="rounded-none"
                  onClick={() => setActiveTab('scenario')}
                >
                  Scenario Planning
                </Button>
              </nav>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
              <h3 className="text-lg font-semibold">
                Network analysis for <span className="text-blue-600">{leaderName}</span>
              </h3>
              <p className="text-sm text-gray-500">
                {analysisMode === 'news' ? 
                  `Based on ${networkData.data_points_analyzed || 0} news articles from the past ${days} days` : 
                  `Based on web search for top ${numConnections} connections`
                }
              </p>
              
              {networkData.entities && networkData.relationships && (
                <div className="text-sm text-blue-600 mt-1">
                  Network contains {networkData.entities.length} entities and {networkData.relationships.length} connections
                </div>
              )}
            {activeTab === 'graph' && (
              <div className="mt-4 border rounded-md p-4">
                <NetworkGraph 
                  entities={networkData.entities || []} 
                  relationships={networkData.relationships || []} 
                />
              </div>
            )}

            {activeTab === 'insights' && (
              <NetworkInsights 
                insights={networkData.insights}
                entities={networkData.entities}
                collection_timestamp={networkData.collection_timestamp}
                data_points_analyzed={networkData.data_points_analyzed}
              />
            )}
            
            {activeTab === 'scenario' && (
              <ScenarioPlanning
                leaderName={leaderName}
                entities={networkData.entities || []}
                relationships={networkData.relationships || []}
                scenarioResult={scenarioResult}
                setScenarioResult={setScenarioResult}
                isLoading={scenarioLoading}
                setIsLoading={setScenarioLoading}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
