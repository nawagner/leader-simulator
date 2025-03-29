import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns a color for an entity based on its type
 */
export function getEntityColor(type: string): string {
  const typeColorMap: Record<string, string> = {
    'politician': '#4299E1', // blue
    'government': '#48BB78', // green
    'organization': '#ED8936', // orange
    'business': '#9F7AEA', // purple
    'military': '#F56565', // red
    'media': '#ECC94B', // yellow
    'academic': '#38B2AC', // teal
    'religious': '#667EEA', // indigo
  };
  
  return typeColorMap[type.toLowerCase()] || '#A0AEC0'; // default gray
}

/**
 * Returns a color for a relationship based on its type and sentiment
 */
export function getRelationshipColor(type: string, sentiment: string): string {
  if (sentiment === 'negative') {
    return '#F56565'; // red for negative relationships
  }
  
  const typeColorMap: Record<string, string> = {
    'alliance': '#48BB78', // green
    'family': '#4299E1', // blue
    'professional': '#9F7AEA', // purple
    'political': '#ED8936', // orange
    'economic': '#667EEA', // indigo
    'rival': '#F56565', // red
    'conflict': '#F56565', // red
  };
  
  return typeColorMap[type.toLowerCase()] || '#A0AEC0'; // default gray
}

/**
 * Common entity name mappings across languages
 */
const ENTITY_NAME_MAPPINGS: Record<string, string> = {
  // Russian to English
  'владимир путин': 'vladimir putin',
  'путин': 'putin',
  'россия': 'russia',
  'украина': 'ukraine',
  'зеленский': 'zelensky',
  'владимир зеленский': 'volodymyr zelensky',
  'сша': 'usa',
  'соединенные штаты': 'united states',
  'китай': 'china',
  'си цзиньпин': 'xi jinping',
  'европа': 'europe',
  'европейский союз': 'european union',
  'ес': 'eu',
  'нато': 'nato',
  'джо байден': 'joe biden',
  'байден': 'biden',
  'пентагон': 'pentagon',
  'белый дом': 'white house',
  'кремль': 'kremlin',
  
  // Greek to English (from the network graph)
  'ἵνα ἀντερῶν': 'ivanka trump',
  'αντΐτρουμπ jr': 'donald trump jr',
  'μαρ-α-λαγο': 'mar-a-lago',
  'ραφ-α-φαβρα': 'mar-a-lago',
  'μαρ ο λέην': 'mar-a-lago',
  'μαρ α λαγο': 'mar-a-lago',
  
  // Ukrainian and more Russian to English (from latest graph)
  'україна': 'ukraine',
  'українa': 'ukraine',
  'ведщим денисенко': 'vadym denysenko',
  'денисенко': 'denysenko',
  'вадим денисенко': 'vadym denysenko',
  'вадим': 'vadym',
  'трамп': 'trump',
  'трaмп': 'trump',
  'америка': 'america',
  'американские президенты': 'american presidents',
  
  // Korean and other Asian languages to English
  '트럼프 행정부': 'trump administration',
  '트럼프': 'donald trump',
  '도널드 트럼프': 'donald trump',
  '조 바이든': 'joe biden',
  '바이든': 'biden',
  '김정은': 'kim jong-un',
  '블라디미르 푸틴': 'vladimir putin',
  '푸틴': 'putin',
  '시진핑': 'xi jinping',
  '문재인': 'moon jae-in',
  '윤석열': 'yoon suk-yeol',
  
  // Other common political figures and entities
  'kim jong un': 'kim jong-un',
  'kim jong-un': 'kim jong-un',
  'xi': 'xi jinping',
  'biden': 'joe biden',
  'zelensky': 'volodymyr zelensky',
  'zelenskyy': 'volodymyr zelensky',
  'volodymyr zelenskyy': 'volodymyr zelensky',
  'u.s.': 'usa',
  'u.s.a.': 'usa',
  'united states': 'usa',
  'united states of america': 'usa',
  'america': 'usa',
  'dprk': 'north korea',
  'rok': 'south korea',
  'roc': 'taiwan',
  'prc': 'china',
  'grok ai': 'grok ai',
  'tramp': 'trump',
  
  // Additional mappings from the graph
  'donald trump': 'donald trump',
  'trumps': 'donald trump',
  'trump': 'donald trump',
  'melania trump': 'melania trump',
  'elon musk': 'elon musk',
  'bettina anderson': 'bettina anderson',
  'democrat': 'democrat',
};

/**
 * Detects if text is likely in English
 * Improved heuristic that checks for non-Latin script characters
 */
