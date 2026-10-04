import type { Item, Currency } from '../types/character';

// Structure compacte pour alléger la taille du payload dans le QR Code (types assouplis pour les objets complexes)
export interface CompactTradePayload {
  v: number; // Version du protocole
  t: number; // Timestamp
  i?: Array<{
    n: string;                        // name
    q: number;                        // quantity
    w?: number;                       // weight
    cat?: string;                     // catalogId
    eqc?: string;                     // equipmentCategory
    gc?: string;                      // gearCategory
    arc?: string;                     // armorCategory
    wc?: string;                      // weaponCategory
    tc?: string;                      // toolCategory
    vc?: string;                      // vehicleCategory
    co?: any;                         // cost
    desc?: string;                    // description
    ac?: any;                         // armorClass (nombre ou objet détaillé)
    sd?: boolean;                     // stealthDisadvantage
    dmg?: any;                        // damage
    thd?: any;                        // twoHandedDamage
    rng?: string;                     // weaponRange
    str?: number;                     // strMinimum
    spd?: any;                        // speed
    cap?: any;                        // capacity
  }>;
  c?: Partial<Currency>;
}

// Encode l'inventaire et/ou la monnaie en une chaîne JSON compacte
export const encodeTradePayload = (
  items?: Omit<Item, 'id'>[],
  currency?: Partial<Currency>
): string => {
  const payload: CompactTradePayload = {
    v: 1,
    t: Date.now(),
  };

  if (items && items.length > 0) {
    payload.i = items.map((item) => ({
      n: item.name,
      q: item.quantity,
      ...(item.weight !== undefined ? { w: item.weight } : {}),
      ...(item.catalogId ? { cat: item.catalogId } : {}),
      ...(item.equipmentCategory ? { eqc: item.equipmentCategory } : {}),
      ...(item.gearCategory ? { gc: item.gearCategory } : {}),
      ...(item.armorCategory ? { arc: item.armorCategory } : {}),
      ...(item.weaponCategory ? { wc: item.weaponCategory } : {}),
      ...(item.toolCategory ? { tc: item.toolCategory } : {}),
      ...(item.vehicleCategory ? { vc: item.vehicleCategory } : {}),
      ...(item.cost ? { co: item.cost } : {}),
      ...(item.description ? { desc: item.description } : {}),
      ...(item.armorClass !== undefined ? { ac: item.armorClass } : {}),
      ...(item.stealthDisadvantage !== undefined ? { sd: item.stealthDisadvantage } : {}),
      ...(item.damage ? { dmg: item.damage } : {}),
      ...(item.twoHandedDamage ? { thd: item.twoHandedDamage } : {}),
      ...(item.weaponRange ? { rng: item.weaponRange } : {}),
      ...(item.strMinimum !== undefined ? { str: item.strMinimum } : {}),
      ...(item.speed !== undefined ? { spd: item.speed } : {}),
      ...(item.capacity !== undefined ? { cap: item.capacity } : {}),
    }));
  }

  if (currency && Object.keys(currency).length > 0) {
    payload.c = currency;
  }

  return JSON.stringify(payload);
};

// Décode le QR Code scanné et reconstitue les objets complets
export const decodeTradePayload = (
  rawJson: string
): { items?: Omit<Item, 'id'>[]; currency?: Partial<Currency> } | null => {
  try {
    const data: CompactTradePayload = JSON.parse(rawJson);
    if (!data.v || (!data.i && !data.c)) return null;

    return {
      items: data.i?.map((item) => ({
        name: item.n,
        quantity: item.q,
        weight: item.w,
        catalogId: item.cat,
        equipmentCategory: item.eqc,
        gearCategory: item.gc,
        armorCategory: item.arc,
        weaponCategory: item.wc,
        toolCategory: item.tc,
        vehicleCategory: item.vc,
        cost: item.co,
        description: item.desc,
        armorClass: item.ac,
        stealthDisadvantage: item.sd,
        damage: item.dmg,
        twoHandedDamage: item.thd,
        weaponRange: item.rng,
        strMinimum: item.str,
        speed: item.spd,
        capacity: item.cap,
      })),
      currency: data.c,
    };
  } catch {
    return null;
  }
};