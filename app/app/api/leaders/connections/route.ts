import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';
import { normalizeNetworkData } from '@/lib/utils';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * API endpoint to fetch and analyze top connections for a political leader
 * Uses web search to build a network with configurable number of connections
 */
export async function POST(request: NextRequest) {
  try {
    const { leader_name, num_connections = 12, english_only = false } = await request.json();
    
    if (!leader_name) {
      return NextResponse.json(
        { error: 'Leader name is required' },
        { status: 400 }
      );
    }
    
    console.log(`[getLeaderConnections] Starting search for ${leader_name}, top ${num_connections} connections`);
    
    // Step 1: Use search API to find information about this leader's top connections
    const searchResults = await searchLeaderConnections(leader_name);
    
    if (!searchResults || searchResults.length === 0) {
      return NextResponse.json(
        { error: `No connection data found for leader: ${leader_name}` },
        { status: 404 }
      );
    }
    
    // Step 2: Extract relationships from the search results
    const networkData = await extractConnectionsFromSearch(searchResults, leader_name, num_connections);
    
    console.log(`[getLeaderConnections] Raw network data:`, JSON.stringify(networkData, null, 2));
    
    // Step 3: Normalize the network data (translate entities, etc.)
    // Force English-only to true to ensure all entities are in English and connected
    const normalizedData = normalizeNetworkData(
      networkData.entities,
      networkData.relationships,
      true // Always force English-only mode
    );
    
    console.log(`[getLeaderConnections] Normalized data:`, JSON.stringify(normalizedData, null, 2));
    
    // Ensure we have connections
    if (!normalizedData.relationships.length) {
      return NextResponse.json(
        { error: `No valid connections found for leader: ${leader_name}` },
        { status: 404 }
      );
    }
    
    // Step 4: Generate insights about the network
    const insights = await generateConnectionInsights(normalizedData, leader_name);
    
    // Create a valid response object with all required fields
    const response = {
      entities: normalizedData.entities || [],
      relationships: normalizedData.relationships || [],
      insights: insights || { insights: [] },
      collection_timestamp: new Date().toISOString(),
      top_connections: num_connections,
      search_sources: networkData.sources || [],
      data_points_analyzed: searchResults.length
    };
    
    console.log(`[getLeaderConnections] Returning network with ${response.entities.length} entities and ${response.relationships.length} relationships`);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("Error processing leader connections:", error);
    return NextResponse.json(
      { error: `Error processing connections: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

/**
 * Search the web for information about a leader's connections
 */
async function searchLeaderConnections(leaderName: string): Promise<string[]> {
  console.log(`[searchLeaderConnections] Searching for connections of ${leaderName}`);

  try {
    // Define search queries to find different types of connections
    const searchQueries = [
      `${leaderName} top political allies`,
      `${leaderName} closest advisors cabinet members`,
      `${leaderName} key political relationships`,
      `${leaderName} family members political connections`,
      `${leaderName} political rivals opponents`
    ];
    
    // Store search results
    const allResults: string[] = [];
    
    // Execute each search query
    for (const query of searchQueries) {
      const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
      console.log(`[searchLeaderConnections] Executing search for: ${query}`);
      
      // We'll simulate search here since actual API calls would need real integrations
      // In a real implementation, this would use a proper web search API
      
      // For now, we'll use OpenAI to simulate search results based on the query
      const response = await openai.chat.completions.create({
        model: "o3-mini-2025-01-31",
        messages: [
          { 
            role: "system", 
            content: `You are a political analysis assistant that provides accurate information about political figures and their relationships.
            
            Generate factual search results for the query: "${query}"
            
            For each result, include:
            1. A brief excerpt of factual information about the relationship
            2. Make sure to highlight specific people, organizations, or entities connected to the leader
            3. Focus on relevant political connections, allies, adversaries, and important relationships
            
            Provide 3-5 search result excerpts, formatted as plain text.`
          },
          { role: "user", content: query }
        ],
        // temperature: 0.7
      });
      
      const content = response.choices[0].message.content;
      if (content) {
        allResults.push(content);
      }
    }
    
    return allResults;
    
  } catch (error) {
    console.error("Error searching for leader connections:", error);
    throw error;
  }
}

/**
 * Extract connections from search results - using a layered approach to ensure proper connectivity
 */
async function extractConnectionsFromSearch(
  searchResults: string[],
  leaderName: string,
  numConnections: number
): Promise<{ entities: any[], relationships: any[], sources?: string[] }> {
  console.log(`[extractConnectionsFromSearch] Extracting top ${numConnections} connections from search results`);
  
  try {
    // Combine all search results into a single text
    const combinedResults = searchResults.join('\n\n');
    
    // Use OpenAI to extract entities and relationships
    const response = await openai.chat.completions.create({
      model: "o3-mini-2025-01-31",
      messages: [
        { 
          role: "system", 
          content: `You are a political network analyzer that extracts relationships from text.
          Extract the top ${numConnections} most important connections for ${leaderName} from the provided search results.
          
          For each connection:
          1. Identify the connected entity (person, organization, country, etc.)
          2. Determine relationship type (ally, rival, family, advisor, etc.)
          3. Assess sentiment (positive, neutral, negative)
          4. Rate relationship strength (1-5 scale)
          5. Provide a brief description of the relationship
          
          Format your response as valid JSON with the following structure:
          {
            "entities": [
              {"name": "Entity Name", "type": "person|organization|country|etc", "role": "Role description"},
              // Add all entities including ${leaderName} and connections
            ],
            "relationships": [
              {
                "source": "Source Entity Name", 
                "target": "Target Entity Name",
                "type": "ally|rival|family|advisor|etc",
                "sentiment": "positive|neutral|negative",
                "strength": 1-5,
                "description": "Brief description of relationship"
              },
              // Each relationship should connect two entities
            ],
            "sources": ["Brief attribution to sources"]
          }`
        },
        { role: "user", content: combinedResults }
      ],
      // temperature: 0.3,
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to extract connections from search results");
    }
    
    const extractedData = JSON.parse(content);
    
    // Make sure the leader is included in the entities with standardized name
    const normalizedLeaderName = leaderName.toLowerCase().trim();
    if (!extractedData.entities.some((e: any) => e.name.toLowerCase() === normalizedLeaderName)) {
      extractedData.entities.push({
        name: leaderName,
        type: "politician",
        role: "Main subject of network analysis"
      });
    }
    
    // LAYER 1: Ensure the primary connections are established first
    // This ensures the leader has direct connections to the top N entities
    const primaryEntities = new Set<string>();
    const primaryRelationships = [];
    
    // Add the leader to the primary set
    primaryEntities.add(normalizedLeaderName);
    
    // Sort relationships by strength to prioritize strongest connections
    const sortedRelationships = [...extractedData.relationships].sort((a, b) => 
      (b.strength || 0) - (a.strength || 0)
    );
    
    // Add top connections to primary layer
    let primaryConnections = 0;
    for (const rel of sortedRelationships) {
      // Check if this relationship connects to our leader
      const isLeaderSource = rel.source.toLowerCase() === normalizedLeaderName;
      const isLeaderTarget = rel.target.toLowerCase() === normalizedLeaderName;
      
      if (isLeaderSource || isLeaderTarget) {
        // This is a direct connection to the leader
        const otherEntity = isLeaderSource ? rel.target : rel.source;
        
        if (!primaryEntities.has(otherEntity.toLowerCase())) {
          primaryEntities.add(otherEntity.toLowerCase());
          primaryRelationships.push(rel);
          primaryConnections++;
          
          // Stop when we've reached the requested number of connections
          if (primaryConnections >= numConnections) {
            break;
          }
        }
      }
    }
    
    console.log(`[extractConnectionsFromSearch] Primary layer has ${primaryConnections} direct connections to ${leaderName}`);
    
    // LAYER 2: Add secondary connections (connections between the entities themselves)
    const secondaryRelationships = [];
    
    for (const rel of extractedData.relationships) {
      // Skip relationships already in the primary layer
      if (primaryRelationships.includes(rel)) continue;
      
      const sourceInPrimary = primaryEntities.has(rel.source.toLowerCase());
      const targetInPrimary = primaryEntities.has(rel.target.toLowerCase());
      
      // Add relationships that connect primary entities to each other
      if (sourceInPrimary && targetInPrimary) {
        secondaryRelationships.push(rel);
      }
    }
    
    console.log(`[extractConnectionsFromSearch] Secondary layer has ${secondaryRelationships.length} connections between primary entities`);
    
    // LAYER 3: Add tertiary connections (one endpoint is a primary entity)
    const tertiaryRelationships = [];
    const tertiaryEntities = new Set<string>(primaryEntities);
    
    for (const rel of extractedData.relationships) {
      // Skip relationships already in primary or secondary layers
      if (primaryRelationships.includes(rel) || secondaryRelationships.includes(rel)) continue;
      
      const sourceInPrimary = primaryEntities.has(rel.source.toLowerCase());
      const targetInPrimary = primaryEntities.has(rel.target.toLowerCase());
      
      // Add relationships that connect at least one primary entity to something else
      if (sourceInPrimary || targetInPrimary) {
        tertiaryRelationships.push(rel);
        tertiaryEntities.add(rel.source.toLowerCase());
        tertiaryEntities.add(rel.target.toLowerCase());
      }
    }
    
    console.log(`[extractConnectionsFromSearch] Tertiary layer has ${tertiaryRelationships.length} additional connections`);
    
    // Combine all layers for the final result
    const combinedRelationships = [...primaryRelationships, ...secondaryRelationships, ...tertiaryRelationships];
    
    // Ensure all entities referenced in relationships are included in the entities list
    const knownEntities = new Set(extractedData.entities.map((e: any) => e.name.toLowerCase()));
    const newEntities = [];
    
    for (const rel of combinedRelationships) {
      const sourceEntity = rel.source.toLowerCase();
      const targetEntity = rel.target.toLowerCase();
      
      if (!knownEntities.has(sourceEntity)) {
        knownEntities.add(sourceEntity);
        newEntities.push({
          name: rel.source,
          type: 'person', // Default type
          role: 'Connection' // Default role
        });
      }
      
      if (!knownEntities.has(targetEntity)) {
        knownEntities.add(targetEntity);
        newEntities.push({
          name: rel.target,
          type: 'person', // Default type
          role: 'Connection' // Default role
        });
      }
    }
    
    console.log(`[extractConnectionsFromSearch] Added ${newEntities.length} additional entities to ensure all connections have entities`);
    
    // Updated data with layered connections and complete entity list
    extractedData.entities = [...extractedData.entities, ...newEntities];
    extractedData.relationships = combinedRelationships;
    
    // Track layer information in metadata for debugging
    extractedData.meta = {
      primary_connections: primaryConnections,
      secondary_connections: secondaryRelationships.length,
      tertiary_connections: tertiaryRelationships.length,
      total_entities: extractedData.entities.length,
      total_relationships: combinedRelationships.length
    };
    
    return extractedData;
    
  } catch (error) {
    console.error("Error extracting connections from search:", error);
    throw error;
  }
}

/**
 * Generate insights about the network
 */
async function generateConnectionInsights(
  networkData: { entities: any[], relationships: any[] },
  leaderName: string
): Promise<any> {
  console.log('[generateConnectionInsights] Generating insights for leader connections');
  
  try {
    const response = await openai.chat.completions.create({
      model: "o3-mini-2025-01-31",
      messages: [
        { 
          role: "system", 
          content: `You are a political network analyst that provides insights about political figures and their relationships.`
        },
        { 
          role: "user", 
          content: `Analyze this political network for ${leaderName} and generate 3-5 key insights about the leader's connections.
          
          Entities: ${JSON.stringify(networkData.entities)}
          Relationships: ${JSON.stringify(networkData.relationships)}
          
          For each insight:
          1. Provide a concise title
          2. Give a brief explanation with supporting evidence from the network
          3. Focus on patterns, influential connections, and potential implications
          
          Format your response as valid JSON with the following structure:
          {
            "insights": [
              {
                "title": "Insight title",
                "description": "Detailed description with supporting evidence"
              }
            ]
          }`
        }
      ],
      // temperature: 0.3,
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to generate network insights");
    }
    
    return JSON.parse(content);
    
  } catch (error) {
    console.error("Error generating insights:", error);
    throw error;
  }
}
