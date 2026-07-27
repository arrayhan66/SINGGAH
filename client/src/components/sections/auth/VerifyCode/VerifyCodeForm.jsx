import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import logo from "../../../../assets/icons/logo.png";
import FormAlert from "../../../ui/FormAlert";
import api from "../../../../services/api";

function VerifyCodeForm() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const inputs = useRef([]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => {
        setAlert({ message: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.message]);

  const handleChange = (e, index) => {
    setAlert({ message: "", type: "" });
    const value = e.target.value;

    if (value === "") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    if (value.length > 1 && /^\d+$/.test(value)) {
      const pasted = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pasted.forEach((num, i) => {
        if (index + i < 6) newOtp[index + i] = num;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pasted.length, 5);
      inputs.current[nextIndex]?.focus();
      return;
    }

    const lastChar = value.slice(-1);
    if (!/^\d$/.test(lastChar)) return;

    const newOtp = [...otp];
    newOtp[index] = lastChar;
    setOtp(newOtp);

    if (index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        e.preventDefault();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputs.current[index + 1]?.focus();
    }
  };

  const handleFocus = (index) => {
    const firstEmptyIndex = otp.findIndex((val) => val === "");
    if (firstEmptyIndex !== -1 && index > firstEmptyIndex) {
      inputs.current[firstEmptyIndex]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    setAlert({ message: "", type: "" });

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    pasted.split("").forEach((num, i) => {
      newOtp[i] = num;
    });
    setOtp(newOtp);

    const nextIndex = Math.min(pasted.length, 5);
    if (pasted.length < 6) {
      inputs.current[nextIndex]?.focus();
    } else {
      inputs.current[5]?.focus();
    }
  };

  const verifyType = localStorage.getItem("verifyType") || "reset";
  const currentEmail =
    verifyType === "register"
      ? localStorage.getItem("registerEmail")
      : localStorage.getItem("resetEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ message: "", type: "" });

    const otpString = otp.join("");

    if (otp.some((digit) => digit === "")) {
      setAlert({
        message: "Masukkan 6 digit kode verifikasi dengan lengkap.",
        type: "error",
      });
      return;
    }

    if (!currentEmail) {
      setAlert({
        message: "Sesi hilang. Silakan ulangi proses.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      if (verifyType === "register") {
        await api.post("/verify-email", {
          code: otpString,
          email: currentEmail,
        });
        localStorage.removeItem("registerEmail");
        localStorage.removeItem("verifyType");
        setLoading(false);
        navigate("/login");
      } else {
        await api.post("/verify-reset-code", {
          code: otpString,
          email: currentEmail,
        });
        localStorage.setItem("otpVerified", "true");
        setLoading(false);
        navigate("/reset-password");
      }
    } catch (error) {
      setLoading(false);
      setAlert({
        message:
          error.response?.data?.message ||
          "Kode verifikasi salah atau kedaluwarsa.",
        type: "error",
      });
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    if (!currentEmail) {
      setAlert({
        message: "Sesi hilang. Silakan ulangi proses.",
        type: "error",
      });
      return;
    }

    setIsResending(true);
    setAlert({ message: "", type: "" });

    try {
      if (verifyType === "register") {
        await api.post("/resend-verification", {
          email: currentEmail,
        });
      } else {
        await api.post("/forgot-password", { email: currentEmail });
      }

      setIsResending(false);
      setCountdown(60);
      setAlert({ message: "Kode baru berhasil dikirim!", type: "success" });
    } catch (error) {
      setIsResending(false);
      setAlert({
        message:
          error.response?.data?.message ||
          "Gagal mengirim ulang kode. Silakan coba lagi.",
        type: "error",
      });
    }
  };

  return (
    <div className="flex w-full flex-col justify-center overflow-y-auto px-4 py-5 sm:p-10 lg:w-1/2 lg:px-16 lg:py-12 2xl:px-20">
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
          to="/forgot-password"
          aria-label="Kembali"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 shadow-sm backdrop-blur-md transition hover:text-cyan-300 sm:h-10 sm:w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold leading-tight text-white sm:text-4xl">
          Verifikasi <span className="text-cyan-300">Kode</span>
        </h2>
        <p className="mt-1.5 text-xs text-slate-400 min-[350px]:text-sm sm:mt-2 sm:text-base">
          Masukkan 6 digit kode dari email Anda.
        </p>

        <div className="mx-auto mt-3 flex w-fit items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400/90 shadow-sm sm:px-3 sm:py-1.5 sm:text-sm">
          <Clock className="h-3.5 w-3.5 min-[350px]:h-4 min-[350px]:w-4" />
          <span>Kode ini hanya berlaku selama 15 menit.</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="my-10 sm:my-14" noValidate>
        {alert.message && (
          <FormAlert message={alert.message} type={alert.type} />
        )}

        <div
          className="mx-auto mt-4 flex w-full max-w-[380px] justify-center gap-1 min-[280px]:gap-1.5 min-[320px]:gap-2"
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onClick={() => handleFocus(index)}
              onFocus={() => handleFocus(index)}
              className={`h-10 w-8 shrink-0 rounded-lg bg-slate-50 text-center text-base font-bold text-slate-900 shadow-sm transition-all focus:bg-white focus:outline-none min-[320px]:h-11 min-[320px]:w-9 min-[350px]:h-12 min-[350px]:w-10 min-[350px]:rounded-xl min-[350px]:text-xl min-[400px]:h-12 min-[400px]:w-12 sm:h-14 sm:w-14
                ${
                  alert.type === "error"
                    ? "border-2 border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                    : "border border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20"
                }
              `}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative mx-auto mt-6 block w-full max-w-[380px] cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-70 min-[350px]:mt-8 min-[350px]:py-3.5 sm:py-4"
        >
          <span className="flex items-center justify-center gap-2">
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white min-[350px]:h-5 min-[350px]:w-5 sm:h-5 sm:w-5" />
            ) : (
              <span className="text-sm tracking-wide sm:text-base">
                Verifikasi
              </span>
            )}
          </span>
        </button>
      </form>

      <div className="-mt-6 sm:-mt-8 lg:-mt-10 flex items-center justify-center gap-1.5 text-xs text-slate-400 min-[350px]:text-sm sm:mt-8">
        <span>Belum menerima kode?</span>
        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
          className={`inline-flex items-center gap-1.5 font-bold transition-all duration-300 ${
            countdown > 0 || isResending
              ? "cursor-not-allowed text-slate-500"
              : "cursor-pointer text-cyan-400 hover:scale-105 hover:text-cyan-300 hover:underline hover:underline-offset-2 active:scale-95"
          }`}
        >
          {isResending ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-500/30 border-t-slate-500" />
              <span>Mengirim...</span>
            </>
          ) : countdown > 0 ? (
            `Tunggu ${countdown}s`
          ) : (
            "Kirim ulang"
          )}
        </button>
      </div>
    </div>
  );
}

export default VerifyCodeForm;
