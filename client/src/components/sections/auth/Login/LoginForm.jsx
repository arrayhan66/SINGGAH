import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Mail, Lock, EyeOff, Eye, ArrowLeft } from "lucide-react";
import logo from "../../../../assets/icons/logo.webp";
import api from "../../../../services/api";
import { useAuth } from "../../../../context/AuthContext";
import FormAlert from "../../../ui/FormAlert";
import GoogleLogin from "../../../ui/GoogleLoginButton";
import { getRedirectFrom } from "../../../../utils/redirectFrom";

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });

  const { login } = useAuth();

  const backTo = getRedirectFrom(location) || "/";

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({ email: "", password: "" });

    let errors = {};
    let isValid = true;

    if (!email.trim()) {
      errors.email = "Email tidak boleh kosong.";
      isValid = false;
    } else if (!validateEmail(email)) {
      errors.email = "Format email tidak valid (contoh: nama@email.com).";
      isValid = false;
    }

    if (!password) {
      errors.password = "Kata sandi tidak boleh kosong.";
      isValid = false;
    } else if (password.length < 6) {
      errors.password = "Kata sandi minimal 6 karakter.";
      isValid = false;
    }

    if (!isValid) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data.data;

      login(user, token);

      const from = getRedirectFrom(location);

      if (user.role === "admin") {
        navigate("/admin");
      } else if (from) {
        navigate(from, { replace: true });
      } else {
        navigate("/");
      }
    } catch (err) {
      setGeneralError(
        err.response?.data?.message ||
          "Terjadi kesalahan sistem. Silakan coba lagi.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col justify-center px-4 py-5 sm:p-10 lg:w-1/2 lg:px-16 lg:py-12 2xl:px-20">
      <div className="mb-7 flex items-center justify-between sm:mb-12 lg:hidden">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-100/30 bg-white/10 p-3 shadow-md backdrop-blur-md sm:h-16 sm:w-16 sm:p-3.5">
            <img
              src={logo}
              alt="Logo SINGGAH"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-xl font-black tracking-wider text-white sm:text-2xl">
            SINGGAH
          </span>
        </div>

        <Link
          to={backTo}
          aria-label="Kembali"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 shadow-sm backdrop-blur-md transition hover:text-cyan-300 sm:h-10 sm:w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold leading-tight text-white sm:text-4xl">
          Selamat <span className="text-cyan-300">Datang</span>
        </h2>
        <p className="mt-1.5 text-xs leading-5 text-slate-400 min-[350px]:text-sm sm:mt-2 sm:text-base sm:leading-6">
          Silakan masuk untuk melanjutkan.
        </p>
      </div>

      <form onSubmit={handleLogin} className="my-8 sm:my-14" noValidate>
        <FormAlert message={generalError} type="error" onClose={() => setGeneralError("")} />

        <div className="mb-4 sm:mb-6">
          <label className="mb-1.5 block text-xs font-medium text-slate-300 min-[350px]:text-sm">
            Email
          </label>
          <div
            className={`relative ${fieldErrors.email ? "text-red-500" : "text-cyan-500 focus-within:text-cyan-400"}`}
          >
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 transition-colors">
              <Mail className="h-[18px] w-[18px] min-[350px]:h-5 min-[350px]:w-5 sm:h-6 sm:w-6" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((prev) => ({ ...prev, email: "" }));
              }}
              placeholder="Masukkan Email"
              className={`w-full rounded-xl bg-slate-50 py-3 pl-11 pr-3 text-xs text-slate-900 shadow-sm placeholder:text-slate-500 transition-all focus:bg-white focus:outline-none min-[350px]:py-3.5 min-[350px]:pl-12 min-[350px]:text-sm sm:py-4 sm:pl-12 sm:text-base [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f8fafc_inset] [&:-webkit-autofill]:transition-none focus:[&:-webkit-autofill]:shadow-[0_0_0_1000px_#fff_inset]
                ${
                  fieldErrors.email
                    ? "border-2 border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                    : "border border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20"
                }
              `}
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1.5 text-[10px] text-red-400 sm:text-xs">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300 min-[350px]:text-sm">
              Kata Sandi
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-bold text-cyan-400 transition-colors hover:text-cyan-300 hover:underline min-[350px]:text-sm"
            >
              Lupa sandi?
            </Link>
          </div>

          <div
            className={`relative ${fieldErrors.password ? "text-red-500" : "text-cyan-500 focus-within:text-cyan-400"}`}
          >
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 transition-colors">
              <Lock className="h-[18px] w-[18px] min-[350px]:h-5 min-[350px]:w-5 sm:h-6 sm:w-6" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((prev) => ({ ...prev, password: "" }));
              }}
              placeholder="••••••••"
              className={`w-full rounded-xl bg-slate-50 py-3 pl-11 pr-11 text-xs text-slate-900 shadow-sm placeholder:text-slate-500 transition-all focus:bg-white focus:outline-none min-[350px]:py-3.5 min-[350px]:pl-12 min-[350px]:pr-12 min-[350px]:text-sm sm:py-4 sm:pl-12 sm:pr-12 sm:text-base [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f8fafc_inset] [&:-webkit-autofill]:transition-none focus:[&:-webkit-autofill]:shadow-[0_0_0_1000px_#fff_inset]
                ${
                  fieldErrors.password
                    ? "border-2 border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                    : "border border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20"
                }
              `}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4 text-slate-600 transition-colors hover:text-cyan-600"
            >
              {showPassword ? (
                <EyeOff className="h-[18px] w-[18px] min-[350px]:h-5 min-[350px]:w-5 sm:h-6 sm:w-6" />
              ) : (
                <Eye className="h-[18px] w-[18px] min-[350px]:h-5 min-[350px]:w-5 sm:h-6 sm:w-6" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-1.5 text-[10px] text-red-400 sm:text-xs">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-cyan-400/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 min-[350px]:py-3.5 sm:py-4"
        >
          <span className="flex items-center justify-center gap-2.5">
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white min-[350px]:h-5 min-[350px]:w-5 sm:h-5 sm:w-5" />
            ) : (
              <span className="text-sm tracking-wide sm:text-base">
                Masuk
              </span>
            )}
          </span>
        </button>

        <p className="mt-5 text-center text-xs text-slate-400 min-[350px]:text-sm sm:mt-6">
          Belum memiliki akun?
          <Link
            to="/register"
            className="ml-1.5 font-bold text-cyan-400 transition-colors hover:text-cyan-300 hover:underline"
          >
            Daftar Sekarang
          </Link>
        </p>
      </form>

      {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
        <div className="-mt-6 sm:-mt-7">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-white/5" />
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500 min-[350px]:text-xs">
              <span className="h-1 w-1 rounded-full bg-cyan-400/70" />
              atau
              <span className="h-1 w-1 rounded-full bg-cyan-400/70" />
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-white/15 to-white/5" />
          </div>
          <GoogleLogin label="Login dengan Google" onError={setGeneralError} />
        </div>
      )}
    </div>
  );
}

export default LoginForm;
