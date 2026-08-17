import UserLayout from "../../../layouts/UserLayout"
import EditKaryaHero from "../../../components/sections/user/EditKarya/EditKaryaHero"
import EditKaryaSection from "../../../components/sections/user/EditKarya/EditKaryaSection"

function EditKarya() {
  return (
    <UserLayout>
      <EditKaryaHero />
      <EditKaryaSection />
    </UserLayout>
  )
}

export default EditKarya
