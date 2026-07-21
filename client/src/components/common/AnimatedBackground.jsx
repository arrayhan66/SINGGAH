function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden">
      <div className="absolute left-[-300px] top-[-200px] h-[700px] w-[700px] rounded-full bg-cyan-500/10 blur-[200px] animate-pulse" />

      <div className="absolute right-[-250px] bottom-[-200px] h-[700px] w-[700px] rounded-full bg-blue-500/20 blur-[200px] animate-pulse" />

      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
linear-gradient(#497EAE 1px,transparent 1px),
linear-gradient(90deg,#497EAE 1px,transparent 1px)
`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  )
}

export default AnimatedBackground
