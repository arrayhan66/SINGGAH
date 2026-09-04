import MainLayout from "../../../layouts/MainLayout"
import MyKaryaSection from "../../../components/sections/user/MyKarya/MyKaryaSection"
import "../../../styles/user-light.css"

export default function MyKarya() {
  return (
    <div className="user-page light-page">
      <MainLayout>
        <MyKaryaSection />
      </MainLayout>
    </div>
  )
}
