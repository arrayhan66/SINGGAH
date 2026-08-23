import GlowBackground from "./GlowBackground"
import { useTheme } from "../../context/ThemeContext"

const bleedMargin = "-mx-[clamp(8px,2vw,32px)]"
const restorePadding = "px-[clamp(8px,2vw,32px)]"

const darkVignette =
  "radial-gradient(circle at top center, transparent 0%, rgba(4,29,56,0.2) 50%, rgba(4,29,56,0.85) 100%)"

/* Light mode: vignette kebiruan lembut agar area header tetap
   terlihat sebagai permukaan tersendiri (bukan putih polos,
   bukan navy gelap) */
const lightVignette =
  "radial-gradient(circle at top center, transparent 0%, rgba(37,99,235,0.05) 50%, rgba(30,64,120,0.16) 100%)"

function AdminHeroBackground({ children, className = "", fullWidth = false }) {
  const { theme } = useTheme()

  return (
    <div
      className={`relative overflow-hidden bg-brand-dark ${
        fullWidth ? bleedMargin : ""
      } ${className}`}
    >
      <GlowBackground />
      <div className={`relative z-10 ${fullWidth ? restorePadding : ""}`}>
        {children}
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: theme === "light" ? lightVignette : darkVignette,
        }}
      />
    </div>
  )
}

export default AdminHeroBackground
