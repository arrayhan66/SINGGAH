import { useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import logo from "../../../../assets/icons/logo.png"

function VerifyCodeForm() {
  const navigate = useNavigate()

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)

  const inputs = useRef([])

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp]
        newOtp[index] = ""
        setOtp(newOtp)
      } else if (index > 0) {
        inputs.current[index - 1]?.focus()
      }
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)

    if (!pasted) return

    const newOtp = [...otp]

    pasted.split("").forEach((num, i) => {
      newOtp[i] = num
    })

    setOtp(newOtp)

    inputs.current[Math.min(pasted.length - 1, 5)]?.focus()
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (otp.some((item) => item === "")) {
      alert("Masukkan kode verifikasi terlebih dahulu.")
      return
    }

    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      navigate("/reset-password")
    }, 1500)
  }

  return (
    <div className="flex w-full flex-col justify-center overflow-y-auto p-4 min-[350px]:p-8 sm:p-12 lg:w-1/2 lg:px-16 lg:py-10">
      {/* Header Mobile */}
      <div className="mb-5 flex items-center justify-between min-[350px]:mb-8 lg:hidden">
        <Link
          to="/"
          className="flex items-center gap-2 min-[350px]:gap-3 transition-opacity hover:opacity-90"
        >
          <img
            src={logo}
            alt="Logo SINGGAH"
            className="h-8 w-8 min-[350px]:h-10 min-[350px]:w-10"
          />

          <span className="text-xl font-black tracking-wide text-white min-[350px]:text-2xl">
            SINGGAH
          </span>
        </Link>

        <Link
          to="/forgot-password"
          className="flex items-center gap-2 text-[11px] text-slate-400 transition hover:text-cyan-300 min-[350px]:text-sm"
        >
          <ArrowLeft size={16} />
          <span className="hidden min-[400px]:inline">Kembali</span>
        </Link>
      </div>

      {/* Title */}
      <div className="text-center">
        <h2 className="text-lg font-bold leading-tight text-white min-[300px]:text-2xl min-[350px]:text-3xl sm:text-4xl">
          Verifikasi <span className="text-cyan-300">Kode</span>
        </h2>

        <p className="mt-2 text-xs text-slate-400 min-[300px]:text-sm min-[350px]:text-base">
          Masukkan 6 digit kode yang telah dikirim ke email Anda.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-6 min-[350px]:mt-8">
        <div
          className="flex justify-center gap-2 min-[350px]:gap-3"
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 text-center text-base font-bold text-slate-900 shadow-sm transition-all focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20 min-[300px]:h-11 min-[300px]:w-11 min-[350px]:h-14 min-[350px]:w-14 min-[350px]:text-xl"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative mt-8 w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] py-2 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-70 min-[350px]:py-4"
        >
          <span className="flex items-center justify-center gap-2">
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <span className="text-sm tracking-wide min-[350px]:text-base">
                Verifikasi
              </span>
            )}
          </span>
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-400 min-[350px]:mt-10 min-[350px]:text-sm lg:mt-8">
        Belum menerima kode?
        <button
          type="button"
          className="ml-2 font-bold text-cyan-400 transition-colors hover:text-cyan-300"
        >
          Kirim ulang
        </button>
      </p>
    </div>
  )
}

export default VerifyCodeForm
