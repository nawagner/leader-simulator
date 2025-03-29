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
  'индия': 'india',
  'лавров': 'lavrov',
  'сергей лавров': 'sergey lavrov',
  'песков': 'peskov',
  'дмитрий песков': 'dmitry peskov',
  'мзс': 'ministry of foreign affairs',
  
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
  'білий дім': 'white house',
  'уніан': 'unian',
  'гітлер': 'hitler',
  
  // Chinese, Arabic, and other languages (from logs)
  '普京': 'putin',
  '阿萨德': 'assad',
  '泽连斯基': 'zelensky',
  'ترامب': 'trump',   // Arabic Trump
  'بوتين': 'putin',   // Arabic Putin
  'ट्रम्प': 'trump',   // Hindi Trump
  'ट्रंप': 'trump',    // Alternative Hindi Trump
  'ট্রাম্প': 'trump',  // Bengali Trump
  'পুতিন': 'putin',   // Bengali Putin
  
  // European names and variations
  'američkih predsednika': 'american presidents',
  'kremlj': 'kremlin',
  
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
  
  // Ensure consistent handling of Putin variations
  'vladimir putin': 'vladimir putin',
  'v. putin': 'vladimir putin',
  'vv putin': 'vladimir putin',
  
  // Other common political leaders
  'volodymyr zelensky': 'volodymyr zelensky',
  
  'president biden': 'joe biden',
  
  'president xi': 'xi jinping',
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
/**
 * Enhanced entity name normalization with more sophisticated matching
 * @param name The entity name to normalize
 * @returns The normalized entity name (in English with standardized form)
 */
export function normalizeEntityName(name: string): string {
  if (!name) return '';
  
  const lowerName = name.toLowerCase().trim();
  
  // First check if we have an exact match in our mapping
  if (ENTITY_NAME_MAPPINGS[lowerName]) {
    return ENTITY_NAME_MAPPINGS[lowerName];
  }
  
  // Check for substring matches for common high-profile names
  // This helps with cases like "Russian President Putin" -> "Vladimir Putin"
  if (lowerName.includes('putin')) {
    return 'vladimir putin';
  }
  
  if (lowerName.includes('trump') && !lowerName.includes('ivanka') && !lowerName.includes('junior') && !lowerName.includes('jr')) {
    return 'donald trump';
  }
  
  if ((lowerName.includes('biden') || lowerName.includes('bidden')) && !lowerName.includes('hunter')) {
    return 'joe biden';
  }
  
  if (lowerName.includes('zelensky') || lowerName.includes('zelenskyy')) {
    return 'volodymyr zelensky';
  }
  
  if (lowerName.includes('jinping') || (lowerName.includes('xi') && lowerName.length < 15)) {
    return 'xi jinping';
  }
  
  // Return the original name if no match is found
  return lowerName;
}

/**
 * Filter and normalize entities and relationships to improve visualization
 * Ensures that similar entities are merged and all nodes have connections
 * @param entities List of entities to normalize
 * @param relationships List of relationships to normalize
 * @param englishOnly Whether to filter out non-English entities
 * @returns Object containing normalized entities and relationships
 */
