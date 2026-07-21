import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, ArrowLeft } from "lucide-react"
import logo from "../../../../assets/icons/logo.png"

function ForgotPasswordForm() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      navigate("/verify-code")
    }, 1500)
  }

  return (
    <div className="flex w-full flex-col justify-center overflow-y-auto p-4 min-[350px]:p-8 sm:p-12 lg:w-1/2 lg:px-16 lg:py-10">
      {/* Mobile Header */}

      <div className="mb-5 min-[350px]:mb-8 flex items-center justify-between lg:hidden">
        <Link
          to="/"
          className="flex items-center gap-2 min-[350px]:gap-3 transition-opacity hover:opacity-90"
        >
          <img
            src={logo}
            alt="Logo"
            className="h-8 w-8 min-[350px]:h-10 min-[350px]:w-10"
          />

          <span className="text-xl font-black tracking-wide text-white min-[350px]:text-2xl">
            SINGGAH
          </span>
        </Link>

        <Link
          to="/login"
          className="flex items-center gap-2 text-[11px] min-[350px]:text-sm text-slate-400 transition hover:text-cyan-300"
        >
          <ArrowLeft size={16} />
          <span className="hidden min-[400px]:inline">Kembali</span>
        </Link>
      </div>

      {/* Title */}

      <div className="text-center">
        <h2 className="text-lg min-[300px]:text-2xl min-[350px]:text-3xl font-bold leading-tight text-white sm:text-4xl">
          Lupa <span className="text-cyan-300">Password</span>
        </h2>
        <p className="mt-2 text-xs min-[300px]:text-sm min-[350px]:text-base text-slate-400">
          Masukkan email yang terdaftar. Kami akan mengirim kode verifikasi.
        </p>
      </div>

      {/* Form */}

      <form onSubmit={handleSubmit} className="mt-6 min-[350px]:mt-8">
        <div>
          <label className="mb-2 block text-[11px] min-[350px]:text-sm font-medium text-slate-300">
            Email
          </label>

          <div className="relative text-cyan-500 focus-within:text-cyan-400">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-500 min-[350px]:h-[18px] min-[350px]:w-[18px]" />

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 min-[350px]:py-4 pl-10 min-[350px]:pl-11 pr-3 min-[350px]:pr-4 text-[13px] min-[350px]:text-sm text-slate-900 placeholder:text-slate-600 shadow-sm transition-all focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative mt-6 w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] py-2 min-[350px]:py-4 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="flex items-center justify-center gap-2">
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <span className="text-sm tracking-wide min-[350px]:text-base">
                Kirim Kode Verifikasi
              </span>
            )}
          </span>
        </button>
      </form>

      <p className="mt-6 min-[350px]:mt-10 lg:mt-8 text-center text-xs text-slate-400 min-[350px]:text-sm">
        Ingat password?
        <Link
          to="/login"
          className="ml-2 font-bold text-cyan-400 hover:text-cyan-300"
        >
          Masuk
        </Link>
      </p>
    </div>
  )
}

export default ForgotPasswordForm
