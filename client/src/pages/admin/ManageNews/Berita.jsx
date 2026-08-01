import { useState } from "react"
import AdminLayout from "../../../layouts/AdminLayout"
import AdminBeritaHero from "../../../components/sections/admin/ManageNews/AdminBeritaHero"
import AdminBeritaList from "../../../components/sections/admin/ManageNews/AdminBeritaList"

function ManageNews() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  return (
    <AdminLayout>
      <AdminBeritaHero
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />
      <AdminBeritaList search={search} statusFilter={statusFilter} />
    </AdminLayout>
  )
}

export default ManageNews