export function normalizeNetworkData(
  entities: any[], 
  relationships: any[], 
  englishOnly: boolean = true  // Default to English-only now
): { entities: any[], relationships: any[] } {
  console.log(`[normalizeNetworkData] Starting with ${entities.length} entities, ${relationships.length} relationships, englishOnly: ${englishOnly}`);
  
  // Debug entity names
  console.log(`[normalizeNetworkData] Original entity names: ${entities.map(e => e.name).join(', ')}`);
  
  // Step 1: Create a complete mapping of all entity names (original and normalized)
  const entityMap = new Map(); // Maps all names (original and normalized) to their normalized versions
  const nonEnglishNames = new Set<string>(); // Track non-English entity names
  
  // First pass - normalize all names and track what's non-English
  entities.forEach(entity => {
    if (!entity.name) {
      console.log(`[normalizeNetworkData] Warning: entity without name: ${JSON.stringify(entity)}`);
      return;
    }
    
    const originalName = entity.name.toLowerCase().trim();
    const normalizedName = normalizeEntityName(originalName);
    
    // Add both the original and normalized name to the map
    entityMap.set(originalName, normalizedName);
    entityMap.set(normalizedName, normalizedName); // Map normalized to itself for consistency
    
    if (!isLikelyEnglish(originalName)) {
      nonEnglishNames.add(originalName);
      console.log(`[normalizeNetworkData] Non-English entity detected: '${originalName}' -> '${normalizedName}'`);
    }
  });

  // Add entities from relationships that might not be in entities list
  relationships.forEach(rel => {
    const source = (rel.source || '').toLowerCase().trim();
    const target = (rel.target || '').toLowerCase().trim();
    
    if (source && !entityMap.has(source)) {
      const normalizedSource = normalizeEntityName(source);
      entityMap.set(source, normalizedSource);
      entityMap.set(normalizedSource, normalizedSource);
      console.log(`[normalizeNetworkData] Adding missing entity from relationship source: '${source}' -> '${normalizedSource}'`);
      
      if (!isLikelyEnglish(source)) {
        nonEnglishNames.add(source);
      }
    }
    
    if (target && !entityMap.has(target)) {
      const normalizedTarget = normalizeEntityName(target);
      entityMap.set(target, normalizedTarget);
      entityMap.set(normalizedTarget, normalizedTarget);
      console.log(`[normalizeNetworkData] Adding missing entity from relationship target: '${target}' -> '${normalizedTarget}'`);
      
      if (!isLikelyEnglish(target)) {
        nonEnglishNames.add(target);
      }
    }
  });

  // Step 2: Create normalized entity objects
  const normalizedEntities = new Map(); // normalized name -> entity object
  
  // Add all original entities to the normalized map
  entities.forEach(entity => {
    if (!entity.name) return;
    
    const originalName = entity.name.toLowerCase().trim();
    const normalizedName = entityMap.get(originalName);
    
    // Skip non-English entities if requested
    if (englishOnly && nonEnglishNames.has(originalName)) {
      return;
    }
    
    // If we already have this normalized entity, merge data
    if (normalizedEntities.has(normalizedName)) {
      const existingEntity = normalizedEntities.get(normalizedName);
      existingEntity.original_names = [...new Set([...(existingEntity.original_names || []), originalName])];
    } else {
      normalizedEntities.set(normalizedName, {
        ...entity,
        name: normalizedName,
        original_names: [originalName]
      });
    }
  });
  
  // Step 3: Add entities from relationships if they don't exist yet
  relationships.forEach(rel => {
    const sourceOriginal = (rel.source || '').toLowerCase().trim();
    const targetOriginal = (rel.target || '').toLowerCase().trim();
    
    if (!sourceOriginal || !targetOriginal) return;
    
    const sourceNormalized = entityMap.get(sourceOriginal);
    const targetNormalized = entityMap.get(targetOriginal);
    
    // Skip non-English entities if requested
    if (englishOnly) {
      if (nonEnglishNames.has(sourceOriginal) || nonEnglishNames.has(targetOriginal)) {
        return;
      }
    }
    
    // Add source entity if it doesn't exist in normalized entities
    if (!normalizedEntities.has(sourceNormalized)) {
      normalizedEntities.set(sourceNormalized, {
        name: sourceNormalized,
        type: 'person', // Default type
        role: 'Unknown', // Default role
        original_names: [sourceOriginal]
      });
    }
    
    // Add target entity if it doesn't exist in normalized entities
    if (!normalizedEntities.has(targetNormalized)) {
      normalizedEntities.set(targetNormalized, {
        name: targetNormalized,
        type: 'person', // Default type
        role: 'Unknown', // Default role
        original_names: [targetOriginal]
      });
    }
  });
  
  // Step 4: Normalize relationships - this must happen AFTER all entities are added
  let normalizedRelationships = relationships
    .map(rel => {
      const sourceOriginal = (rel.source || '').toLowerCase().trim();
      const targetOriginal = (rel.target || '').toLowerCase().trim();
      
      if (!sourceOriginal || !targetOriginal) {
        console.log(`[normalizeNetworkData] Warning: relationship with missing source/target: ${JSON.stringify(rel)}`);
        return null;
      }
      
      const sourceNormalized = entityMap.get(sourceOriginal);
      const targetNormalized = entityMap.get(targetOriginal);
      
      // Skip non-English entities if requested
      if (englishOnly) {
        if (nonEnglishNames.has(sourceOriginal) || nonEnglishNames.has(targetOriginal)) {
          return null;
        }
      }
      
      // Ensure both entities exist in our normalized map
      if (!normalizedEntities.has(sourceNormalized) || !normalizedEntities.has(targetNormalized)) {
        return null;
      }
      
      return {
        ...rel,
        source: sourceNormalized,
        target: targetNormalized,
        source_original: sourceOriginal,
        target_original: targetOriginal
      };
    })
    .filter(rel => rel !== null); // Remove nulls from invalid relationships
  
  // Step 5: Create connectivity fallback - ensure no orphaned nodes
  // First identify which entities would be disconnected
  const connectedEntities = new Set<string>();
  normalizedRelationships.forEach(rel => {
    connectedEntities.add(rel.source);
    connectedEntities.add(rel.target);
  });
  
  const disconnectedEntities: string[] = [];
  let mainEntity = null;
  let mainEntityName = '';
  
  // Find the entity with the most connections to serve as our central node
  const entityConnectionCounts = new Map<string, number>();
  normalizedRelationships.forEach(rel => {
    entityConnectionCounts.set(rel.source, (entityConnectionCounts.get(rel.source) || 0) + 1);
    entityConnectionCounts.set(rel.target, (entityConnectionCounts.get(rel.target) || 0) + 1);
  });
  
  // Find the most connected entity
  let maxConnections = 0;
  for (const [entityName, count] of entityConnectionCounts.entries()) {
    if (count > maxConnections) {
      maxConnections = count;
      mainEntityName = entityName;
    }
  }
  
  // If no connected entities found, just pick the first entity as main
  if (!mainEntityName && normalizedEntities.size > 0) {
    mainEntityName = Array.from(normalizedEntities.keys())[0];
  }
  
  if (mainEntityName) {
    mainEntity = normalizedEntities.get(mainEntityName);
    console.log(`[normalizeNetworkData] Main entity is ${mainEntityName} with ${maxConnections} connections`);
  }
  
  // Connect orphaned nodes to the main entity
  let fallbackRelationshipsAdded = 0;
  normalizedEntities.forEach((entity, entityName) => {
    if (!connectedEntities.has(entityName) && mainEntity && entityName !== mainEntityName) {
      // This is an orphaned node - connect it to the main entity
      disconnectedEntities.push(entityName);
      
      // Create a fallback relationship
      normalizedRelationships.push({
        source: mainEntityName,
        target: entityName,
        type: 'connection',
        sentiment: 'neutral',
        strength: 1,
        description: 'Connected entities',
        is_fallback: true // Mark as a fallback connection
      });
      
      fallbackRelationshipsAdded++;
    }
  });
  
  console.log(`[normalizeNetworkData] Added ${fallbackRelationshipsAdded} fallback connections to previously disconnected entities: ${disconnectedEntities.join(', ')}`);
  
  // All entities should now be connected, create the final result
  const connectedEntitiesList = Array.from(normalizedEntities.values());
  
  const result = {
    entities: connectedEntitiesList,
    relationships: normalizedRelationships
  };
  
  // Print final normalized entity names for debugging
  console.log(`[normalizeNetworkData] Final normalized entity names: ${result.entities.map(e => e.name).join(', ')}`);
  console.log(`[normalizeNetworkData] Finished with ${result.entities.length} entities and ${result.relationships.length} relationships (including ${fallbackRelationshipsAdded} fallback connections)`);
  
  return result;
}