export function isLikelyEnglish(text: string): boolean {
  if (!text) return true;
  
  // Patterns for common non-Latin scripts
  const cyrillicPattern = /[\u0400-\u04FF]/;
  const chinesePattern = /[\u4E00-\u9FFF]/;
  const arabicPattern = /[\u0600-\u06FF]/;
  const koreanPattern = /[\uAC00-\uD7AF]/;
  const greekPattern = /[\u0370-\u03FF]/;
  const thaiPattern = /[\u0E00-\u0E7F]/;
  const japanesePattern = /[\u3040-\u309F]|[\u30A0-\u30FF]|[\u4E00-\u9FAF]/;
  
  // Count non-Latin characters
  const nonLatinCount = (text.match(cyrillicPattern) || []).length +
    (text.match(chinesePattern) || []).length +
    (text.match(arabicPattern) || []).length +
    (text.match(koreanPattern) || []).length +
    (text.match(greekPattern) || []).length +
    (text.match(thaiPattern) || []).length +
    (text.match(japanesePattern) || []).length;
  
  // If more than 15% of characters are non-Latin, consider it non-English
  // This allows for some foreign names in otherwise English text
  return nonLatinCount < (text.length * 0.15);
}

/**
 * Normalizes entity names across languages
 * @param name The entity name to normalize
 * @returns The normalized entity name (in English where possible)
 */
export function normalizeEntityName(name: string): string {
  const lowerName = name.toLowerCase().trim();
  return ENTITY_NAME_MAPPINGS[lowerName] || lowerName;
}

/**
 * Filter and normalize entities and relationships to improve visualization
 * @param entities List of entities to normalize
 * @param relationships List of relationships to normalize
 * @param englishOnly Whether to filter out non-English entities
 * @returns Object containing normalized entities and relationships
 */
export function normalizeNetworkData(
  entities: any[], 
  relationships: any[], 
  englishOnly: boolean = false
): { entities: any[], relationships: any[] } {
  console.log(`[normalizeNetworkData] Starting with ${entities.length} entities, ${relationships.length} relationships, englishOnly: ${englishOnly}`);
  
  // Debug entity names
  console.log(`[normalizeNetworkData] Original entity names: ${entities.map(e => e.name).join(', ')}`);
  
  // Step 1: Normalize all entity names first
  const normalizedNames = new Map(); // Original name -> normalized name
  const nonEnglishNames = new Set<string>(); // Track non-English entity names (original)
  
  // First pass - just normalize names and detect language
  entities.forEach(entity => {
    if (!entity.name) {
      console.log(`[normalizeNetworkData] Warning: entity without name: ${JSON.stringify(entity)}`);
      return;
    }
    
    const originalName = entity.name.toLowerCase().trim();
    const normalizedName = normalizeEntityName(originalName);
    
    normalizedNames.set(originalName, normalizedName);
    
    if (!isLikelyEnglish(originalName)) {
      nonEnglishNames.add(originalName);
      console.log(`[normalizeNetworkData] Non-English entity detected: '${originalName}' -> '${normalizedName}'`);
    }
  });

  // Step 2: Create normalized entity objects
  const normalizedEntities = new Map(); // normalized name -> entity object
  
  entities.forEach(entity => {
    if (!entity.name) return;
    
    const originalName = entity.name.toLowerCase().trim();
    const normalizedName = normalizedNames.get(originalName) || normalizeEntityName(originalName);
    
    // Skip non-English entities if requested
    if (englishOnly && nonEnglishNames.has(originalName)) {
      return;
    }
    
    // If we already have this normalized entity, merge data
    if (normalizedEntities.has(normalizedName)) {
      const existingEntity = normalizedEntities.get(normalizedName);
      existingEntity.original_names = [...(existingEntity.original_names || []), originalName];
    } else {
      normalizedEntities.set(normalizedName, {
        ...entity,
        name: normalizedName,
        original_names: [originalName]
      });
    }
  });
  
  // Step 3: Normalize relationships based on normalized entity names
  let normalizedRelationships = relationships
    .map(rel => {
      const sourceOriginal = (rel.source || '').toLowerCase().trim();
      const targetOriginal = (rel.target || '').toLowerCase().trim();
      
      if (!sourceOriginal || !targetOriginal) {
        console.log(`[normalizeNetworkData] Warning: relationship with missing source/target: ${JSON.stringify(rel)}`);
        return null;
      }
      
      const sourceNormalized = normalizedNames.get(sourceOriginal) || normalizeEntityName(sourceOriginal);
      const targetNormalized = normalizedNames.get(targetOriginal) || normalizeEntityName(targetOriginal);
      
      return {
        ...rel,
        source: sourceNormalized,
        target: targetNormalized,
        source_original: sourceOriginal,
        target_original: targetOriginal
      };
    })
    .filter(rel => rel !== null); // Remove nulls from invalid relationships
  
  // Step 4: Filter relationships to only include those between valid entities
  if (englishOnly || true) { // Always filter relationships to valid entities
    normalizedRelationships = normalizedRelationships.filter(rel => {
      // Only keep relationships where both source and target exist in our normalized entities
      return normalizedEntities.has(rel.source) && normalizedEntities.has(rel.target);
    });
  }
  
  const result = {
    entities: Array.from(normalizedEntities.values()),
    relationships: normalizedRelationships
  };
  
  // Print final normalized entity names for debugging
  console.log(`[normalizeNetworkData] Final normalized entity names: ${result.entities.map(e => e.name).join(', ')}`);
  console.log(`[normalizeNetworkData] Finished with ${result.entities.length} entities and ${result.relationships.length} relationships`);
  
  return result;
}
