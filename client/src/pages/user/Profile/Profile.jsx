import { Navigate } from "react-router-dom"
import { useAuth } from "../../../context/AuthContext"
import UserLayout from "../../../layouts/UserLayout"
import ProfileHero from "../../../components/sections/user/Profile/ProfileHero"
import ProfileForm from "../../../components/sections/user/Profile/ProfileForm"

function Profile() {
  const { user } = useAuth()

  if (user?.role === "admin") {
    return <Navigate to="/admin/profile" replace />
  }

  return (
    <UserLayout>
      <ProfileHero />
      <ProfileForm />
    </UserLayout>
  )
}

export default Profile
