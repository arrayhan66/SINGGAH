import MainLayout from "../../layouts/MainLayout"
import Hero from "../../components/sections/Hero/Hero"
import FAQ from "../../components/sections/FAQ"

function Home() {
  return (
    <MainLayout>
      <Hero />
      <FAQ />
    </MainLayout>
  )
}

export default Home
