import UserLayout from "../../../layouts/UserLayout"
import ProfileHero from "../../../components/sections/user/Profile/ProfileHero"
import ProfileForm from "../../../components/sections/user/Profile/ProfileForm"

export default function Profile() {
  return (
    <UserLayout>
      <ProfileHero />
      <ProfileForm />
    </UserLayout>
  )
}
