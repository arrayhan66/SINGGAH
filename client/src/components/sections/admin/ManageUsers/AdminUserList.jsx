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
    <div className="px-6 pb-10 md:px-10">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col min-[500px]:flex-row gap-3">
          <div className="flex-1 min-w-0">
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
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
            <UserSearch className="h-10 w-10 text-slate-500" />
            <p className="text-sm md:text-base text-slate-400">
              Tidak ada user yang cocok.
            </p>
          </div>
        ) : (
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
