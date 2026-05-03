export const PALETTE = [
  "#C8102E", // Brand red   (primary)
  "#007A3D", // Brand green (secondary)
  "#2563EB",
  "#D97706",
  "#7C3AED",
  "#0891B2",
  "#DB2777",
  "#65A30D",
];

export const colorFor = (i: number): string => PALETTE[i % PALETTE.length];
