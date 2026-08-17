import { useMemo } from "react"
import { buildSparklinePath } from "../../../../utils/reportsHelpers"

export default function Sparkline({ data, stroke, gradientId }) {
  const path = useMemo(() => {
    if (!Array.isArray(data) || data.length < 2) return null
    return buildSparklinePath(data)
  }, [data])
  if (!path) return null
  return (
    <svg className="h-5 w-16 shrink-0" viewBox="0 0 64 20" fill="none">
      <path
        d={path}
        pathLength={100}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-spark-draw"
      />
      <path
        d={`${path} L 64,20 L 0,20 Z`}
        fill={`url(#${gradientId})`}
        className="animate-spark-fill"
      />
    </svg>
  )
}
