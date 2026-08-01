import { useState } from "react"
import AdminLayout from "../../../layouts/AdminLayout"
import AdminUserHero from "../../../components/sections/admin/ManageUsers/AdminUserHero"
import AdminUserList from "../../../components/sections/admin/ManageUsers/AdminUserList"

function Users() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  return (
    <AdminLayout>
      <AdminUserHero
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />
      <AdminUserList search={search} statusFilter={statusFilter} />
    </AdminLayout>
  )
}

export default Users
