function PCBBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-20"
      style={{
        backgroundImage: `
        linear-gradient(rgba(73,126,174,.15) 1px, transparent 1px),
        linear-gradient(90deg, rgba(73,126,174,.15) 1px, transparent 1px)
      `,
        backgroundSize: "40px 40px",
      }}
    />
  )
}

export default PCBBackground