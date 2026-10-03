// src/utils/theme.ts
// Ligne directrice unique de l'interface (Design System minimaliste et tactile)

export const UI = {
  // Conteneurs et cartes globaux
  tab: "h-full flex flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700",
  cardInteractiveFull: "bg-slate-900 border border-slate-800/80 rounded-2xl p-2 space-y-2 shadow-lg shrink-0",
  cardInteractiveRelative: "bg-slate-900 border border-slate-800/80 rounded-2xl p-2 relative",
  btnCardInteractiveOpen: "w-full flex items-center justify-between text-left cursor-pointer group",
  inputText: "w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 font-medium",
  textarea: "w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-blue-500 font-medium resize-none leading-relaxed",
  label: "text-slate-400 block mb-1"
};