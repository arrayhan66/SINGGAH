import { useState } from "react"
import AdminBeritaHero from "./AdminBeritaHero"
import AdminBeritaList from "./AdminBeritaList"

export default function ManageNewsSection() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  return (
    <>
      <AdminBeritaHero
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />
      <AdminBeritaList search={search} statusFilter={statusFilter} />
    </>
  )
}
