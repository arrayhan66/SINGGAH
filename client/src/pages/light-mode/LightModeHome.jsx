// LIGHT MODE - versi pembanding skripsi, terpisah dari dark mode
import LightModeNavbar from "../../components/light/LightModeNavbar"
import LightModeHero from "../../components/light/LightModeHero"
import LightModeFooter from "../../components/light/LightModeFooter"

function LightModeHome() {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <LightModeNavbar />
      <main className="flex-grow">
        <LightModeHero />
      </main>
      <LightModeFooter />
    </div>
  )
}

export default LightModeHome
