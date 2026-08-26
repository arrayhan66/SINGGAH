import MainLayout from "../../layouts/MainLayout"
import BeritaDetail from "../../components/sections/berita/BeritaDetail"
import "../../styles/detail-light.css"

export default function NewsDetail() {
  return (
    <div className="berita-detail-page light-page detail-page">
      <MainLayout>
        <BeritaDetail />
      </MainLayout>
    </div>
  )
}
