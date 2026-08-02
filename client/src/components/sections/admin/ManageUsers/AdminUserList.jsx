import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { UserSearch } from "lucide-react"
import { useUsers } from "../../../../context/UserContext"
import AdminUserCard from "./AdminUserCard"
import AdminUserDeleteModal from "./AdminUserDeleteModal"
import ShowMoreButton from "../../../ui/ShowMoreButton"

const INITIAL_VISIBLE = 9

function AdminUserList({ search, statusFilter }) {
  const navigate = useNavigate()
  const { userList, deleteUser } = useUsers()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const filterKey = search
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
            <div className="grid grid-cols-1 min-[750px]:grid-cols-2 min-[1200px]:grid-cols-3 gap-4 md:gap-5">
              {visibleUsers.map((user) => (
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
      />
    </div>
  )
}

export default AdminUserList
