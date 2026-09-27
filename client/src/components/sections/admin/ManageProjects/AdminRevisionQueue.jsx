import { useEffect, useState } from "react"
import {
  GitPullRequestArrow,
  CheckCircle2,
  XCircle,
  Loader2,
  Inbox,
  Eye,
} from "lucide-react"
import api from "../../../../services/api"
import PopupToast from "../../../ui/PopupToast"

const formatDate = (value) => {
  if (!value) return "-"
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const norm = (v) => String(v ?? "").trim()

// Bandingkan nilai lama vs baru per field. Field yang nilainya sama disembunyikan
// supaya admin langsung melihat yang benar-benar berubah, bukan dua halaman teks
// yang isinya hampir identik.
function buildDiff(revision, current) {
  if (!revision?.payload) return []

  const p = revision.payload
  const rows = [
    { key: "title", label: "Judul", old: current?.title, next: p.title },
    {
      key: "description",
      label: "Deskripsi",
      old: current?.description,
      next: p.description,
      long: true,
    },
    {
      key: "category",
      label: "Kategori",
      old: current?.Category?.name,
      next: null,
      nextIsCategoryId: p.category_id,
    },
    { key: "year", label: "Tahun", old: current?.year, next: p.year },
  ]

  const listOf = (rows2) =>
    (rows2 || [])
      .map((x) => (typeof x === "string" ? x : x?.name || x?.label || ""))
      .filter(Boolean)
      .sort()
      .join(", ")

  rows.push({
    key: "technologies",
    label: "Teknologi",
    old: listOf(current?.technologies),
    next: listOf(p.relations?.technologies),
  })
  rows.push({
    key: "members",
    label: "Anggota tim",
    old: listOf(current?.members),
    next: listOf(p.relations?.members),
  })
  rows.push({
    key: "links",
    label: "Link eksternal",
    old: listOf(current?.links),
    next: listOf(p.relations?.links),
  })
  rows.push({
    key: "videos",
    label: "Video",
    old: (current?.videos || [])[0]?.video_url || "",
    next: (p.relations?.videos || [])[0]?.video_url || "",
    long: true,
  })
  rows.push({
    key: "thumbnail",
    label: "Thumbnail",
    old: current?.thumbnail,
    next: p.thumbnail,
    isImage: true,
  })
  rows.push({
    key: "images",
    label: "Galeri",
    old: `${(current?.images || []).length} gambar`,
    next: `${(p.images || []).length} gambar baru${
      (p.removedImages || []).length ? `, ${p.removedImages.length} dihapus` : ""
    }`,
  })
  rows.push({
    key: "documents",
    label: "Dokumen",
    old: `${(current?.documents || []).length} dokumen`,
    next: `${(p.documents || []).length} baru${
      (p.removedDocuments || []).length ? `, ${p.removedDocuments.length} dihapus` : ""
    }`,
  })

  return rows.filter((row) => {
    if (row.nextIsCategoryId) return String(row.nextIsCategoryId) !== String(current?.category_id ?? "")
    if (row.isImage) return Boolean(row.next) && row.next !== row.old
    return norm(row.old) !== norm(row.next)
  })
}

function DiffRow({ row }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
        {row.label}
      </p>
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        <div className="rounded-lg bg-red-500/10 p-2.5">
          <p className="text-[10px] font-medium text-red-300">Saat ini (tayang)</p>
          {row.isImage ? (
            row.old ? (
              <img
                src={row.old}
                alt="Thumbnail lama"
                className="mt-1.5 h-24 w-full rounded-md object-cover"
              />
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">-</p>
            )
          ) : (
            <p className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed text-slate-300 custom-scrollbar">
              {norm(row.old) || "-"}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-emerald-500/10 p-2.5">
          <p className="text-[10px] font-medium text-emerald-300">Diajukan mahasiswa</p>
          {row.isImage ? (
            row.next ? (
              <img
                src={row.next}
                alt="Thumbnail baru"
                className="mt-1.5 h-24 w-full rounded-md object-cover"
              />
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">-</p>
            )
          ) : (
            <p className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed text-slate-300 custom-scrollbar">
              {norm(row.next) || "-"}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function RevisionDetailModal({ target, initialMode = "", onClose, onApproved, onRejected }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [note, setNote] = useState("")
  const [reason, setReason] = useState("")
  const [mode, setMode] = useState("")

  useEffect(() => {
    setMode(initialMode)
  }, [target, initialMode])

  if (!target) return null

  const { revision, current, categoryName } = target
  const diff = buildDiff(revision, current)

  async function act(fn, after) {
    setBusy(true)
    setError("")
    try {
      await fn()
      after()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memproses revisi.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <PopupToast show={!!target} variant="info" onClose={onClose} position="center">
      <div className="max-h-[85vh] overflow-y-auto px-4 py-3.5 custom-scrollbar">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/20">
            <GitPullRequestArrow className="h-4.5 w-4.5 text-cyan-300" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="pt-1 text-sm font-semibold text-white">
              Verifikasi Perubahan Karya
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Diajukan oleh{" "}
              <span className="font-medium text-slate-200">
                {revision.User?.name || "Mahasiswa"}
              </span>{" "}
              · {formatDate(revision.created_at)}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Karya asal
          </p>
          <p className="mt-1 text-xs font-medium text-slate-200">
            {current?.title}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Status sekarang: {current?.status} · Kategori: {categoryName}
          </p>
        </div>

        {diff.length === 0 ? (
          <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
            Tidak ada perbedaan yang terdeteksi. Kalau ini tidak disengaja,
            sebaiknya tolak.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {diff.map((row) => (
              <DiffRow key={row.key} row={row} />
            ))}
          </div>
        )}

        {error && (
          <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
            {error}
          </p>
        )}

        {!mode && (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setMode("reject")}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10"
            >
              <XCircle className="h-3.5 w-3.5" /> Tolak
            </button>
            <button
              type="button"
              onClick={() => setMode("approve")}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Setujui
            </button>
          </div>
        )}

        {mode === "approve" && (
          <div className="mt-4">
            <p className="text-[11px] text-slate-400">
              Perubahan akan langsung menimpa karya yang tayang.
            </p>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              placeholder="Catatan untuk mahasiswa (opsional)"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-400/50 focus:outline-none"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setMode("")}
                className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  act(
                    () =>
                      api.patch(`/projects/revisions/${revision.id}/approve`, { note }),
                    onApproved,
                  )
                }
                className="flex flex-1 cursor-pointer rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                {busy ? "Menyetujui..." : "Ya, Setujui"}
              </button>
            </div>
          </div>
        )}

        {mode === "reject" && (
          <div className="mt-4">
            <p className="text-[11px] text-slate-400">
              Alasan wajib diisi supaya mahasiswa tahu apa yang harus diperbaiki.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Alasan penolakan..."
              className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-red-400/50 focus:outline-none"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setMode("")}
                className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={busy || !reason.trim()}
                onClick={() =>
                  act(
                    () =>
                      api.patch(`/projects/revisions/${revision.id}/reject`, {
                        reason: reason.trim(),
                      }),
                    onRejected,
                  )
                }
                className="flex-1 cursor-pointer rounded-xl bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "Menolak..." : "Kirim Penolakan"}
              </button>
            </div>
          </div>
        )}
      </div>
    </PopupToast>
  )
}

export default function AdminRevisionQueue({ onChanged }) {
  const [revisions, setRevisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expanded, setExpanded] = useState(null)
  const [target, setTarget] = useState(null)
  const [presetMode, setPresetMode] = useState("")
  const [toast, setToast] = useState(null)
  const [actingId, setActingId] = useState(null)

  async function load() {
    setLoading(true)
    setError("")
    try {
      const res = await api.get("/projects/revisions", {
        params: { status: "pending", limit: 50 },
      })
      setRevisions(res.data?.data?.revisions || [])
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat daftar revisi.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function openDetail(revision, mode = "") {
    setPresetMode(mode)
    setExpanded(revision.id)
    try {
      const res = await api.get(`/projects/revisions/${revision.id}`)
      const data = res.data?.data || {}
      const current = data.current
      const p = data.revision?.payload

      let categoryName = current?.Category?.name || "-"
      if (p?.category_id) {
        try {
          const catRes = await api.get("/categories")
          const cats = catRes.data?.data?.items || catRes.data?.data || []
          categoryName =
            cats.find((c) => String(c.id) === String(p.category_id))?.name ||
            categoryName
        } catch {
          /* biarkan nilai sebelumnya */
        }
      }

      setTarget({
        revision: data.revision,
        current,
        categoryName,
      })
    } catch (err) {
      setToast({
        variant: "danger",
        message: err.response?.data?.message || "Gagal memuat detail revisi.",
      })
    } finally {
      setExpanded(null)
    }
  }

  // Setujui tanpa membuka modal: admin sering cuma ganti judul/deskripsi dan
  // tidak perlu lihat diff dulu. Perubahan baru tayang setelah diproses di sini.
  async function quickApprove(revision) {
    setActingId(revision.id)
    try {
      await api.patch(`/projects/revisions/${revision.id}/approve`, {})
      setToast({ variant: "success", message: "Perubahan disetujui dan karya sudah tayang" })
      load()
      onChanged?.()
    } catch (err) {
      setToast({
        variant: "danger",
        message: err.response?.data?.message || "Gagal menyetujui perubahan.",
      })
    } finally {
      setActingId(null)
    }
  }

  function afterAction(message) {
    setToast({ variant: "success", message })
    load()
    onChanged?.()
  }

  return (
    <div className="px-4 pb-16 md:px-8 lg:px-12 2xl:px-16 3xl:px-20 4xl:px-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/5 px-4 py-3">
          <GitPullRequestArrow className="h-4 w-4 shrink-0 text-cyan-300" />
          <p className="text-xs leading-relaxed text-slate-300">
            Perubahan dari mahasiswa pada karya yang{" "}
            <span className="font-medium text-cyan-300">sudah tayang</span>.
            Karya asli tetap terlihat publik sampai kamu setujui di sini.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Memuat antrean revisi...</span>
          </div>
        ) : error ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
            {error}
          </p>
        ) : revisions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Inbox className="h-8 w-8 text-slate-600" />
            <p className="text-sm font-medium text-slate-300">
              Tidak ada perubahan yang menunggu verifikasi
            </p>
            <p className="text-xs text-slate-500">
              Semua pengubahan edit karya sudah diproses.
            </p>
          </div>
        ) : (
          revisions.map((revision) => {
            const project = revision.Project
            const acting = actingId === revision.id
            return (
              <div
                key={revision.id}
                className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.07] md:flex-row md:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {project?.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-white/5" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {revision.payload?.title || project?.title}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-400">
                      {revision.User?.name} · {formatDate(revision.created_at)}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      Versi tayang: {project?.title}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => openDetail(revision)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 disabled:opacity-50 md:flex-none"
                  >
                    {expanded === revision.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                    Periksa
                  </button>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => quickApprove(revision)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/25 transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none"
                  >
                    {acting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    Setujui
                  </button>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => openDetail(revision, "reject")}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Tolak
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      <RevisionDetailModal
        target={target}
        initialMode={presetMode}
        onClose={() => {
          setTarget(null)
          setPresetMode("")
        }}
        onApproved={() => afterAction("Perubahan disetujui dan karya sudah tayang")}
        onRejected={() => afterAction("Perubahan ditolak")}
      />

      <PopupToast
        show={!!toast}
        variant={toast?.variant || "success"}
        message={toast?.message}
        onClose={() => setToast(null)}
        position="top-right"
      />
    </div>
  )
}
