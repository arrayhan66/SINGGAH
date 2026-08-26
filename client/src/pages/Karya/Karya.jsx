import MainLayout from "../../layouts/MainLayout"
import KaryaSection from "../../components/sections/karya/KaryaSection"
import "../../styles/karya-light.css"

export default function Karya() {
  return (
    <div className="karya-page light-page">
      <MainLayout>
        <KaryaSection />
      </MainLayout>
    </div>
  )
}
