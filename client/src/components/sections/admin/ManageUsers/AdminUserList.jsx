import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { UserSearch, BadgeCheck, FolderKanban, ShieldCheck, ShieldX, Hourglass, Pencil, Trash2, Eye } from "lucide-react"
import { useUsers } from "../../../../context/UserContext"
import AdminUserDeleteModal from "./AdminUserDeleteModal"
import AdminUserTipeModal from "./AdminUserTipeModal"
import ShowMoreButton from "../../../ui/ShowMoreButton"
import UserAvatar from "../../../ui/UserAvatar"

const INITIAL_VISIBLE = 10

const tipeConfig = {
  mahasiswa: { label: "Mahasiswa", color: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300" },
  dosen: { label: "Dosen", color: "border-blue-400/20 bg-blue-400/10 text-blue-300" },
  admin: { label: "Admin", color: "border-purple-400/20 bg-purple-400/10 text-purple-300" },
  umum: { label: "Umum", color: "border-slate-400/20 bg-slate-400/10 text-slate-300" },
}

const pendingTipeLabel = {
  mahasiswa: "Mahasiswa",
  dosen: "Dosen",
}

function AdminUserList({ search, statusFilter }) {
  const navigate = useNavigate()
  const { userList, deleteUser, approveTipe, rejectTipe } = useUsers()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const [tipeTarget, setTipeTarget] = useState(null)
  const [tipeDecision, setTipeDecision] = useState(null)
  const [approving, setApproving] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const filterKey = `${search}|${statusFilter}`
  const [activeFilter, setActiveFilter] = useState(filterKey)
  if (filterKey !== activeFilter) {
    setActiveFilter(filterKey)
    setShowAll(false)
  }

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase()
    return userList.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(keyword) ||
        u.email.toLowerCase().includes(keyword) ||
        u.username.toLowerCase().includes(keyword)
      const matchStatus = statusFilter === "all" || u.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [userList, search, statusFilter])

  const visibleUsers = showAll ? filteredUsers : filteredUsers.slice(0, INITIAL_VISIBLE)

  function handleEditClick(user) {
    navigate(`/users/edit/${user.username}`)
  }

  function handleDetailClick(user) {
    navigate(`/users/${user.username}`)
  }

  function handleDeleteClick(user) {
    setDeleteTarget(user)
  }

  async function handleConfirmDelete() {
    if (deleteLoading) return
    setDeleteLoading(true)
    try {
      await deleteUser(deleteTarget.id)
      setDeleteLoading(false)
      setDeleteSuccess(true)
    } catch {
      setDeleteLoading(false)
      setDeleteTarget(null)
    }
  }

  function handleCancelDelete() {
    setDeleteTarget(null)
    setDeleteLoading(false)
    setDeleteSuccess(false)
  }

  function handleApproveClick(user) {
    setTipeTarget(user)
    setTipeDecision("approve")
  }

  function handleRejectClick(user) {
    setTipeTarget(user)
    setTipeDecision("reject")
  }

  function handleCancelTipe() {
    setTipeTarget(null)
    setTipeDecision(null)
  }

  async function handleConfirmTipe(reason) {
    if (!tipeTarget) return
    setApproving(true)
    try {
      if (tipeDecision === "approve") {
        await approveTipe(tipeTarget.id)
      } else {
        await rejectTipe(tipeTarget.id, reason)
      }
      setTipeTarget(null)
      setTipeDecision(null)
    } catch (err) {
      console.error("Gagal memproses verifikasi tipe:", err)
    } finally {
      setApproving(false)
    }
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 pt-4 pb-12">
      <div className="flex flex-col gap-5">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] py-20 text-center backdrop-blur-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-500/20 bg-slate-500/10">
              <UserSearch className="h-7 w-7 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">
                Tidak ada user yang cocok
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Coba ubah kata kunci pencarian kamu.
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredUsers.length} dari {userList.length} user
            </p>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.03]">
                      <th className="px-4 py-3.5 font-medium text-slate-400">User</th>
                      <th className="px-4 py-3.5 font-medium text-slate-400">Tipe</th>
                      <th className="px-4 py-3.5 font-medium text-slate-400">Status</th>
                      <th className="px-4 py-3.5 font-medium text-slate-400">Project</th>
                      <th className="px-4 py-3.5 font-medium text-slate-400 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleUsers.map((user, i) => {
                      const tipe = tipeConfig[user.tipe] || tipeConfig.umum
                      const isPending = Boolean(user.pending_tipe)
                      const pendingLabel = pendingTipeLabel[user.pending_tipe] || "Tipe Baru"

                      return (
                        <tr
                          key={user.id}
                          className="border-b border-white/5 transition-colors hover:bg-white/[0.04] last:border-0 animate-fade-in-up"
                          style={{ animationDelay: `${i * 20}ms` }}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="relative shrink-0">
                                <UserAvatar
                                  name={user.name}
                                  avatar={user.avatar}
                                  imgSizeClass="h-11 w-11 border border-white/10"
                                  imgClass="rounded-xl"
                                  fallbackSizeClass="h-11 w-11"
                                  fallbackClass="bg-gradient-to-br from-cyan-500 to-blue-700 font-bold text-white border border-white/10"
                                  textClass="text-sm"
                                />
                                {isPending ? (
                                  <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 shadow">
                                    <Hourglass className="h-2.5 w-2.5 text-white" />
                                  </div>
                                ) : (
                                  user.is_verified && (
                                    <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 shadow">
                                      <BadgeCheck className="h-3 w-3 text-white" />
                                    </div>
                                  )
                                )}
                              </div>
                              <div className="min-w-0 max-w-[280px]">
                                <p
                                  className="truncate text-sm font-semibold text-white cursor-pointer hover:text-cyan-300 transition-colors"
                                  onClick={() => handleDetailClick(user)}
                                >
                                  {user.name}
                                </p>
                                <p className="truncate text-xs text-slate-400">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`rounded-md border px-2.5 py-1 text-xs font-medium ${tipe.color}`}>
                                {user.tipe}
                              </span>
                              {isPending && (
                                <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                                  <Hourglass className="h-3 w-3" />
                                  Verifikasi {pendingLabel}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                                user.status === "Aktif"
                                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                  : "border-red-400/20 bg-red-400/10 text-red-300"
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-300">
                            <span className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-slate-300">
                              <FolderKanban className="h-3 w-3 text-cyan-400" />
                              {user.projectCount ?? 0} Project
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPending ? (
                                <>
                                  <button
                                    onClick={() => handleApproveClick(user)}
                                    disabled={approving}
                                    className="flex cursor-pointer items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] px-2.5 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/15 disabled:opacity-60"
                                    title="Setujui Tipe"
                                  >
                                    <ShieldCheck size={14} />
                                    <span>Setujui</span>
                                  </button>
                                  <button
                                    onClick={() => handleRejectClick(user)}
                                    disabled={approving}
                                    className="flex cursor-pointer items-center gap-1 rounded-lg border border-red-500/25 bg-red-500/[0.04] px-2.5 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
                                    title="Tolak Tipe"
                                  >
                                    <ShieldX size={14} />
                                    <span>Tolak</span>
                                  </button>
                                </>
                              ) : null}
                              <button
                                onClick={() => handleDetailClick(user)}
                                className="flex cursor-pointer items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
                                title="Detail User"
                              >
                                <Eye size={14} />
                                <span className="hidden sm:inline">Detail</span>
                              </button>
                              <button
                                onClick={() => handleEditClick(user)}
                                className="flex cursor-pointer items-center justify-center rounded-lg bg-white/5 border border-white/10 p-1.5 text-slate-300 transition hover:bg-cyan-500/20 hover:text-cyan-300"
                                title="Edit User"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(user)}
                                className="flex cursor-pointer items-center justify-center rounded-lg bg-white/5 border border-white/10 p-1.5 text-slate-300 transition hover:bg-red-500/20 hover:text-red-400"
                                title="Hapus User"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {filteredUsers.length > INITIAL_VISIBLE && (
          <ShowMoreButton
            label="Lihat Semua User"
            total={filteredUsers.length}
            showAll={showAll}
            onToggle={() => setShowAll((prev) => !prev)}
          />
        )}
      </div>

      <AdminUserDeleteModal
        user={deleteTarget}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={deleteLoading}
        success={deleteSuccess}
      />

      <AdminUserTipeModal
        key={`${tipeTarget?.id}-${tipeDecision}`}
        user={tipeTarget}
        decision={tipeDecision}
        loading={approving}
        onConfirm={handleConfirmTipe}
        onCancel={handleCancelTipe}
      />
    </div>
  )
}

export default AdminUserList
