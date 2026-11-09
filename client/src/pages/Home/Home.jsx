import MainLayout from "../../layouts/MainLayout"
import Hero from "../../components/sections/Hero/Hero"
import PlanetaryOrbitGallery from "../../components/sections/PlanetaryOrbitGallery"
import KategoriPopuler from "../../components/sections/KategoriPopuler"
import KaryaSinggah from "../../components/sections/KaryaSinggah"

import "../../styles/beranda-light.css"

export default function Home() {
  return (
    <div className="beranda-page">
      <MainLayout>
        <Hero />
        <PlanetaryOrbitGallery />
        <KategoriPopuler />
        <KaryaSinggah />
      </MainLayout>
    </div>
  )
}
