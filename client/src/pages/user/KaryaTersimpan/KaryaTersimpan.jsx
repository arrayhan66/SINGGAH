import UserLayout from "../../../layouts/UserLayout"
import KaryaTersimpanSection from "../../../components/sections/user/KaryaTersimpan/KaryaTersimpanSection"
import "../../../styles/user-light.css"

export default function KaryaTersimpan() {
  return (
    <div className="user-page light-page">
      <UserLayout>
        <KaryaTersimpanSection />
      </UserLayout>
    </div>
  )
}
