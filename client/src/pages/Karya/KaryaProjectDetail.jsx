import MainLayout from "../../layouts/MainLayout"
import KaryaProjectDetailSection from "../../components/sections/karya/KaryaProjectDetailSection"
import "../../styles/detail-light.css"

function KaryaProjectDetail() {
  return (
    <div className="karya-projectdetail-page light-page detail-page">
      <MainLayout>
        <KaryaProjectDetailSection />
      </MainLayout>
    </div>
  )
}

export default KaryaProjectDetail
