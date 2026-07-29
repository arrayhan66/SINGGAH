import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import AdminLayout from "../../../../layouts/AdminLayout"
import { useUsers } from "../../../../context/UserContext"
import AdminUserProfileCard from "../../../../components/sections/admin/ManageUsers/AdminUserProfileCard"
import AdminUserDeleteModal from "../../../../components/sections/admin/ManageUsers/AdminUserDeleteModal"

function AdminUserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getUserById, deleteUser } = useUsers()
  const [deleteTarget, setDeleteTarget] = useState(null)

  const user = getUserById(id)

  function handleEdit(target) {
    navigate(`/admin/users/edit/${target.id}`)
  }

  function handleDeleteClick(target) {
    setDeleteTarget(target)
  }

  function handleConfirmDelete() {
    deleteUser(deleteTarget.id)
    navigate("/admin/users")
  }

  function handleCancelDelete() {
    setDeleteTarget(null)
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="px-6 py-10 md:px-10 text-center text-slate-400">
          User tidak ditemukan.
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="px-6 pt-2 pb-10 md:px-10 md:pt-3">
        <button
          onClick={() => navigate("/admin/users")}
          className="flex cursor-pointer items-center gap-2 text-sm text-slate-300 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Kelola User
        </button>

        <h1 className="mt-4 text-xl md:text-2xl font-bold text-white">
          Detail User
        </h1>

        <div className="mt-6 w-full">
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
      />
    </AdminLayout>
  )
}

export default AdminUserDetail
