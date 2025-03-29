'use client';

interface InsightSectionProps {
  title: string;
  items: string[] | { name: string; role: string }[];
}

interface NetworkInsightsProps {
  insights: {
    key_players?: { name: string; role: string }[];
    major_relationship_patterns?: string[];
    vulnerabilities?: string[];
    evolution_suggestions?: string[];
    [key: string]: any;
  };
  entities?: { name: string; type: string; role: string }[];
  collection_timestamp?: string;
  data_points_analyzed?: number;
}

function InsightSection({ title, items }: InsightSectionProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            {typeof item === 'string' ? (
              <span>{item}</span>
            ) : (
              <span>
                <strong>{item.name}</strong>: {item.role}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NetworkInsights({ insights }: NetworkInsightsProps) {
  if (!insights) {
    return <div className="text-gray-500">No insights available</div>;
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 mb-4">
        Based on network analysis, here are the key insights about this political network:
      </p>
      
      <InsightSection
        title="Key Players and Their Roles"
        items={insights.key_players || []}
      />
      
      <InsightSection
        title="Major Relationship Patterns"
        items={insights.relationship_patterns || insights.major_relationship_patterns || []}
      />
      
      <InsightSection
        title="Potential Vulnerabilities"
        items={insights.vulnerabilities || []}
      />
      
      <InsightSection
        title="Network Evolution Suggestions"
        items={insights.evolution_suggestions || []}
      />
    </div>
  );
}
