import MainLayout from "../../layouts/MainLayout"
import Berita from "../../components/sections/berita/Berita"
import "../../styles/berita-light.css"

export default function News() {
  return (
    <div className="berita-page light-page">
      <MainLayout>
        <Berita />
      </MainLayout>
    </div>
  )
}
