import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import api from "../../../../services/api";
import logo from "../../../../assets/icons/logo.webp";
import FormAlert from "../../../ui/FormAlert";

function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Email tidak boleh kosong.");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Format email tidak valid (contoh: nama@email.com).");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      localStorage.setItem("resetEmail", email);
      localStorage.setItem("verifyType", "reset");
      navigate("/verify-code");
    } catch (error) {
      setLoading(false);
      setGeneralError(
        error.response?.data?.message ||
          "Gagal mengirim email verifikasi. Silakan coba lagi.",
      );
    }
  };

  return (
    <div className="flex w-full flex-col justify-center px-4 py-5 sm:p-10 lg:w-1/2 lg:px-16 lg:py-12 2xl:px-20">
      <div className="mb-8 flex items-center justify-between sm:mb-12 lg:hidden">
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
          to="/login"
          aria-label="Kembali"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 shadow-sm backdrop-blur-md transition hover:text-cyan-300 sm:h-10 sm:w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold leading-tight text-white sm:text-4xl">
          Lupa <span className="text-cyan-300">Password</span>
        </h2>
        <p className="mt-1.5 text-xs text-slate-400 min-[350px]:text-sm sm:mt-2 sm:text-base">
          Masukkan email yang terdaftar. Kami akan mengirim kode verifikasi.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="my-10 sm:my-14" noValidate>
        <FormAlert message={generalError} type="error" />

        <div className="mb-4 sm:mb-6">
          <label className="mb-1.5 block text-xs font-medium text-slate-300 min-[350px]:text-sm">
            Email
          </label>

          <div
            className={`relative ${emailError ? "text-red-500" : "text-cyan-500 focus-within:text-cyan-400"}`}
          >
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 transition-colors">
              <Mail className="h-[18px] w-[18px] min-[350px]:h-5 min-[350px]:w-5 sm:h-6 sm:w-6" />
            </div>

            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              placeholder="Masukkan Email"
              className={`w-full rounded-xl bg-slate-50 py-3 pl-11 pr-3 text-xs text-slate-900 shadow-sm placeholder:text-slate-500 transition-all focus:bg-white focus:outline-none min-[350px]:py-3.5 min-[350px]:pl-12 min-[350px]:text-sm sm:py-4 sm:pl-12 sm:text-base [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f8fafc_inset] [&:-webkit-autofill]:transition-none focus:[&:-webkit-autofill]:shadow-[0_0_0_1000px_#fff_inset] ${
                emailError
                  ? "border-2 border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                  : "border border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20"
              }`}
            />
          </div>

          {emailError && (
            <p className="mt-1.5 text-[10px] text-red-400 sm:text-xs">
              {emailError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-70 min-[350px]:py-3.5 sm:py-4"
        >
          <span className="flex items-center justify-center gap-2">
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white min-[350px]:h-5 min-[350px]:w-5 sm:h-5 sm:w-5" />
            ) : (
              <span className="text-sm tracking-wide sm:text-base">
                Kirim Kode Verifikasi
              </span>
            )}
          </span>
        </button>
      </form>

      <p className="-mt-6 sm:-mt-8 lg:-mt-10 text-center text-xs text-slate-400 min-[350px]:text-sm">
        Ingat password?
        <Link
          to="/login"
          className="ml-1.5 font-bold text-cyan-400 transition-colors hover:text-cyan-300 hover:underline"
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}

export default ForgotPasswordForm;
