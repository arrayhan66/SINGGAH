import { useState, useEffect, useMemo } from "react"
import {
  Users,
  FolderKanban,
  Eye,
  ThumbsUp,
} from "lucide-react"
import api from "../services/api"

export default function useReports() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const currentYear = new Date().getFullYear()
  const [viewYear, setViewYear] = useState(currentYear)

  useEffect(() => {
    api
      .get("/reports", { params: { year: viewYear } })
      .then((res) => setReport(res.data.data))
      .catch((err) => {
        console.error("Failed to fetch report:", err)
        setReport(null)
      })
      .finally(() => setLoading(false))
  }, [viewYear])

  const monthlyData = useMemo(() => {
    if (!report) return []
    return report.monthly.map((m) => ({
      month: m.monthLabel,
      projects: m.projects || 0,
      likes: m.likes || 0,
      visitors: m.visitors || 0,
      users: m.users || 0,
    }))
  }, [report])

  const stats = useMemo(() => {
    if (!report) return []
    const pctChange = (current, previous) =>
      previous > 0
        ? ((current - previous) / previous) * 100
        : current > 0
          ? 100
          : 0
    const monthIdx = new Date().getMonth()
    const prevIdx = monthIdx === 0 ? 11 : monthIdx - 1

    const projectSeries = monthlyData.map((d) => d.projects)
    const visitorSeries = monthlyData.map((d) => d.visitors)
    const likeSeries = monthlyData.map((d) => d.likes)
    const userSeries = monthlyData.map((d) => d.users)

    const fmt = (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v)

    return [
      {
        label: "Total User",
        value: fmt(report.stats.totalUser || 0),
        icon: Users,
        color: "text-cyan-400",
        stroke: "#22d3ee",
        glow: "from-cyan-500/15",
        gradientId: "sparkCyan",
        spark: userSeries,
        trend: pctChange(userSeries[monthIdx], userSeries[prevIdx]),
      },
      {
        label: "Total Project",
        value: fmt(report.stats.totalProject || 0),
        icon: FolderKanban,
        color: "text-violet-400",
        stroke: "#a78bfa",
        glow: "from-violet-500/15",
        gradientId: "sparkViolet",
        spark: projectSeries,
        trend: pctChange(projectSeries[monthIdx], projectSeries[prevIdx]),
      },
      {
        label: "Total Pengunjung",
        value: fmt(report.stats.totalVisitors || 0),
        icon: Eye,
        color: "text-emerald-400",
        stroke: "#34d399",
        glow: "from-emerald-500/15",
        gradientId: "sparkEmerald",
        spark: visitorSeries,
        trend: pctChange(visitorSeries[monthIdx], visitorSeries[prevIdx]),
      },
      {
        label: "Total Like",
        value: fmt(report.stats.totalLikes || 0),
        icon: ThumbsUp,
        color: "text-rose-400",
        stroke: "#fb7185",
        glow: "from-rose-500/15",
        gradientId: "sparkRose",
        spark: likeSeries,
        trend: pctChange(likeSeries[monthIdx], likeSeries[prevIdx]),
      },
    ]
  }, [report, monthlyData])

  const summary = useMemo(
    () =>
      report
        ? report.summary
        : {
            avgProjects: 0,
            avgVisitors: 0,
            activeUsers: 0,
            newProjectsThisMonth: 0,
          },
    [report],
  )

  const years = []
  for (let y = currentYear; y >= 2026; y--) years.push(y)

  function handleYearChange(e) {
    setLoading(true)
    setViewYear(Number(e.target.value))
  }

  return {
    loading,
    viewYear,
    monthlyData,
    stats,
    summary,
    years,
    handleYearChange,
  }
}
