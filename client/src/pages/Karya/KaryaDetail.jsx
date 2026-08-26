import MainLayout from "../../layouts/MainLayout"
import KaryaProjectSection from "../../components/sections/karya/KaryaProjectSection"
import "../../styles/detail-light.css"

export default function KaryaDetail() {
  return (
    <div className="karya-detail-page light-page detail-page">
      <MainLayout>
        <KaryaProjectSection />
      </MainLayout>
    </div>
  )
}
