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
