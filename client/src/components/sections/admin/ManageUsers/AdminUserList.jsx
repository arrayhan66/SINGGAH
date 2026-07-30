import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { UserSearch, Plus } from "lucide-react"
import { useUsers } from "../../../../context/UserContext"
import SearchBar from "../../../ui/SearchBar"
import AdminUserCard from "./AdminUserCard"
import AdminUserDeleteModal from "./AdminUserDeleteModal"

function AdminUserList() {
  const navigate = useNavigate()
  const { userList, deleteUser } = useUsers()
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase()
    return userList.filter(
      (u) =>
        u.name.toLowerCase().includes(keyword) ||
        u.email.toLowerCase().includes(keyword) ||
        u.username.toLowerCase().includes(keyword),
    )
  }, [userList, search])

  function handleSearchChange(e) {
    setSearch(e.target.value)
  }

  function handleAddClick() {
    navigate("/admin/users/tambah")
  }

  function handleEditClick(user) {
    navigate(`/admin/users/edit/${user.id}`)
  }

  function handleDetailClick(user) {
    navigate(`/admin/users/${user.id}`)
  }

  function handleDeleteClick(user) {
    setDeleteTarget(user)
  }

  function handleConfirmDelete() {
    deleteUser(deleteTarget.id)
    setDeleteTarget(null)
  }

  function handleCancelDelete() {
    setDeleteTarget(null)
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 pt-4 pb-12">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col min-[500px]:flex-row gap-3">
          <div className="flex-1 min-w-0 [&>div]:mt-0">
            <SearchBar
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari nama, email, atau username..."
            />
          </div>

          <button
            type="button"
            onClick={handleAddClick}
            className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0]"
          >
            <Plus size={16} />
            Tambah User
          </button>
        </div>

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
            <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {filteredUsers.map((user) => (
                <AdminUserCard
                  key={user.id}
                  user={user}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onDetail={handleDetailClick}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <AdminUserDeleteModal
        user={deleteTarget}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}

export default AdminUserList
