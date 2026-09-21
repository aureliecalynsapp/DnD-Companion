// scripts/download-spells.mjs
import fs from 'node:fs';
import path from 'node:path';

// Utilisation de l'endpoint 2014 avec le support multilingue natif et le paramètre français
const API_BASE = 'https://www.dnd5eapi.co';
const LANG_QUERY = '?lang=fr-FR';

// Fonction utilitaire pour temporiser et éviter le rate limit de l'API
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchAllSpells() {
  console.log('Fetching spells list from dnd5eapi.co (French locale)...');
  
  // Récupération de la liste des sorts pour le corpus 2014 avec la langue française
  const res = await fetch(`${API_BASE}/api/2014/spells${LANG_QUERY}`);
  if (!res.ok) throw new Error(`Erreur HTTP liste sorts: ${res.status}`);
  const data = await res.json();
  
  console.log(`Found ${data.count} spells. Fetching details sequentially...`);
  
  const spellsDetails = [];
  
  for (const [index, spell] of data.results.entries()) {
    let success = false;
    let attempts = 0;
    
    while (!success && attempts < 3) {
      try {
        attempts++;
        const spellRes = await fetch(`${API_BASE}${spell.url}${LANG_QUERY}`);
        const contentType = spellRes.headers.get('content-type');
        
        // Sécurité si l'API renvoie du texte brut (Rate limit) au lieu d'un objet JSON
        if (!contentType || !contentType.includes('application/json')) {
          console.warn(`⚠️ Rate limit sur le sort ${spell.index} (tentative ${attempts}). Attente de 2s...`);
          await sleep(2000);
          continue;
        }
        
        const spellData = await spellRes.json();
        
        spellsDetails.push({
          id: spellData.index,
          name: spellData.name,
          level: spellData.level,
          school: spellData.school?.name || '',
          castingTime: spellData.casting_time || '',
          range: spellData.range || '',
          components: spellData.components?.join(', ') || '',
          duration: spellData.duration || '',
          description: spellData.desc?.join('\n\n') || '',
        });

        success = true;
      } catch (error) {
        console.warn(`⚠️ Erreur réseau sur ${spell.index}: ${error.message}. Nouvelle tentative...`);
        await sleep(1500);
      }
    }

    // Affichage de la progression tous les 20 sorts
    if ((index + 1) % 20 === 0 || index + 1 === data.count) {
      console.log(`Progression : ${index + 1}/${data.count} sorts récupérés...`);
    }

    // Petit délai de courtoisie pour l'API (100ms)
    await sleep(100);
  }

  const outputDir = path.resolve('src/data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Sauvegarde directe du fichier JSON en français
  const outputPath = path.join(outputDir, 'spells_fr_test.json');
  fs.writeFileSync(outputPath, JSON.stringify(spellsDetails, null, 2));
  console.log(`✅ Success! ${spellsDetails.length} French spells saved to src/data/spells_fr_test.json`);
}

fetchAllSpells().catch(console.error);