export function buildSparklinePath(data, width = 64, height = 20, pad = 2) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((value, i) => ({
    x: pad + (i * (width - pad * 2)) / Math.max(data.length - 1, 1),
    y: height - pad - ((value - min) / range) * (height - pad * 2),
  }))
  let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1]
    const p1 = points[i]
    const midX = (p0.x + p1.x) / 2
    const midY = (p0.y + p1.y) / 2
    d += ` Q ${p0.x.toFixed(1)},${p0.y.toFixed(1)} ${midX.toFixed(1)},${midY.toFixed(1)}`
  }
  return d
}

export const barTheme = {
  cyan: {
    bar: "from-cyan-500 to-cyan-300",
    top: "text-cyan-400",
    iconWrap: "border-cyan-400/30 bg-cyan-500/15 shadow-cyan-500/20",
    iconText: "text-cyan-300",
    badge: "border-cyan-400/20 bg-cyan-500/10",
    badgeText: "text-cyan-300",
    glow: "bg-cyan-500/15",
    glowShadow: "shadow-cyan-500/30",
  },
  emerald: {
    bar: "from-emerald-500 to-emerald-300",
    top: "text-emerald-400",
    iconWrap: "border-emerald-400/30 bg-emerald-500/15 shadow-emerald-500/20",
    iconText: "text-emerald-300",
    badge: "border-emerald-400/20 bg-emerald-500/10",
    badgeText: "text-emerald-300",
    glow: "bg-emerald-500/15",
    glowShadow: "shadow-emerald-500/30",
  },
}

export const summaryTheme = {
  cyan: { wrap: "border-cyan-400/40 bg-cyan-400/15 shadow-cyan-500/20", text: "text-cyan-300", grad: "from-cyan-500/20 via-cyan-500/[0.06] to-transparent", glow: "bg-cyan-500/15" },
  emerald: { wrap: "border-emerald-400/40 bg-emerald-400/15 shadow-emerald-500/20", text: "text-emerald-300", grad: "from-emerald-500/20 via-emerald-500/[0.06] to-transparent", glow: "bg-emerald-500/15" },
  blue: { wrap: "border-blue-400/40 bg-blue-400/15 shadow-blue-500/20", text: "text-blue-300", grad: "from-blue-500/20 via-blue-500/[0.06] to-transparent", glow: "bg-blue-500/15" },
  amber: { wrap: "border-amber-400/40 bg-amber-400/15 shadow-amber-500/20", text: "text-amber-300", grad: "from-amber-500/20 via-amber-500/[0.06] to-transparent", glow: "bg-amber-500/15" },
}
