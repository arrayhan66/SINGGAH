import MainLayout from "../../layouts/MainLayout"
import JadwalRuanganSection from "../../components/sections/akademik/JadwalRuanganSection"
import "../../styles/akademik-light.css"

export default function JadwalRuangan() {
  return (
    <div className="akademik-page">
      <MainLayout>
        <JadwalRuanganSection />
      </MainLayout>
    </div>
  )
}
