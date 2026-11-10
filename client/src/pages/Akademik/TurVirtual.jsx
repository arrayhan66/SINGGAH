import MainLayout from "../../layouts/MainLayout"
import TurVirtualSection from "../../components/sections/akademik/TurVirtualSection"
import "../../styles/akademik-light.css"

export default function TurVirtual() {
  return (
    <div className="akademik-page">
      <MainLayout>
        <TurVirtualSection />
      </MainLayout>
    </div>
  )
}
