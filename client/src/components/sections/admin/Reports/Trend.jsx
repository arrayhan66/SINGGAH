import { TrendingUp, TrendingDown } from "lucide-react"

export default function Trend({ value }) {
  const isUp = value >= 0
  const TrendIcon = isUp ? TrendingUp : TrendingDown
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${
        isUp ? "text-emerald-400" : "text-rose-400"
      }`}
    >
      <TrendIcon size={13} strokeWidth={2.5} />
      {isUp ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  )
}
