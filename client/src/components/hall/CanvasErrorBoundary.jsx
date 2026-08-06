import { Component } from "react"

class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error("Canvas error:", error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#0b1220] text-white">
          <div className="text-2xl font-bold text-[#7dd3fc]">
            Maaf, terjadi kendala
          </div>
          <p className="text-sm text-[#93b4d4]">Scene 3D gagal dimuat.</p>
          <button
            onClick={() => window.location.reload()}
            className="cursor-pointer rounded-xl border border-[#223047] bg-black/50 px-4 py-2 text-sm font-semibold text-[#38bdf8] transition-colors hover:bg-cyan-400/10"
          >
            Muat Ulang
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default CanvasErrorBoundary
