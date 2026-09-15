export interface AbilityInfo {
  code: string;
  shortLabel: string;
  fullLabel: string;
  description: string;
}

export const ABILITIES_INFO: Record<string, AbilityInfo> = {
  STR: {
    code: 'STR',
    shortLabel: 'FOR',
    fullLabel: 'Force',
    description: 'Puissance physique, athlétisme, dégâts au corps à corps',
  },
  DEX: {
    code: 'DEX',
    shortLabel: 'DEX',
    fullLabel: 'Dextérité',
    description: 'Agilité, réflexes, esquive, discrétion et attaques à distance',
  },
  CON: {
    code: 'CON',
    shortLabel: 'CON',
    fullLabel: 'Constitution',
    description: 'Santé, endurance et résistance physique',
  },
  INT: {
    code: 'INT',
    shortLabel: 'INT',
    fullLabel: 'Intelligence',
    description: 'Mise en mémoire, logique, connaissances arcaniques et histoire',
  },
  WIS: {
    code: 'WIS',
    shortLabel: 'SAG',
    fullLabel: 'Sagesse',
    description: 'Perception, intuition, survie et volonté',
  },
  CHA: {
    code: 'CHA',
    shortLabel: 'CHA',
    fullLabel: 'Charisme',
    description: 'Force de personnalité, persuasion, tromperie et intimidation',
  },
};