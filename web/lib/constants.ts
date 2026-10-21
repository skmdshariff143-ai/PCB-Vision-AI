export const DEFECT_CLASSES = [
  "open",
  "short",
  "mousebite",
  "spur",
  "copper",
  "pin-hole",
] as const;

export type DefectClassName = (typeof DEFECT_CLASSES)[number];

export const DEFECT_COLORS: Record<string, string> = {
  open: "#ef4444",      // Vibrant Red
  short: "#f97316",     // Orange
  mousebite: "#eab308", // Yellow
  spur: "#a855f7",      // Purple
  copper: "#06b6d4",    // Cyan
  "pin-hole": "#22c55e" // Emerald Green
};
