function GlowBackground() {
  return (
    <>
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2  rounded-full bg-cyan-500/10 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[480px] w-[480px]  rounded-full bg-blue-500/10 blur-[110px]" />
      <div className="pointer-events-none absolute left-0 top-1/3 h-[480px] w-[480px]  rounded-full bg-cyan-500/10 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[480px] w-[480px] -translate-x-1/2  rounded-full bg-blue-500/10 blur-[110px]" />
    </>
  )
}

export default GlowBackground