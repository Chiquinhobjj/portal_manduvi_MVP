export type MediaPreset = {
  folder: string;
  label: string;
  recommendedWidth: number;
  recommendedHeight: number;
  targetComponent: string;
  targetLocation: string;
  notes?: string;
};

export const mediaPresets: MediaPreset[] = [
  {
    folder: 'ads_leaderboard',
    label: 'Topo do Site (Leaderboard)',
    recommendedWidth: 970,
    recommendedHeight: 120,
    targetComponent: 'SmartAdCarousel',
    targetLocation: 'Layout.tsx → SITE-TOPO',
    notes: 'Formato clássico 970x120. PNG/JPG.
    ',
  },
  {
    folder: 'banners',
    label: 'Home – Carrossel de Banners',
    recommendedWidth: 1200,
    recommendedHeight: 400,
    targetComponent: 'BannerCarousel',
    targetLocation: 'HomePage.tsx',
    notes: 'Imagens horizontais, foco em texto legível.',
  },
  {
    folder: 'ads_mpu',
    label: 'MPU (300x250)',
    recommendedWidth: 300,
    recommendedHeight: 250,
    targetComponent: 'AdSlot',
    targetLocation: 'Slots em páginas de notícias/serviços/dados',
  },
  {
    folder: 'ads_halfpage',
    label: 'Half Page (300x600)',
    recommendedWidth: 300,
    recommendedHeight: 600,
    targetComponent: 'AdSlot',
    targetLocation: 'Slots laterais',
  },
  {
    folder: 'ads_incontent',
    label: 'In-Content (300x250)',
    recommendedWidth: 300,
    recommendedHeight: 250,
    targetComponent: 'AdSlot',
    targetLocation: 'Entre blocos de conteúdo',
  },
];

export function getPresetByFolder(folder: string): MediaPreset | undefined {
  return mediaPresets.find((p) => p.folder === folder);
}