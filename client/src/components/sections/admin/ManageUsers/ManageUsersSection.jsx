import { useState } from "react"
import AdminUserHero from "./AdminUserHero"
import AdminUserList from "./AdminUserList"

export default function ManageUsersSection() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  return (
    <>
      <AdminUserHero
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />
      <AdminUserList search={search} statusFilter={statusFilter} />
    </>
  )
}
