// scripts/download-equipment.mjs
import fs from 'node:fs';
import path from 'node:path';

const API_BASE = 'https://www.dnd5eapi.co';
const LANG_QUERY = '?lang=fr-FR';

// Fonction utilitaire pour temporiser et éviter le rate limit de l'API
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchAllEquipment() {
  console.log('Fetching equipment list from dnd5eapi.co (French locale)...');
  
  const res = await fetch(`${API_BASE}/api/2014/equipment${LANG_QUERY}`);
  if (!res.ok) throw new Error(`Erreur HTTP liste: ${res.status}`);
  const data = await res.json();
  
  console.log(`Found ${data.count} equipment items. Fetching complete details sequentially...`);
  
  const equipmentDetails = [];
  
  for (const [index, item] of data.results.entries()) {
    let success = false;
    let attempts = 0;
    
    while (!success && attempts < 3) {
      try {
        attempts++;
        const itemRes = await fetch(`${API_BASE}${item.url}${LANG_QUERY}`);
        const contentType = itemRes.headers.get('content-type');
        
        // Si l'API renvoie du texte (Rate limit) au lieu de JSON
        if (!contentType || !contentType.includes('application/json')) {
          const text = await itemRes.text();
          console.warn(`⚠️ Rate limit sur ${item.index} (tentative ${attempts}). Attente de 2s...`);
          await sleep(2000);
          continue;
        }
        
        const itemData = await itemRes.json();
        
        equipmentDetails.push({
          // Champs généraux traduits nativement par l'API
          id: itemData.index,
          name: itemData.name,
          description: itemData.desc ? itemData.desc.join('\n\n') : '',
          equipmentCategory: itemData.equipment_category?.name || 'Divers',
          gearCategory: itemData.gear_category?.name || null,
          cost: itemData.cost ? { quantity: itemData.cost.quantity, unit: itemData.cost.unit } : null,
          weight: itemData.weight || 0,

          // Propriétés spécifiques (Armes, Armures, Outils, Contenus...)
          armorCategory: itemData.armor_category || null,
          armorClass: itemData.armor_class || null,
          capacity: itemData.capacity || null,
          categoryRange: itemData.category_range || null,
          contents: itemData.contents || [],
          damage: itemData.damage || null,
          properties: itemData.properties || [],
          quantity: itemData.quantity || 1,
          range: itemData.range || null,
          speed: itemData.speed || null,
          stealthDisadvantage: itemData.stealth_disadvantage || false,
          strMinimum: itemData.str_minimum || 0,
          throwRange: itemData.throw_range || null,
          toolCategory: itemData.tool_category || null,
          twoHandedDamage: itemData.two_handed_damage || null,
          vehicleCategory: itemData.vehicle_category || null,
          weaponCategory: itemData.weapon_category || null,
          weaponRange: itemData.weapon_range || null,
        });

        success = true;
      } catch (error) {
        console.warn(`⚠️ Erreur réseau sur ${item.index}: ${error.message}. Nouvelle tentative...`);
        await sleep(1500);
      }
    }

    // Affichage de progression tous les 10 items
    if ((index + 1) % 10 === 0 || index + 1 === data.count) {
      console.log(`Progression : ${index + 1}/${data.count} items récupérés...`);
    }

    // Petit délai de courtoisie pour l'API (100ms)
    await sleep(100);
  }

  const outputDir = path.resolve('src/data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'equipment_fr_test.json');
  fs.writeFileSync(outputPath, JSON.stringify(equipmentDetails, null, 2));
  console.log(`✅ Success! ${equipmentDetails.length} French equipment items saved to src/data/equipment_fr_test.json`);
}

fetchAllEquipment().catch(console.error);