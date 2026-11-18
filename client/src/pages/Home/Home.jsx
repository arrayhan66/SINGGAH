import MainLayout from "../../layouts/MainLayout"
import HeroPhoto from "../../components/sections/Hero/HeroPhoto"
import MitraMarquee from "../../components/sections/Hero/MitraMarquee"
import Hero from "../../components/sections/Hero/Hero"
import PlanetaryOrbitGallery from "../../components/sections/PlanetaryOrbitGallery"

import "../../styles/beranda-light.css"

export default function Home() {
  return (
    <div className="beranda-page">
      <MainLayout>
        <HeroPhoto />
        <MitraMarquee />
        <Hero />
        <PlanetaryOrbitGallery />
      </MainLayout>
    </div>
  )
}
