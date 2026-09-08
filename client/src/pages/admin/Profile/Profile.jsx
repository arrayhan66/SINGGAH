import AdminLayout from "../../../layouts/AdminLayout"
import ProfileHero from "../../../components/sections/user/Profile/ProfileHero"
import ProfileForm from "../../../components/sections/user/Profile/ProfileForm"

export default function AdminProfile() {
  return (
    <AdminLayout>
      <div className="user-page">
        <ProfileHero isAdmin />
        <ProfileForm isAdmin />
      </div>
    </AdminLayout>
  )
}
