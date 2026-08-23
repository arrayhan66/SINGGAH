import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import AdminProjectsHero from "./AdminProjectsHero"
import AdminProjectsList from "./AdminProjectsList"
import { useProjects } from "../../../../context/ProjectContext"
import api from "../../../../services/api"

const VALID_STATUSES = ["all", "pending", "approved", "rejected"]

export default function ManageProjectsSection() {
  const { projects } = useProjects()

  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState("")
  const [categories, setCategories] = useState([])

  const statusParam = searchParams.get("status")
  const statusFilter = VALID_STATUSES.includes(statusParam) ? statusParam : "all"

  const catParam = searchParams.get("cat")
  const categoryFilter = catParam ?? "all"

  useEffect(() => {
    let cancelled = false
    api
      .get("/categories")
      .then((res) => {
        if (cancelled) return
        setCategories(res.data.data.items || res.data.data || [])
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Hitung jumlah project per kategori (semua status) untuk chip filter.
  const categoriesWithCount = useMemo(() => {
    const countByCatId = {}
    for (const p of projects) {
      const key = String(p.category_id ?? p.Category?.id ?? "")
      if (key) countByCatId[key] = (countByCatId[key] || 0) + 1
    }
    return {
      totalCount: projects.length,
      items: categories.map((c) => ({
        ...c,
        count: countByCatId[String(c.id)] || 0,
      })),
    }
  }, [categories, projects])

  const handleStatusChange = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value === "all") {
      next.delete("status")
    } else {
      next.set("status", value)
    }
    setSearchParams(next, { replace: true })
  }

  const handleCategoryChange = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value === "all") {
      next.delete("cat")
    } else {
      next.set("cat", value)
    }
    setSearchParams(next, { replace: true })
  }

  const stats = useMemo(() => {
    const total = projects.length
    const pending = projects.filter((p) => p.status === "pending").length
    const approved = projects.filter((p) => p.status === "approved").length
    const rejected = projects.filter((p) => p.status === "rejected").length
    return { total, pending, approved, rejected }
  }, [projects])

  return (
    <>
      <AdminProjectsHero
        stats={stats}
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        categories={categoriesWithCount}
        categoryFilter={categoryFilter}
        onCategoryChange={handleCategoryChange}
      />
      <AdminProjectsList
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        categoryFilter={categoryFilter}
      />
    </>
  )
}
