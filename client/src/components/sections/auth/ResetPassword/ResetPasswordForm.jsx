import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import logo from "../../../../assets/icons/logo.png"

function ResetPasswordForm() {
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert("Password tidak sama.")
      return
    }

    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      alert("Password berhasil diubah.")
      navigate("/login")
    }, 1500)
  }

  return (
    <div className="flex w-full flex-col justify-center overflow-y-auto p-4 min-[350px]:p-8 sm:p-12 lg:w-1/2 lg:px-16 lg:py-10">
      {/* Header Mobile */}
      <div className="mb-5 flex items-center justify-between min-[350px]:mb-8 lg:hidden">
        <Link
          to="/"
          className="flex items-center gap-2 min-[350px]:gap-3 hover:opacity-90"
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
          to="/verify-code"
          className="flex items-center gap-2 text-[11px] text-slate-400 transition hover:text-cyan-300 min-[350px]:text-sm"
        >
          <ArrowLeft size={16} />
          <span className="hidden min-[400px]:inline">Kembali</span>
        </Link>
      </div>

      {/* Title */}

      <div className="text-center">
        <h2 className="text-lg font-bold leading-tight text-white min-[300px]:text-2xl min-[350px]:text-3xl sm:text-4xl">
          Reset <span className="text-cyan-300">Password</span>
        </h2>

        <p className="mt-2 text-xs text-slate-400 min-[300px]:text-sm min-[350px]:text-base">
          Buat password baru yang aman untuk akun Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 min-[350px]:mt-8">
        {/* Password */}

        <div className="mb-4 min-[350px]:mb-6">
          <label className="mb-2 block text-[11px] font-medium text-slate-300 min-[350px]:text-sm">
            Password Baru
          </label>

          <div className="relative text-cyan-500 focus-within:text-cyan-400">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 min-[350px]:h-[18px] min-[350px]:w-[18px]" />

            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password baru"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-10 text-[13px] text-slate-900 placeholder:text-slate-600 shadow-sm transition-all focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20 min-[350px]:py-4 min-[350px]:pl-11 min-[350px]:pr-12 min-[350px]:text-sm"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-600 hover:text-cyan-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm */}

        <div className="mb-6">
          <label className="mb-2 block text-[11px] font-medium text-slate-300 min-[350px]:text-sm">
            Konfirmasi Password
          </label>

          <div className="relative text-cyan-500 focus-within:text-cyan-400">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 min-[350px]:h-[18px] min-[350px]:w-[18px]" />

            <input
              type={showConfirm ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-10 text-[13px] text-slate-900 placeholder:text-slate-600 shadow-sm transition-all focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20 min-[350px]:py-4 min-[350px]:pl-11 min-[350px]:pr-12 min-[350px]:text-sm"
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-600 hover:text-cyan-600"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Button */}

        <button
          type="submit"
          disabled={loading}
          className="group relative mt-2 w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] py-2 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-70 min-[350px]:py-4"
        >
          <span className="flex items-center justify-center gap-2">
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <span className="text-sm tracking-wide min-[350px]:text-base">
                Simpan Password
              </span>
            )}
          </span>
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-400 min-[350px]:mt-10 min-[350px]:text-sm lg:mt-8">
        Kembali ke halaman
        <Link
          to="/login"
          className="ml-2 font-bold text-cyan-400 hover:text-cyan-300"
        >
          Login
        </Link>
      </p>
    </div>
  )
}

export default ResetPasswordForm
