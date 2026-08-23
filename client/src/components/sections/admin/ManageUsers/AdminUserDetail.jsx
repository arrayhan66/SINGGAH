import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, UserRound } from "lucide-react"
import { useUsers } from "../../../../context/UserContext"
import AdminHeroBackground from "../../../ui/AdminHeroBackground"
import AdminUserProfileCard from "../../../../components/sections/admin/ManageUsers/AdminUserProfileCard"
import AdminUserDeleteModal from "../../../../components/sections/admin/ManageUsers/AdminUserDeleteModal"

function AdminUserDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { getUserByUsername, deleteUser } = useUsers()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  const user = getUserByUsername(slug)

  function handleEdit(target) {
    navigate(`/users/edit/${target.username}`)
  }

  function handleDeleteClick(target) {
    setDeleteTarget(target)
  }

  async function handleConfirmDelete() {
    if (deleteLoading) return
    setDeleteLoading(true)
    try {
      await deleteUser(deleteTarget.id)
      setDeleteLoading(false)
      setDeleteSuccess(true)
      setTimeout(() => navigate("/users"), 1200)
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

  if (!user) {
    return (
      <div className="px-6 py-10 md:px-10 text-center text-slate-400">
        User tidak ditemukan.
      </div>
    )
  }

  return (
    <>
      <AdminHeroBackground fullWidth>
        <div className="px-4 md:px-6 lg:px-8 pt-6 pb-10 md:pt-8">
          <button
            onClick={() => navigate("/users")}
            className="group inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-xl transition-all duration-200 hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-300"
          >
            <ArrowLeft
              size={14}
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            Kembali ke Kelola User
          </button>

          <div className="mt-6 flex items-center gap-[clamp(0.75rem,0.5rem+1vw,1rem)] min-w-0">
            <div className="flex h-[clamp(2.75rem,2.25rem+2vw,3.5rem)] w-[clamp(2.75rem,2.25rem+2vw,3.5rem)] shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10">
              <UserRound className="h-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] w-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] text-cyan-300" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[clamp(1.25rem,0.9375rem+1.5vw,1.5rem)] font-black text-white sm:text-3xl">
                Detail <span className="text-slate-100">User</span>
              </h1>
              <p className="mt-1 max-w-xl text-[clamp(0.8125rem,0.75rem+0.5vw,0.875rem)] text-slate-400">
                Detail informasi akun pengguna SINGGAH.
              </p>
            </div>
          </div>
        </div>
      </AdminHeroBackground>

      <div className="px-4 min-[260px]:px-3 pb-12 md:px-6 md:pb-16 lg:px-8">
        <div className="mx-auto mt-6 max-w-5xl md:mt-8">
          <AdminUserProfileCard
            user={user}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </div>
      </div>

      <AdminUserDeleteModal
        user={deleteTarget}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={deleteLoading}
        success={deleteSuccess}
      />
    </>
  )
}

export default AdminUserDetail
