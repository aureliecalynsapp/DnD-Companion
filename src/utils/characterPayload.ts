// src/utils/characterPayload.ts
import { deflate, inflate } from 'pako';
import type { Character } from '../types/character';

export function encodeCharacterPayload(character: Character): string {
  try {
    const jsonStr = JSON.stringify(character);
    // Compression directe avec la fonction deflate
    const compressed = deflate(jsonStr);
    
    let binary = '';
    const len = compressed.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(compressed[i]);
    }
    return `DND5E_CHAR:${btoa(binary)}`;
  } catch (err) {
    console.error('Erreur encodage personnage:', err);
    return '';
  }
}

export function decodeCharacterPayload(payload: string): Character | null {
  if (!payload.startsWith('DND5E_CHAR:')) return null;
  try {
    const base64 = payload.replace('DND5E_CHAR:', '');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    // Décompression directe avec inflate -> Uint8Array
    const decompressedBytes = inflate(bytes);
    
    // Conversion Uint8Array -> string UTF-8
    const jsonStr = new TextDecoder().decode(decompressedBytes);
    
    const character = JSON.parse(jsonStr) as Character;

    if (character && character.name && character.hp) {
      return character;
    }
    return null;
  } catch (err) {
    console.error('Erreur décodage personnage:', err);
    return null;
  }
}