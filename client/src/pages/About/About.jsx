import MainLayout from "../../layouts/MainLayout"
import AboutSection from "../../components/sections/About"
import "../../styles/tentang-light.css"

export default function About() {
  return (
    <div className="tentang-page light-page">
      <MainLayout>
        <AboutSection />
      </MainLayout>
    </div>
  )
}
