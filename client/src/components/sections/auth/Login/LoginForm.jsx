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
    // Padding atas-bawah (py) dipangkas habis jadi py-5 di mobile agar card tidak kepanjangan
    <div className="flex w-full flex-col justify-center overflow-y-auto px-4 py-5 sm:p-10 lg:w-1/2 lg:px-16 2xl:px-20 lg:py-12">
      {/* HEADER MOBILE */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-100/30 bg-white/10 p-1.5 shadow-md backdrop-blur-md">
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

        <Link
          to="/"
          aria-label="Kembali"
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 backdrop-blur-md transition hover:text-cyan-300"
        >
          <ArrowLeft size={16} />
        </Link>
      </div>

      {/* Judul Form */}
      <div className="text-center">
        <h2 className="text-xl font-bold leading-tight text-white sm:text-4xl">
          Selamat <span className="text-cyan-300">Datang</span>
        </h2>
        <p className="mt-1 text-[11px] text-slate-400 sm:text-base">
          Silakan masuk ke akun Anda.
        </p>
      </div>

      {/* Form Login (Margin atas dipangkas) */}
      <form onSubmit={handleLogin} className="mt-5 sm:mt-8">
        {/* Input Email/NIM */}
        <div className="mb-4 sm:mb-6">
          <label className="mb-1.5 block text-[11px] font-medium text-slate-300 sm:text-sm">
            Email atau NIM
          </label>

          <div className="relative text-cyan-500 focus-within:text-cyan-400">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 transition-colors">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan Email / NIM"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-xs text-slate-900 placeholder:text-slate-600 shadow-sm transition-all focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20 sm:py-4 sm:text-sm"
            />
          </div>
        </div>

        {/* Input Password */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[11px] font-medium text-slate-300 sm:text-sm">
              Kata Sandi
            </label>
            <Link
              to="/forgot-password"
              className="text-[10px] font-bold text-cyan-400 transition-colors hover:text-cyan-300 sm:text-sm"
            >
              Lupa sandi?
            </Link>
          </div>

          <div className="relative text-cyan-500 focus-within:text-cyan-400">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 transition-colors">
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
              className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3.5 text-slate-600 transition-colors hover:text-cyan-600"
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
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white sm:h-5 sm:w-5" />
            ) : (
              <span className="text-xs tracking-wide sm:text-sm">
                Masuk Sekarang
              </span>
            )}
          </span>
        </button>
      </form>

      {/* Register Link (Margin atas dipangkas) */}
      <p className="mt-5 text-center text-[10px] text-slate-400 sm:mt-8 sm:text-sm">
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
