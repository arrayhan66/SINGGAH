import MainLayout from "../../layouts/MainLayout"
import DaftarDosenSection from "../../components/sections/akademik/DaftarDosenSection"
import "../../styles/akademik-light.css"

export default function DaftarDosen() {
  return (
    <div className="akademik-page">
      <MainLayout>
        <DaftarDosenSection />
      </MainLayout>
    </div>
  )
}
