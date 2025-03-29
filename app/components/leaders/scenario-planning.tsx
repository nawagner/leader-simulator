'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { toast } from 'sonner';

interface ScenarioPlanningProps {
  leaderName: string;
  entities: any[];
  relationships: any[];
}

export function ScenarioPlanning({ leaderName, entities, relationships }: ScenarioPlanningProps) {
  const [scenarioQuestion, setScenarioQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scenarioResult, setScenarioResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScenarioQuestion(e.target.value);
  };

  const runScenario = async () => {
    if (!scenarioQuestion.trim()) {
      toast.error('Please enter a scenario question');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/leaders/scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leader_name: leaderName,
          question: scenarioQuestion,
          network_data: {
            entities,
            relationships
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze scenario');
      }

      const data = await response.json();
      setScenarioResult(data);
      toast.success('Scenario analysis complete');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-md">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Scenario Planning</h3>
        <p className="text-sm text-blue-700 mb-4">
          Ask a hypothetical question about {leaderName} and their network to explore potential outcomes.
        </p>
        <div className="flex items-start gap-2">
          <Input
            placeholder="e.g., What would happen if Putin lost support of the military?"
            value={scenarioQuestion}
            onChange={handleQuestionChange}
            className="flex-grow"
          />
          <Button 
            onClick={runScenario} 
            disabled={isLoading || !scenarioQuestion.trim()}
          >
            Analyze
          </Button>
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-500">
            Examples: "What if Xi Jinping strengthened ties with Russia?", "How would losing a key ally affect the leader?"
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner />
          <p className="ml-3">Analyzing scenario...</p>
        </div>
      )}

      {error && (
        <div className="p-3 border border-destructive bg-destructive/10 text-destructive rounded-md">
          <p>{error}</p>
        </div>
      )}

      {!isLoading && scenarioResult && (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Scenario Analysis: {scenarioQuestion}</h3>
              <div className="bg-stone-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Summary</h4>
                <p className="text-sm mb-4">{scenarioResult.summary}</p>
                
                <h4 className="font-medium mb-2">Network Impact</h4>
                <p className="text-sm mb-4">{scenarioResult.network_impact}</p>
                
                <h4 className="font-medium mb-2">Political Outcomes</h4>
                <p className="text-sm mb-4">{scenarioResult.political_outcomes}</p>
                
                {scenarioResult.key_entities && scenarioResult.key_entities.length > 0 && (
                  <>
                    <h4 className="font-medium mb-2">Key Entities Affected</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 mb-4">
                      {scenarioResult.key_entities.map((entity: any, index: number) => (
                        <li key={index}>{entity.name}: {entity.impact}</li>
                      ))}
                    </ul>
                  </>
                )}
                
                {scenarioResult.key_relationships && scenarioResult.key_relationships.length > 0 && (
                  <>
                    <h4 className="font-medium mb-2">Key Relationships Affected</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {scenarioResult.key_relationships.map((rel: any, index: number) => (
                        <li key={index}>
                          {rel.source} → {rel.target}: {rel.change}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
