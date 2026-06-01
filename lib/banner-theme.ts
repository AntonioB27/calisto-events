export type BannerThemeId = 'aurora' | 'golden' | 'midnight' | 'rose' | 'emerald';

export type BannerTheme = Readonly<{
  id: BannerThemeId;
  name: string;
  gradient: string;
  pattern: string;
  patternSize?: string;
}>;

export const BANNER_THEMES: readonly BannerTheme[] = [
  {
    id: 'aurora',
    name: 'Aurora',
    gradient: 'linear-gradient(135deg,rgba(91,45,142,0.26),rgba(123,63,190,0.2))',
    pattern: 'repeating-linear-gradient(45deg,rgba(255,255,255,0.12) 0 2px,transparent 2px 12px)',
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    gradient: 'radial-gradient(ellipse 80% 70% at 72% 40%, rgba(197,146,42,0.5), rgba(230,179,75,0.2) 55%, transparent)',
    pattern: 'repeating-linear-gradient(135deg,rgba(255,255,255,0.07) 0 1px,transparent 1px 14px)',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    gradient: 'linear-gradient(135deg,rgba(10,20,60,0.68),rgba(25,45,110,0.52))',
    pattern: 'radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1px)',
    patternSize: '14px 14px',
  },
  {
    id: 'rose',
    name: 'Rose',
    gradient: 'linear-gradient(135deg,rgba(168,50,90,0.34),rgba(210,100,140,0.22))',
    pattern: 'repeating-linear-gradient(45deg,rgba(255,255,255,0.11) 0 2px,transparent 2px 12px)',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    gradient: 'linear-gradient(135deg,rgba(18,88,56,0.42),rgba(40,130,80,0.3))',
    pattern: 'repeating-linear-gradient(45deg,rgba(255,255,255,0.1) 0 2px,transparent 2px 12px)',
  },
] as const;

export function getBannerTheme(id: BannerThemeId): BannerTheme {
  return BANNER_THEMES.find(t => t.id === id) ?? BANNER_THEMES[0]!;
}

export function normalizeBannerTheme(value: string | null | undefined): BannerThemeId {
  const valid: BannerThemeId[] = ['aurora', 'golden', 'midnight', 'rose', 'emerald'];
  return valid.includes(value as BannerThemeId) ? (value as BannerThemeId) : 'aurora';
}
