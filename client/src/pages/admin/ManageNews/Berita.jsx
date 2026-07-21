import AdminLayout from "../../../layouts/AdminLayout"
import AdminBeritaHero from "../../../components/sections/admin/ManageNews/AdminBeritaHero"
import AdminBeritaList from "../../../components/sections/admin/ManageNews/AdminBeritaList"

function ManageNews() {
  return (
    <AdminLayout>
      <AdminBeritaHero />
      <AdminBeritaList />
    </AdminLayout>
  )
}

export default ManageNews
