// scripts/download-spells.mjs
import fs from 'node:fs';
import path from 'node:path';

const API_BASE = 'https://www.dnd5eapi.co';

async function fetchAllSpells() {
  console.log('Fetching spells list from dnd5eapi.co...');
  const res = await fetch(`${API_BASE}/api/spells`);
  const data = await res.json();
  
  console.log(`Found ${data.count} spells. Fetching details...`);
  
  const spellsDetails = await Promise.all(
    data.results.map(async (spell) => {
      const spellRes = await fetch(`${API_BASE}${spell.url}`);
      const spellData = await spellRes.json();
      
      return {
        id: spellData.index,
        name: spellData.name,
        level: spellData.level,
        school: spellData.school?.name || '',
        castingTime: spellData.casting_time || '',
        range: spellData.range || '',
        components: spellData.components?.join(', ') || '',
        duration: spellData.duration || '',
        description: spellData.desc?.join('\n\n') || '',
      };
    })
  );

  const outputDir = path.resolve('src/data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'spells_en.json');
  fs.writeFileSync(outputPath, JSON.stringify(spellsDetails, null, 2));
  console.log(`✅ Success! ${spellsDetails.length} spells saved to src/data/spells_en.json`);
}

fetchAllSpells().catch(console.error);