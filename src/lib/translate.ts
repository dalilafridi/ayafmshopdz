export type Lang = 'fr' | 'en' | 'ar';

export function translate(
  value: any,
  lang: Lang = 'fr'
): string {
  if (!value) return '';

  // If it's already a string
  if (typeof value === 'string') return value;

  // If it's a JSON object
  if (typeof value === 'object') {
    // Support both { fr, en, ar } format
    if (value[lang]) return value[lang];
    if (value.fr) return value.fr;
    if (value.en) return value.en;
    if (value.ar) return value.ar;

    // Support legacy format like { desc_fr, title_fr }
    if (value[`title_${lang}`]) return value[`title_${lang}`];
    if (value[`desc_${lang}`]) return value[`desc_${lang}`];

    if (value.title_fr) return value.title_fr;
    if (value.desc_fr) return value.desc_fr;
  }

  return '';
}