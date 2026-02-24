// Delivery pricing for Algeria - zone-based pricing per wilaya
// Prices are in centimes (DZD cents) - divide by 100 for DA display

export type DeliveryType = 'home' | 'stopdesk';

export interface DeliveryZone {
  zone: number;
  label_fr: string;
  label_ar: string;
  label_en: string;
  home_price: number;    // in centimes
  stopdesk_price: number; // in centimes
}

// Zone definitions with prices
export const deliveryZones: Record<number, DeliveryZone> = {
  1: {
    zone: 1,
    label_fr: 'Alger & environs',
    label_ar: 'الجزائر والمناطق المجاورة',
    label_en: 'Algiers & surroundings',
    home_price: 40000,     // 400 DA
    stopdesk_price: 20000, // 200 DA
  },
  2: {
    zone: 2,
    label_fr: 'Proche banlieue',
    label_ar: 'الضواحي القريبة',
    label_en: 'Near suburbs',
    home_price: 50000,     // 500 DA
    stopdesk_price: 30000, // 300 DA
  },
  3: {
    zone: 3,
    label_fr: 'Nord',
    label_ar: 'الشمال',
    label_en: 'North',
    home_price: 60000,     // 600 DA
    stopdesk_price: 35000, // 350 DA
  },
  4: {
    zone: 4,
    label_fr: 'Hauts Plateaux',
    label_ar: 'الهضاب العليا',
    label_en: 'High Plateaus',
    home_price: 70000,     // 700 DA
    stopdesk_price: 40000, // 400 DA
  },
  5: {
    zone: 5,
    label_fr: 'Sud',
    label_ar: 'الجنوب',
    label_en: 'South',
    home_price: 90000,     // 900 DA
    stopdesk_price: 50000, // 500 DA
  },
  6: {
    zone: 6,
    label_fr: 'Grand Sud',
    label_ar: 'أقصى الجنوب',
    label_en: 'Far South',
    home_price: 120000,    // 1,200 DA
    stopdesk_price: 70000, // 700 DA
  },
};

// Map each wilaya code to a zone
export const wilayaZoneMap: Record<string, number> = {
  // Zone 1 - Algiers
  '16': 1, // Alger

  // Zone 2 - Near Capital
  '09': 2, // Blida
  '35': 2, // Boumerdès
  '42': 2, // Tipaza
  '44': 2, // Ain Defla

  // Zone 3 - North (coastal & northern wilayas)
  '02': 3, // Chlef
  '06': 3, // Béjaïa
  '13': 3, // Tlemcen
  '15': 3, // Tizi Ouzou
  '18': 3, // Jijel
  '19': 3, // Sétif
  '21': 3, // Skikda
  '22': 3, // Sidi Bel Abbès
  '23': 3, // Annaba
  '24': 3, // Guelma
  '25': 3, // Constantine
  '26': 3, // Médéa
  '27': 3, // Mostaganem
  '29': 3, // Mascara
  '31': 3, // Oran
  '34': 3, // Bordj Bou Arréridj
  '36': 3, // El Tarf
  '38': 3, // Tissemsilt
  '41': 3, // Souk Ahras
  '43': 3, // Mila
  '46': 3, // Ain Témouchent
  '48': 3, // Relizane
  '10': 3, // Bouira

  // Zone 4 - Interior / Hauts Plateaux
  '04': 4, // Oum El Bouaghi
  '05': 4, // Batna
  '07': 4, // Biskra
  '12': 4, // Tébessa
  '14': 4, // Tiaret
  '17': 4, // Djelfa
  '20': 4, // Saïda
  '28': 4, // M'Sila
  '32': 4, // El Bayadh
  '40': 4, // Khenchela
  '45': 4, // Naâma
  '51': 4, // Ouled Djellal
  '59': 4, // Aflou
  '60': 4, // Aïn Oussera
  '61': 4, // Barika
  '62': 4, // Bir el-Ater
  '63': 4, // Bou Saâda
  '64': 4, // El Abiodh Sidi Cheikh
  '65': 4, // El Aricha
  '66': 4, // El Kantara
  '67': 4, // Ksar Chellala
  '68': 4, // Ksar El Boukhari
  '69': 4, // Messaad

  // Zone 5 - South
  '01': 5, // Adrar
  '03': 5, // Laghouat
  '08': 5, // Béchar
  '30': 5, // Ouargla
  '39': 5, // El Oued
  '47': 5, // Ghardaïa
  '49': 5, // El M'Ghair
  '50': 5, // El Meniaa
  '53': 5, // Béni Abbès
  '54': 5, // Timimoun
  '55': 5, // Touggourt
  '57': 5, // In Salah

  // Zone 6 - Far South
  '11': 6, // Tamanrasset
  '33': 6, // Illizi
  '37': 6, // Tindouf
  '52': 6, // Bordj Badji Mokhtar
  '56': 6, // Djanet
  '58': 6, // In Guezzam
};

/**
 * Get the delivery zone for a given wilaya code
 */
export function getWilayaZone(wilayaCode: string): number {
  return wilayaZoneMap[wilayaCode] || 4; // Default to zone 4 if not found
}

/**
 * Get the delivery price for a given wilaya code and delivery type
 * Returns price in centimes
 */
export function getDeliveryPrice(wilayaCode: string, deliveryType: DeliveryType): number {
  const zone = getWilayaZone(wilayaCode);
  const zoneData = deliveryZones[zone];
  if (!zoneData) return deliveryType === 'home' ? 70000 : 40000; // fallback
  return deliveryType === 'home' ? zoneData.home_price : zoneData.stopdesk_price;
}

/**
 * Get the delivery zone info for a given wilaya code
 */
export function getDeliveryZoneInfo(wilayaCode: string): DeliveryZone {
  const zone = getWilayaZone(wilayaCode);
  return deliveryZones[zone] || deliveryZones[4];
}

/**
 * Get delivery zone label based on locale
 */
export function getDeliveryZoneLabel(wilayaCode: string, locale: string): string {
  const zoneInfo = getDeliveryZoneInfo(wilayaCode);
  switch (locale) {
    case 'ar': return zoneInfo.label_ar;
    case 'en': return zoneInfo.label_en;
    default: return zoneInfo.label_fr;
  }
}

/**
 * Get the min and max delivery prices across all zones for display
 */
export function getDeliveryPriceRange(deliveryType: DeliveryType): { min: number; max: number } {
  const zones = Object.values(deliveryZones);
  const prices = zones.map(z => deliveryType === 'home' ? z.home_price : z.stopdesk_price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

/**
 * Get estimated delivery days based on zone
 */
export function getEstimatedDeliveryDays(wilayaCode: string): { min: number; max: number } {
  const zone = getWilayaZone(wilayaCode);
  switch (zone) {
    case 1: return { min: 1, max: 2 };
    case 2: return { min: 1, max: 3 };
    case 3: return { min: 2, max: 4 };
    case 4: return { min: 3, max: 5 };
    case 5: return { min: 4, max: 7 };
    case 6: return { min: 5, max: 10 };
    default: return { min: 3, max: 7 };
  }
}
