const DAY = 86400000;

export const toPercent = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.round(n <= 10 ? n * 10 : n);
};

export const scoreLabel = (s) =>
  s >= 83 ? "Excellent" : s >= 78 ? "Good" : s >= 70 ? "Fair" : "Needs Polish";

export const scoreTone = (s) =>
  s >= 80
    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
    : s >= 70
    ? "text-indigo-300 bg-indigo-500/10 border-indigo-500/30"
    : "text-amber-400 bg-amber-500/10 border-amber-500/30";

export const timeAgo = (ts) => {
  const d = Math.floor((Date.now() - ts) / DAY);
  return d <= 0 ? "Today" : d === 1 ? "Yesterday" : `${d} days ago`;
};