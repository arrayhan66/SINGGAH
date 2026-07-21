import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Mail, Lock, EyeOff, Eye, ArrowLeft } from "lucide-react"
import logo from "../../../../assets/icons/logo.png"
import api from "../../../../services/api"
import { useAuth } from "../../../../context/AuthContext"

function LoginForm() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      setIsLoading(true)

      const res = await api.post("/login", {
        email,
        password,
      })

      const { token, user } = res.data.data

      login(user, token)

      if (user.role === "admin") {
        navigate("/admin")
      } else {
        navigate("/user")
      }
    } catch (err) {
      alert(err.response?.data?.message || "Email atau password salah.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex w-full flex-col justify-center overflow-y-auto p-4 min-[350px]:p-8 sm:p-12 lg:w-1/2 lg:px-16 lg:py-10">
      {/* Header Mobile  */}
      <div className="mb-5 min-[350px]:mb-8 flex items-center justify-between lg:hidden">
        {/* LOGO  */}
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
          to="/"
          className="flex items-center gap-2 text-[11px] min-[350px]:text-sm text-slate-400 transition hover:text-cyan-300"
        >
          <ArrowLeft size={16} />
          <span className="hidden min-[400px]:inline">Kembali</span>
        </Link>
      </div>

      {/* Judul Form  */}
      <div className="text-center">
        <h2 className="text-lg min-[300px]:text-2xl min-[350px]:text-3xl font-bold leading-tight text-white sm:text-4xl">
          Selamat <span className="text-cyan-300">Datang</span>
        </h2>
        <p className="mt-2 text-xs min-[300px]:text-sm min-[350px]:text-base text-slate-400">
          Silakan masuk ke akun Anda.
        </p>
      </div>

      {/* Form Login */}
      <form onSubmit={handleLogin} className="mt-6 min-[350px]:mt-8">
        {/* Input Email/NIM */}
        <div className="mb-4 min-[350px]:mb-6">
          <label className="mb-2 block text-[11px] min-[350px]:text-sm font-medium text-slate-300">
            Email atau NIM
          </label>

          <div className="relative text-cyan-500 focus-within:text-cyan-400">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 transition-colors">
              <Mail className="h-4 w-4 min-[350px]:h-[18px] min-[350px]:w-[18px]" />
            </div>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan Email / NIM"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 min-[350px]:py-4 pl-10 min-[350px]:pl-11 pr-3 min-[350px]:pr-4 text-[13px] min-[350px]:text-sm text-slate-900 placeholder:text-slate-700 shadow-sm transition-all focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
            />
          </div>
        </div>

        {/* Input Password */}
        <div className="mb-4 min-[350px]:mb-6">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-[11px] min-[350px]:text-sm font-medium text-slate-300">
              Kata Sandi
            </label>
            {/* Lupa Password */}
            <Link
              to="/forgot-password"
              className="text-xs font-bold text-cyan-400 transition-colors hover:text-cyan-300"
            >
              Lupa sandi?
            </Link>
          </div>

          <div className="relative text-cyan-500 focus-within:text-cyan-400">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 transition-colors">
              <Lock className="h-4 w-4 min-[350px]:h-[18px] min-[350px]:w-[18px]" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 min-[350px]:py-4 pl-10 min-[350px]:pl-11 pr-10 min-[350px]:pr-12 text-[13px] min-[350px]:text-sm text-slate-900 placeholder:text-slate-600 shadow-sm transition-all focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4 text-slate-600 transition-colors hover:text-cyan-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="group relative mt-2 w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] py-2 min-[350px]:py-4 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="flex items-center justify-center gap-2">
            {isLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <span className="text-sm tracking-wide min-[350px]:text-base">
                Masuk Sekarang
              </span>
            )}
          </span>
        </button>
      </form>

      {/* Register Link */}
      <p className="mt-6 min-[350px]:mt-10 lg:mt-8 text-center text-xs text-slate-400 min-[350px]:text-sm">
        Belum memiliki akun?
        <Link
          to="/register"
          className="ml-1 font-bold text-cyan-400 transition-colors hover:text-cyan-300"
        >
          Daftar
        </Link>
      </p>
    </div>
  )
}

export default LoginForm
