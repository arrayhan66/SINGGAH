// File: src/components/auth/LoginForm.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, EyeOff, Eye, ArrowLeft } from "lucide-react";
import logo from "../../../../assets/icons/logo.png";
import api from "../../../../services/api";
import { useAuth } from "../../../../context/AuthContext";

function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const res = await api.post("/login", {
        email,
        password,
      });

      const { token, user } = res.data.data;

      login(user, token);

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Email atau password salah.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col justify-center overflow-y-auto p-4 py-6 min-[350px]:p-8 sm:p-12 lg:w-1/2 lg:px-16 2xl:px-20 lg:py-10">
      {/* HEADER MOBILE: Logo SINGGAH di Kiri & Tombol Panah Minimalis di Kanan */}
      <div className="flex items-center justify-between lg:hidden mb-5">
        {/* Logo Singgah di Kiri */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-100/30 bg-white/10 p-1.5 shadow-md backdrop-blur-md">
            <img
              src={logo}
              alt="Logo SINGGAH"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-sm font-black tracking-wider text-white">
            SINGGAH
          </span>
        </div>

        {/* Tombol Panah Kembali di Kanan (Teks dihapus, hanya ikon) */}
        <Link
          to="/"
          aria-label="Kembali"
          className="inline-flex h-9 w-9 items-center justify-center text-slate-300 transition hover:text-cyan-300 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md"
        >
          <ArrowLeft size={16} />
        </Link>
      </div>

      {/* Judul Form */}
      <div className="text-center mt-2">
        <h2 className="text-xl font-bold leading-tight text-white sm:text-4xl">
          Selamat <span className="text-cyan-300">Datang</span>
        </h2>
        <p className="mt-1 text-xs text-slate-400 sm:text-base">
          Silakan masuk ke akun Anda.
        </p>
      </div>

      {/* Form Login */}
      <form onSubmit={handleLogin} className="mt-4 sm:mt-8">
        {/* Input Email/NIM */}
        <div className="mb-3 sm:mb-6">
          <label className="mb-1.5 block text-xs font-medium text-slate-300 sm:text-sm">
            Email atau NIM
          </label>

          <div className="relative text-cyan-500 focus-within:text-cyan-400">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 transition-colors">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan Email / NIM"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-xs text-slate-900 placeholder:text-slate-700 shadow-sm transition-all focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20 sm:py-4 sm:text-sm"
            />
          </div>
        </div>

        {/* Input Password */}
        <div className="mb-4 sm:mb-6">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300 sm:text-sm">
              Kata Sandi
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-bold text-cyan-400 transition-colors hover:text-cyan-300"
            >
              Lupa sandi?
            </Link>
          </div>

          <div className="relative text-cyan-500 focus-within:text-cyan-400">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 transition-colors">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-xs text-slate-900 placeholder:text-slate-600 shadow-sm transition-all focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20 sm:py-4 sm:text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4 text-slate-600 transition-colors hover:text-cyan-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] py-2.5 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-70 sm:py-4"
        >
          <span className="flex items-center justify-center gap-2">
            {isLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <span className="text-sm tracking-wide">Masuk Sekarang</span>
            )}
          </span>
        </button>
      </form>

      {/* Register Link */}
      <p className="mt-4 text-center text-xs text-slate-400 sm:mt-8 sm:text-sm">
        Belum memiliki akun?
        <Link
          to="/register"
          className="ml-1 font-bold text-cyan-400 transition-colors hover:text-cyan-300"
        >
          Daftar
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;
