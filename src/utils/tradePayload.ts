// src/utils/tradePayload.ts
import type { Item, Currency } from '../types/character';

export interface CompactTradePayload {
  v: number;
  t: number;
  i?: Array<{ n: string; q: number; w?: number }>;
  c?: Partial<Currency>;
}

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
      ...(item.weight ? { w: item.weight } : {}),
    }));
  }

  if (currency && Object.keys(currency).length > 0) {
    payload.c = currency;
  }

  return JSON.stringify(payload);
};

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
      })),
      currency: data.c,
    };
  } catch {
    return null;
  }
};