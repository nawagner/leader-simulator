import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { leader_name, question, network_data } = body;

    if (!leader_name || !question || !network_data) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const { entities, relationships } = network_data;

    if (!entities || !relationships) {
      return NextResponse.json({ error: 'Network data is incomplete' }, { status: 400 });
    }

    console.log(`[scenario] Analyzing scenario for ${leader_name}: "${question}"`);
    console.log(`[scenario] Network data has ${entities.length} entities and ${relationships.length} relationships`);

    // Create a simplified version of network data to help the model
    const entitySummary = entities.map((e: any) => `${e.name} (${e.type || 'unknown'}) - ${e.role || 'unknown'}`).slice(0, 20);
    
    // Get the top relationships by strength
    const topRelationships = [...relationships]
      .sort((a, b) => (b.strength || 0) - (a.strength || 0))
      .slice(0, 20)
      .map(r => `${r.source} → ${r.target}: ${r.type} (strength: ${r.strength || 'unknown'}, sentiment: ${r.sentiment || 'neutral'})`);

    // Construct the prompt for scenario analysis
    const prompt = `You are a political network analyzer specializing in scenario planning. Analyze the following hypothetical scenario based on the provided network data for ${leader_name}.

CURRENT NETWORK SUMMARY:
Top Entities:
${entitySummary.join('\n')}

Top Relationships:
${topRelationships.join('\n')}

SCENARIO QUESTION:
${question}

Provide a comprehensive analysis in the following format:
1. Summary: A brief overview of the scenario's potential impact
2. Network Impact: How the leader's network structure would change
3. Political Outcomes: Likely geopolitical or domestic political consequences
4. Key Entities Affected: List of entities most affected with description of impact
5. Key Relationships Affected: List of relationships that would change with description
`;

    // Call OpenAI for scenario analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a political network analysis system specializing in scenario planning." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    // Extract content from the API response
    const responseContent = response.choices[0]?.message?.content || '';
    
    // Parse the response content
    const sections = parseScenarioResponse(responseContent);
    
    return NextResponse.json({
      leader_name,
      question,
      summary: sections.summary || "No summary available",
      network_impact: sections.network_impact || "No network impact analysis available",
      political_outcomes: sections.political_outcomes || "No political outcomes analysis available",
      key_entities: parseKeyEntities(sections.key_entities || ""),
      key_relationships: parseKeyRelationships(sections.key_relationships || ""),
      full_analysis: responseContent,
    });
    
  } catch (error: any) {
    console.error('[scenario] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze scenario' },
      { status: 500 }
    );
  }
}

// Helper function to parse the response into sections
function parseScenarioResponse(content: string): Record<string, string> {
  const sections: Record<string, string> = {};
  
  // Extract Summary
  const summaryMatch = content.match(/Summary:([\s\S]+?)(?=Network Impact:|$)/);
  sections.summary = summaryMatch ? summaryMatch[1].trim() : "";
  
  // Extract Network Impact
  const networkMatch = content.match(/Network Impact:([\s\S]+?)(?=Political Outcomes:|$)/);
  sections.network_impact = networkMatch ? networkMatch[1].trim() : "";
  
  // Extract Political Outcomes
  const outcomesMatch = content.match(/Political Outcomes:([\s\S]+?)(?=Key Entities Affected:|$)/);
  sections.political_outcomes = outcomesMatch ? outcomesMatch[1].trim() : "";
  
  // Extract Key Entities
  const entitiesMatch = content.match(/Key Entities Affected:([\s\S]+?)(?=Key Relationships Affected:|$)/);
  sections.key_entities = entitiesMatch ? entitiesMatch[1].trim() : "";
  
  // Extract Key Relationships
  const relationshipsMatch = content.match(/Key Relationships Affected:([\s\S]+)/);
  sections.key_relationships = relationshipsMatch ? relationshipsMatch[1].trim() : "";
  
  return sections;
}

interface Entity {
  name: string;
  impact: string;
}

// Parse key entities into structured format
function parseKeyEntities(entityText: string): Entity[] {
  const entities = [];
  const lines = entityText.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    // Try to extract entity name and impact description
    const match = line.match(/[•\-*]?\s*([^:]+):(.+)/);
    if (match) {
      entities.push({
        name: match[1].trim(),
        impact: match[2].trim()
      });
    }
  }
  
  return entities;
}

interface Relationship {
  source: string;
  target: string;
  change: string;
}

// Parse key relationships into structured format
function parseKeyRelationships(relationshipText: string): Relationship[] {
  const relationships = [];
  const lines = relationshipText.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    // Try different patterns to extract relationship info
    const arrowMatch = line.match(/[•\-*]?\s*([^→]+)→\s*([^:]+):(.+)/);
    const dashMatch = line.match(/[•\-*]?\s*([^-]+)-\s*([^:]+):(.+)/);
    const andMatch = line.match(/[•\-*]?\s*([^and]+)and\s*([^:]+):(.+)/);
    
    if (arrowMatch) {
      relationships.push({
        source: arrowMatch[1].trim(),
        target: arrowMatch[2].trim(),
        change: arrowMatch[3].trim()
      });
    } else if (dashMatch) {
      relationships.push({
        source: dashMatch[1].trim(),
        target: dashMatch[2].trim(),
        change: dashMatch[3].trim()
      });
    } else if (andMatch) {
      relationships.push({
        source: andMatch[1].trim(),
        target: andMatch[2].trim(),
        change: andMatch[3].trim()
      });
    }
  }
  
  return relationships;
}
