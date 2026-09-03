import { useState, useMemo, useEffect } from "react"
import GlowBackground from "../../../ui/GlowBackground"
import DustBackground from "../../../ui/DustBackground"
import MyKaryaHero from "./MyKaryaHero"
import MyKaryaStats from "./MyKaryaStats"
import MyKaryaFilter from "./MyKaryaFilter"
import MyKaryaCard from "./MyKaryaCard"
import MyKaryaDeleteModal from "./MyKaryaDeleteModal"
import { FolderX, CheckCircle2 } from "lucide-react"
import OutlineButton from "../../../ui/OutlineButton"
import { MyKaryaPageSkeleton } from "../../../ui/PageSkeletons"
import { useAuth } from "../../../../context/AuthContext"
import PopupToast from "../../../ui/PopupToast"
import api from "../../../../services/api"

const INITIAL_VISIBLE_COUNT = 6

function MyKaryaSection() {
  const { user } = useAuth()
  const isDosen = user?.tipe === "dosen"

  const [karya, setKarya] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAll, setShowAll] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteSuccessTitle, setDeleteSuccessTitle] = useState(null)

  useEffect(() => {
    api.get("/projects/my")
      .then((res) => {
        const data = res.data.data || {}
        setKarya(Array.isArray(data.items) ? data.items : [])
      })
      .catch((err) => {
        console.error("Failed to fetch my projects:", err)
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredData = useMemo(() => {
    return karya.filter((k) => {
      const matchStatus = statusFilter === "all" || k.status === statusFilter
      const matchSearch = (k.title || "").toLowerCase().includes(search.toLowerCase())
      return matchStatus && matchSearch
    })
  }, [karya, statusFilter, search])

  const visibleData = showAll
    ? filteredData
    : filteredData.slice(0, INITIAL_VISIBLE_COUNT)

  const stats = useMemo(() => ({
    total: karya.length,
    pending: isDosen ? 0 : karya.filter((k) => k.status === "pending").length,
    published: karya.filter((k) => k.status === "published").length,
    rejected: isDosen ? 0 : karya.filter((k) => k.status === "rejected").length,
  }), [karya, isDosen])

  function handleSearchChange(value) {
    setSearch(value)
    setShowAll(false)
  }

  function handleStatusChange(value) {
    setStatusFilter(value)
    setShowAll(false)
  }

  function handleDeleteClick(karyaItem) {
    setDeleteTarget(karyaItem)
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return
    const deletedTitle = deleteTarget.title
    api.delete(`/projects/${deleteTarget.id}`)
      .then(() => {
        setKarya((prev) => prev.filter((k) => k.id !== deleteTarget.id))
        setDeleteSuccessTitle(deletedTitle)
        setTimeout(() => setDeleteSuccessTitle(null), 3000)
      })
      .catch((err) => {
        console.error("Failed to delete project:", err)
      })
      .finally(() => setDeleteTarget(null))
  }

  function handleCancelDelete() {
    setDeleteTarget(null)
  }

  return (
    <>
      <section className="relative overflow-hidden bg-brand-dark px-4 pt-[calc(var(--navbar-h)+24px)] pb-6 sm:px-6 sm:pt-[calc(var(--navbar-h)+32px)] sm:pb-8 md:px-8 lg:px-12 2xl:px-16 2xl:pb-10 3xl:px-20 3xl:pb-12 4xl:px-24 4xl:pb-14">
        <GlowBackground />

        <div className="relative z-10 mx-auto max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1800px] 4xl:max-w-[2200px]">
          <MyKaryaHero />
          <MyKaryaStats stats={stats} isDosen={isDosen} />
        </div>
      </section>

      <section
        id="my-karya"
        className="relative overflow-hidden bg-brand-dark pb-6 sm:pb-10 lg:pb-12 3xl:pb-16 4xl:pb-20"
      >
        <DustBackground />

        <div className="mx-auto max-w-7xl px-5 sm:px-8 relative 2xl:max-w-[1440px] 2xl:px-12 3xl:max-w-[1800px] 3xl:px-16 4xl:max-w-[2200px] 4xl:px-20">
          {loading ? (
            <MyKaryaPageSkeleton />
          ) : (
            <>
              <div className="mt-4 2xl:mt-6 3xl:mt-8 4xl:mt-10">
                <MyKaryaFilter
                  search={search}
                  onSearchChange={handleSearchChange}
                  statusFilter={statusFilter}
                  onStatusChange={handleStatusChange}
                  isDosen={isDosen}
                />
              </div>

              {filteredData.length === 0 ? (
                <div className="mt-14 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 bg-slate-800/20 py-16 sm:mt-20 sm:py-24 2xl:mt-24 2xl:py-32 3xl:mt-28 3xl:py-40 4xl:mt-32 4xl:py-48">
                  <div className="mb-5 rounded-full bg-slate-800/50 p-4 ring-1 ring-slate-700/50 backdrop-blur-sm 3xl:p-6 4xl:p-8">
                    <FolderX className="h-10 w-10 text-slate-400 2xl:h-12 2xl:w-12 3xl:h-14 3xl:w-14 4xl:h-16 4xl:w-16" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-200 2xl:text-2xl 3xl:text-3xl 4xl:text-4xl">
                    Belum ada karya
                  </h3>
                  <p className="mt-2 max-w-md text-center text-sm text-slate-400 sm:text-base 2xl:mt-3 2xl:text-lg 3xl:text-xl 4xl:text-2xl">
                    Kamu belum memiliki karya. Mulai upload karya pertamamu sekarang!
                  </p>
                </div>
              ) : (
                <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3 2xl:mt-20 2xl:gap-10 3xl:mt-24 3xl:gap-12 4xl:mt-28 4xl:gap-14">
                  {visibleData.map((karyaItem) => (
                    <MyKaryaCard
                      key={karyaItem.id}
                      karya={karyaItem}
                      onDeleteClick={handleDeleteClick}
                      isDosen={isDosen}
                    />
                  ))}
                </div>
              )}

              {!showAll && visibleData.length < filteredData.length && (
                <div className="mt-6 flex justify-center sm:mt-8 2xl:mt-12 3xl:mt-16 4xl:mt-20">
                  <OutlineButton onClick={() => setShowAll(true)}>
                    Tampilkan Semua
                  </OutlineButton>
                </div>
              )}
            </>
          )}
        </div>

        <MyKaryaDeleteModal
          karya={deleteTarget}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />

        <PopupToast show={!!deleteSuccessTitle} variant="success" onClose={() => setDeleteSuccessTitle(null)}>
          <div className="px-4 py-3.5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="pt-1 text-sm font-semibold text-emerald-300">Berhasil Dihapus</h3>
                <p className="mt-0.5 text-xs text-emerald-300/80 min-w-0 break-words">
                  "{deleteSuccessTitle}" berhasil dihapus dari daftar karya.
                </p>
              </div>
            </div>
          </div>
        </PopupToast>
      </section>
    </>
  )
}

export default MyKaryaSection
