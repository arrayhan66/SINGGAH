import MainLayout from "../../layouts/MainLayout"
import Hero from "../../components/sections/Hero/Hero"

import "../../styles/beranda-light.css"

export default function Home() {
  return (
    <div className="beranda-page">
      <MainLayout>
        <Hero />
      </MainLayout>
    </div>
  )
}
