import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { CheckCircle2, GitPullRequestArrow } from "lucide-react"
import AdminProjectsHero from "./AdminProjectsHero"
import AdminProjectsList from "./AdminProjectsList"
import AdminRevisionQueue from "./AdminRevisionQueue"
import { useProjects } from "../../../../context/ProjectContext"
import { AdminProjectsSkeleton } from "../../../ui/PageSkeletons"
import api from "../../../../services/api"

const VALID_STATUSES = [
  "all",
  "pending",
  "revisions",
  "published",
  "rejected",
  "slideshow",
]

export default function ManageProjectsSection() {
  const { projects, loading, refreshProjects } = useProjects()

  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState("")
  const [categories, setCategories] = useState([])
  const [revisionCount, setRevisionCount] = useState(0)

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

  // Badge dan isi tab harus ikut segar setelah admin menyetujui/menolak,
  // kalau tidak tabnya masih menampilkan antrean yang sudah habis.
  const fetchRevisionCount = useCallback(() => {
    api
      .get("/projects/revisions", { params: { status: "pending", limit: 1 } })
      .then((res) => setRevisionCount(res.data?.data?.total ?? 0))
      .catch(() => {
        // Badge tidak muncul kalau endpoint gagal; tab tetap bisa dibuka.
      })
  }, [])

  useEffect(() => {
    fetchRevisionCount()
  }, [fetchRevisionCount])

  const handleRevisionChange = () => {
    fetchRevisionCount()
    refreshProjects()
  }

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
    const published = projects.filter((p) => p.status === "published").length
    const rejected = projects.filter((p) => p.status === "rejected").length
    const slideshow = projects.filter((p) => p.is_shown_in_slideshow).length
    return { total, pending, published, rejected, slideshow, revisions: revisionCount }
  }, [projects, revisionCount])

  return (
    <>
      {/* Pintu masuk persetujuan yang tidak bisa terlewat: sebelumnya approval
          hanya tersembunyi di dalam satu tab, jadi admin tidak pernah melihat
          tombolnya walau antrean sudah menunggu. */}
      {revisionCount > 0 && statusFilter !== "revisions" && (
        <div className="px-4 pt-4 md:px-8 lg:px-12 2xl:px-16 3xl:px-20 4xl:px-24">
          <button
            type="button"
            onClick={() => handleStatusChange("revisions")}
            className="mx-auto flex w-full max-w-6xl cursor-pointer items-center gap-3 rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-transparent px-4 py-3.5 text-left transition-all hover:border-cyan-300/60 hover:from-cyan-500/30 hover:via-blue-500/20"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/25">
              <GitPullRequestArrow className="h-5 w-5 text-cyan-200" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-white">
                {revisionCount} perubahan karya menunggu persetujuan
              </span>
              <span className="mt-0.5 block text-xs text-slate-300">
                Karya mahasiswa yang sudah tayang tidak berubah sampai kamu setujui
                di sini.
              </span>
            </span>
            <span className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-cyan-950 sm:flex">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Tinjau &amp; Setujui
            </span>
          </button>
        </div>
      )}

      {loading && projects.length === 0 ? (
        <AdminProjectsSkeleton />
      ) : (
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
          {/* Tab "Perubahan Karya" bukan filter status karya: daftar karya tidak
              punya status "revisions", jadi merender AdminProjectsList di sini
              hanya menghasilkan empty state dan.antrean persetujuan jadi tenggelam
              di bawahnya. Tampilkan antrean saja. */}
          {statusFilter !== "revisions" && (
            <AdminProjectsList
              search={search}
              onSearchChange={(e) => setSearch(e.target.value)}
              statusFilter={statusFilter}
              onStatusChange={handleStatusChange}
              categoryFilter={categoryFilter}
            />
          )}
        </>
      )}

      {statusFilter === "revisions" && (
        <AdminRevisionQueue onChanged={handleRevisionChange} />
      )}
    </>
  )
}
