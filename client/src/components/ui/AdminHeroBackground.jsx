import GlowBackground from "./GlowBackground"

const bleedMargin = "-mx-[clamp(8px,2vw,32px)]"
const restorePadding = "px-[clamp(8px,2vw,32px)]"

function AdminHeroBackground({ children, className = "", fullWidth = false }) {
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
          background:
            "radial-gradient(circle at top center, transparent 0%, rgba(4,29,56,0.2) 50%, rgba(4,29,56,0.85) 100%)",
        }}
      />
    </div>
  )
}

export default AdminHeroBackground
