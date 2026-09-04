import UserLayout from "../../../layouts/UserLayout"
import EditKaryaHero from "../../../components/sections/user/EditKarya/EditKaryaHero"
import EditKaryaSection from "../../../components/sections/user/EditKarya/EditKaryaSection"
import "../../../styles/user-light.css"

export default function EditKarya() {
  return (
    <div className="user-page light-page">
      <UserLayout>
        <EditKaryaHero />
        <EditKaryaSection />
      </UserLayout>
    </div>
  )
}
