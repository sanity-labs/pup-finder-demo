export const DOG_COLORS = [
  "#FF6B6B", // coral red
  "#4ECDC4", // teal
  "#E8A317", // marigold
  "#A8E6CF", // mint green
  "#FF8B94", // salmon pink
  "#B8F3FF", // sky blue
  "#DDA0FF", // lavender
  "#FFB347", // tangerine
  "#98D8C8", // seafoam
  "#F7DC6F", // gold
  "#BB8FCE", // purple
  "#85C1E9", // cornflower
];

export function getDogColor(index: number): string {
  return DOG_COLORS[index % DOG_COLORS.length];
}
