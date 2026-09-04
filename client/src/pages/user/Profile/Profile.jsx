import UserLayout from "../../../layouts/UserLayout"
import ProfileHero from "../../../components/sections/user/Profile/ProfileHero"
import ProfileForm from "../../../components/sections/user/Profile/ProfileForm"
import "../../../styles/user-light.css"

export default function Profile() {
  return (
    <div className="user-page light-page">
      <UserLayout>
        <ProfileHero />
        <ProfileForm />
      </UserLayout>
    </div>
  )
}
