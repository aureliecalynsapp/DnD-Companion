// scripts/download-equipment.mjs
import fs from 'node:fs';
import path from 'node:path';

const API_BASE = 'https://www.dnd5eapi.co';

async function fetchAllEquipment() {
  console.log('Fetching equipment list from dnd5eapi.co...');
  const res = await fetch(`${API_BASE}/api/equipment`);
  const data = await res.json();
  
  console.log(`Found ${data.count} equipment items. Fetching complete details...`);
  
  const equipmentDetails = await Promise.all(
    data.results.map(async (item) => {
      const itemRes = await fetch(`${API_BASE}${item.url}`);
      const itemData = await itemRes.json();
      
      return {
        // Champs généraux
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
      };
    })
  );

  const outputDir = path.resolve('src/data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'equipment_en.json');
  fs.writeFileSync(outputPath, JSON.stringify(equipmentDetails, null, 2));
  console.log(`✅ Success! ${equipmentDetails.length} complete equipment items saved to src/data/equipment_en.json`);
}

fetchAllEquipment().catch(console.error);