
import type { CatalogItem } from '../types/catalogEquipment';
import equipmentDataJson from '../data/equipment_fr.json';

const equipmentData = equipmentDataJson as CatalogItem[];

// Dictionnaire de correspondance pour harmoniser avec les abréviations françaises de D&D 5E
export const unitMap: Record<string, string> = { gp: 'po', sp: 'pa', cp: 'pc', pp: 'pp' };

/**
 * Formate proprement l'affichage du coût à partir de l'objet cost
 */
export const formatCostDisplay = (cost?: { quantity: number; unit: string | null } | null): string => {
  if (!cost || cost.quantity == null || !cost.unit) { return 'Gratuit'; }
  const unitKey = cost.unit.toLowerCase();
  const unitDisplay = unitMap[unitKey] || cost.unit;
  return `${cost.quantity} ${unitDisplay}`;
};

/**
 * Retrouve un objet du catalogue par son index ou son nom
 */
export const findCatalogItemByRef = (itemRef: { id: string; name: string }): CatalogItem | undefined => {
  return equipmentData.find(
    (eq) => eq.id === itemRef.id || eq.name.toLowerCase() === itemRef.name.toLowerCase()
  );
};

// Dictionnaire de mapping pour traduire les catégories d'équipement 
export const equipmentCategoryMap: Record<string, string> = {
  'Outils': "Outil",
  'Montures et véhicules': "Monture",
  'Arme': "Arme",
  'Armure': "Armure",
  "Équipement d'aventurier": "Autre",
};

// Dictionnaire de traduction pour les unités de vitesse (speed.unit)
export const speedUnitMap: Record<string, string> = {
  'ft/round': 'pieds/round',
  'mph': 'm/h (miles par heure)',
  'ft': 'pieds',
};

// Fonction utilitaire pour obtenir la traduction d'une catégorie d'équipement (avec fallback)
export const translateEquipmentCategory = (category?: string | null): string => {
  if (!category) return 'Divers';
  return equipmentCategoryMap[category] || category;
};

// Fonction utilitaire pour traduire l'unité de vitesse
export const translateSpeedUnit = (unit?: string | null): string => {
  if (!unit) return '';
  return speedUnitMap[unit.toLowerCase()] || unit;
};
