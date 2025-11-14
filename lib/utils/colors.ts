// Colores globales para proyectos, notas, tablas, etc.

export const COLOR_OPTIONS = [
  { value: "red", label: "Rojo", bg: "bg-red-500/15" },
  { value: "orange", label: "Naranja", bg: "bg-orange-500/15" },
  { value: "amber", label: "Ámbar", bg: "bg-amber-500/15" },
  { value: "yellow", label: "Amarillo", bg: "bg-yellow-500/15" },
  { value: "lime", label: "Lima", bg: "bg-lime-500/15" },
  { value: "green", label: "Verde", bg: "bg-green-500/15" },
  { value: "emerald", label: "Esmeralda", bg: "bg-emerald-500/15" },
  { value: "teal", label: "Turquesa", bg: "bg-teal-500/15" },
  { value: "cyan", label: "Cian", bg: "bg-cyan-500/15" },
  { value: "sky", label: "Celeste", bg: "bg-sky-500/15" },
  { value: "blue", label: "Azul", bg: "bg-blue-500/15" },
  { value: "indigo", label: "Índigo", bg: "bg-indigo-500/15" },
  { value: "violet", label: "Violeta", bg: "bg-violet-500/15" },
  { value: "purple", label: "Púrpura", bg: "bg-purple-500/15" },
  { value: "fuchsia", label: "Fucsia", bg: "bg-fuchsia-500/15" },
  { value: "pink", label: "Rosa", bg: "bg-pink-500/15" },
  { value: "rose", label: "Rosa fuerte", bg: "bg-rose-500/15" },
  { value: "neutral", label: "Neutral", bg: "bg-neutral-500/15" },
];

export const SOLID_COLOR_OPTIONS = [
  { value: "red", label: "Rojo", bg: "bg-red-500" },
  { value: "orange", label: "Naranja", bg: "bg-orange-500" },
  { value: "amber", label: "Ámbar", bg: "bg-amber-500" },
  { value: "yellow", label: "Amarillo", bg: "bg-yellow-500" },
  { value: "lime", label: "Lima", bg: "bg-lime-500" },
  { value: "green", label: "Verde", bg: "bg-green-500" },
  { value: "emerald", label: "Esmeralda", bg: "bg-emerald-500" },
  { value: "teal", label: "Turquesa", bg: "bg-teal-500" },
  { value: "cyan", label: "Cian", bg: "bg-cyan-500" },
  { value: "sky", label: "Celeste", bg: "bg-sky-500" },
  { value: "blue", label: "Azul", bg: "bg-blue-500" },
  { value: "indigo", label: "Índigo", bg: "bg-indigo-500" },
  { value: "violet", label: "Violeta", bg: "bg-violet-500" },
  { value: "purple", label: "Púrpura", bg: "bg-purple-500" },
  { value: "fuchsia", label: "Fucsia", bg: "bg-fuchsia-500" },
  { value: "pink", label: "Rosa", bg: "bg-pink-500" },
  { value: "rose", label: "Rosa fuerte", bg: "bg-rose-500" },
  { value: "neutral", label: "Neutral", bg: "bg-neutral-500" },
];

export const COLOR_CLASSES: Record<string, string> = {
  red: "bg-red-500 text-red-500",
  orange: "bg-orange-500 text-orange-500",
  amber: "bg-amber-500 text-amber-500",
  yellow: "bg-yellow-500 text-yellow-500",
  lime: "bg-lime-500 text-lime-500",
  green: "bg-green-500 text-green-500",
  emerald: "bg-emerald-500 text-emerald-500",
  teal: "bg-teal-500 text-teal-500",
  cyan: "bg-cyan-500 text-cyan-500",
  sky: "bg-sky-500 text-sky-500",
  blue: "bg-blue-500 text-blue-500",
  indigo: "bg-indigo-500 text-indigo-500",
  violet: "bg-violet-500 text-violet-500",
  purple: "bg-purple-500 text-purple-500",
  fuchsia: "bg-fuchsia-500 text-fuchsia-500",
  pink: "bg-pink-500 text-pink-500",
  rose: "bg-rose-500 text-rose-500",
  neutral: "bg-neutral-500 text-neutral-500",
};

export function getColorClasses(color: string): string {
  return COLOR_CLASSES[color] || COLOR_CLASSES["blue"];
}
