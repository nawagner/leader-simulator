import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const GDELT_BASE_URL = "https://api.gdeltproject.org/api/v2/doc/doc";

export async function POST(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const { days_back = 30, max_records = 250, english_only = false } = await request.json();
    const leaderName = (await params).name;
    
    // Fetch news data from GDELT
    const networkData = await getLeaderNetworkData(leaderName, days_back, max_records);
    
    if (!networkData || networkData.length === 0) {
      return NextResponse.json(
        { error: `No data found for leader: ${leaderName}` },
        { status: 404 }
      );
    }
    
    // Analyze the network data with optional language filtering
    const networkAnalysis = await analyzeNetworkData(networkData, english_only);
    
    // Generate insights
    const insights = await generateNetworkInsights(networkAnalysis);
    
    return NextResponse.json({
      entities: networkAnalysis.entities,
      relationships: networkAnalysis.relationships,
      insights: insights,
      collection_timestamp: new Date().toISOString(),
      data_points_analyzed: networkData.length
    });
    
  } catch (error) {
    console.error("Error processing leader data:", error);
    return NextResponse.json(
      { error: `Error processing data: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

async function fetchLeaderNews(
  leaderName: string,
  timespan: string = "1440",
  maxRecords: number = 100
) {
  console.log(`[fetchLeaderNews] Starting fetch for ${leaderName}, timespan: ${timespan}, maxRecords: ${maxRecords}`);
  try {
    console.log(`[fetchLeaderNews] Making API request to GDELT: ${GDELT_BASE_URL}`);
    const response = await axios.get(GDELT_BASE_URL, {
      params: {
        query: `"${leaderName}"`,
        mode: "artlist",
        format: "json",
        timespan: timespan,
        maxrecords: maxRecords,
      }
    });
    
    const articles = response.data.articles || [];
    console.log(`[fetchLeaderNews] GDELT returned ${articles.length} articles`);
    
    // Transform the response into a structured format
    return articles.map((article: any) => ({
      title: article.title,
      url: article.url,
      source: article.seenin?.source?.name,
      published: article.seenin?.sourcepublishedatetime,
      tone: article.tone || 0,
      locations: article.locations || [],
      persons: article.persons || [],
      organizations: article.organizations || []
    }));
    
  } catch (error) {
    console.error("Error fetching data from GDELT:", error);
    console.log(`[fetchLeaderNews] Failed to fetch data with error: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
  console.log('[fetchLeaderNews] Completed fetch');
}

async function getLeaderNetworkData(
  leaderName: string,
  daysBack: number = 30,
  maxRecords: number = 250
) {
  console.log(`[getLeaderNetworkData] Fetching news for ${leaderName}, daysBack: ${daysBack}, maxRecords: ${maxRecords}`);
  const timespan = String(daysBack * 1440); // Convert days to minutes
  const articles = await fetchLeaderNews(leaderName, timespan, maxRecords);
  console.log(`[getLeaderNetworkData] Fetched ${articles.length} news articles`);
  
  // Process articles to extract network information
  return articles.map((article: any) => ({
    source_url: article.url,
    published_date: article.published,
    entities: {
      persons: article.persons || [],
      organizations: article.organizations || [],
      locations: article.locations || []
    },
    tone: article.tone,
    title: article.title
  }));
}

async function extractRelationships(text: string) {
  console.log('[extractRelationships] Starting relationship extraction...');
  const prompt = `
    Analyze the following text and extract political relationships and sentiments.
    Format the output as JSON with the following structure:
    {
      "entities": [
        {
          "name": "entity name",
          "type": "person/organization/location",
          "role": "brief description of their role"
        }
      ],
      "relationships": [
        {
          "source": "entity1 name",
          "target": "entity2 name",
          "type": "relationship type (ally, opponent, advisor, etc.)",
          "sentiment": "positive/negative/neutral",
          "strength": 1-5 scale,
          "description": "brief description of the relationship"
        }
      ]
    }
    
    Text to analyze:
    ${text}
  `;
  
  try {
    console.log('[extractRelationships] Calling OpenAI API...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a political network analyzer. Extract relationships and sentiments from text." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    console.log('[extractRelationships] OpenAI API responded');
    
    const content = response.choices[0].message.content || '{"entities":[],"relationships":[]}'; 
    return JSON.parse(content);
  } catch (error) {
    console.error("Error in relationship extraction:", error);
    return { entities: [], relationships: [] };
  }
}

import { normalizeNetworkData } from '@/lib/utils';

async function analyzeNetworkData(networkData: any[], englishOnly: boolean = false) {
  const allRelationships: any[] = [];
  const allEntities = new Set<string>();
  
  console.log(`[analyzeNetworkData] Processing ${networkData.length} news items, englishOnly: ${englishOnly}`);
  
  for (const dataPoint of networkData) {
    // Combine title and any other relevant text
    const textToAnalyze = dataPoint.title;
    
    // Extract relationships from the text
    const analysis = await extractRelationships(textToAnalyze);
    
    // Add source context to relationships
    for (const rel of analysis.relationships || []) {
      rel.source_url = dataPoint.source_url;
      rel.source_date = dataPoint.published_date;
      allRelationships.push(rel);
    }
    
    // Track unique entities
    for (const entity of analysis.entities || []) {
      allEntities.add(JSON.stringify(entity));
    }
  }
  
  // Convert entities back to objects
  const uniqueEntities = Array.from(allEntities).map(entity => JSON.parse(entity));
  
  // Apply normalization to connect similar entities across languages
  const normalizedData = normalizeNetworkData(uniqueEntities, allRelationships, englishOnly);
  console.log(`[analyzeNetworkData] Normalized ${normalizedData.entities.length} entities and ${normalizedData.relationships.length} relationships`);
  
  return normalizedData;
}

async function generateNetworkInsights(networkAnalysis: any) {
  console.log('[generateNetworkInsights] Starting network insights generation...');
  const prompt = `
    Analyze this political network and provide insights:
    ${JSON.stringify(networkAnalysis, null, 2)}
    
    Provide analysis in JSON format with these sections:
    1. Key players and their roles
    2. Major relationship patterns
    3. Potential vulnerabilities
    4. Network evolution suggestions
  `;
  
  try {
    console.log('[generateNetworkInsights] Calling OpenAI API...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a political network analysis expert. Provide insights about political networks." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    console.log('[generateNetworkInsights] OpenAI API responded');
    
    const content = response.choices[0].message.content || '{"key_players":[],"major_relationship_patterns":[],"vulnerabilities":[],"evolution_suggestions":[]}'; 
    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating network insights:", error);
    return {
      key_players: [],
      relationship_patterns: [],
      vulnerabilities: [],
      evolution_suggestions: []
    };
  }
}
