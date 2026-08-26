import MainLayout from "../../layouts/MainLayout"
import KaryaProjectDetailSection from "../../components/sections/karya/KaryaProjectDetailSection"
import "../../styles/detail-light.css"

export default function KaryaProjectDetail() {
  return (
    <div className="karya-projectdetail-page light-page detail-page">
      <MainLayout>
        <KaryaProjectDetailSection />
      </MainLayout>
    </div>
  )
}
