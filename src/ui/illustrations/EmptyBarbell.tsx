/** An empty bar on the floor and one plate standing next to it: "nothing loaded yet". */
export function EmptyBarbell() {
  return (
    <svg viewBox="0 0 200 90" aria-hidden className="w-full">
      <line x1="0" y1="84" x2="200" y2="84" stroke="var(--line)" strokeWidth="2" />
      {/* Bar lying on the floor, sleeves at both ends. */}
      <rect x="6" y="76" width="122" height="5" rx="1" fill="var(--line-strong)" />
      <rect x="30" y="71" width="7" height="13" rx="1" fill="var(--text-muted)" />
      <rect x="97" y="71" width="7" height="13" rx="1" fill="var(--text-muted)" />
      {/* One plate standing upright, waiting. */}
      <circle cx="162" cy="50" r="33" fill="var(--plate-yellow)" />
      <circle cx="162" cy="50" r="24" fill="none" stroke="var(--on-accent)" strokeOpacity="0.2" />
      <circle cx="162" cy="50" r="6" fill="var(--bg)" />
    </svg>
  )
}
