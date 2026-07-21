import AdminLayout from "../../../layouts/AdminLayout"
import AdminUserHero from "../../../components/sections/admin/ManageUsers/AdminUserHero"
import AdminUserList from "../../../components/sections/admin/ManageUsers/AdminUserList"

function Users() {
  return (
    <AdminLayout>
      <AdminUserHero />
      <AdminUserList />
    </AdminLayout>
  )
}

export default Users
