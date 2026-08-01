import GlowBackground from "./GlowBackground"

const bleedMargin =
  "-mx-3 min-[260px]:-mx-4 md:-mx-6 lg:-mx-8 xl:-mx-10 2xl:-mx-12 3xl:-mx-16 4xl:-mx-20 5xl:-mx-24 6xl:-mx-28"
const restorePadding =
  "px-3 min-[260px]:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20 5xl:px-24 6xl:px-28"

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
