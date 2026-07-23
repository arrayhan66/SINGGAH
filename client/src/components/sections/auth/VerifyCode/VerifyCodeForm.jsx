import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "../../../../assets/icons/logo.png";

function VerifyCodeForm() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const inputs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;

    // 1. Jika kotak dikosongkan (hapus)
    if (value === "") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    // 2. Handle Paste / Autofill (kalau user masukin lebih dari 1 angka sekaligus)
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

    // 3. Normal typing: Ambil 1 digit terakhir biar ngetik mulus di laptop & HP
    const lastChar = value.slice(-1);
    if (!/^\d$/.test(lastChar)) return;

    const newOtp = [...otp];
    newOtp[index] = lastChar;
    setOtp(newOtp);

    // Otomatis pindah ke kotak kanan
    if (index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      // Hapus & mundur ke kiri otomatis kalau kotak saat ini kosong
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

    // Cegah user melompati kotak yang masih kosong
    if (firstEmptyIndex !== -1 && index > firstEmptyIndex) {
      inputs.current[firstEmptyIndex]?.focus();
    }
    // Udah nggak ada e.target.select() di sini, jadi nggak bakal nge-drag biru lagi!
  };

  const handlePaste = (e) => {
    e.preventDefault();
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (otp.some((item) => item === "")) {
      alert("Masukkan kode verifikasi terlebih dahulu.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate("/reset-password");
    }, 1500);
  };

  return (
    <div className="flex w-full flex-col justify-center overflow-y-auto p-4 min-[300px]:p-5 min-[350px]:p-8 sm:p-12 lg:w-1/2 lg:px-16 lg:py-10">
      <div className="mb-4 flex items-center justify-between min-[300px]:mb-6 lg:hidden">
        <Link
          to="/"
          className="flex items-center gap-1.5 min-[300px]:gap-2 min-[350px]:gap-3 transition-opacity hover:opacity-90"
        >
          <img
            src={logo}
            alt="Logo SINGGAH"
            className="h-6 w-6 min-[300px]:h-8 min-[300px]:w-8 min-[350px]:h-10 min-[350px]:w-10"
          />
          <span className="text-base font-black tracking-wide text-white min-[300px]:text-lg min-[350px]:text-2xl">
            SINGGAH
          </span>
        </Link>

        <Link
          to="/forgot-password"
          className="flex items-center gap-1 text-[10px] text-slate-400 transition hover:text-cyan-300 min-[300px]:gap-2 min-[300px]:text-xs min-[350px]:text-sm"
        >
          <ArrowLeft size={14} className="min-[350px]:h-4 min-[350px]:w-4" />
          <span className="hidden min-[400px]:inline">Kembali</span>
        </Link>
      </div>

      <div className="text-center">
        <h2 className="text-lg font-bold leading-tight text-white min-[300px]:text-2xl min-[350px]:text-3xl sm:text-4xl">
          Verifikasi <span className="text-cyan-300">Kode</span>
        </h2>

        <p className="mt-1.5 text-[10px] text-slate-400 min-[300px]:mt-2 min-[300px]:text-xs min-[350px]:text-sm sm:text-base">
          Masukkan 6 digit kode yang telah dikirim ke email Anda.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5 min-[300px]:mt-6 min-[350px]:mt-8"
      >
        <div
          className="mx-auto flex w-full max-w-[380px] justify-center gap-1 min-[280px]:gap-1.5 min-[320px]:gap-2 min-[400px]:gap-3"
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
              className="h-9 w-7 min-[280px]:h-10 min-[280px]:w-8 min-[320px]:h-11 min-[320px]:w-9 min-[350px]:h-12 min-[350px]:w-10 min-[400px]:h-14 min-[400px]:w-12 sm:h-14 sm:w-14 rounded-lg border border-slate-200 bg-slate-50 text-center text-sm font-bold text-slate-900 shadow-sm transition-all focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20 min-[300px]:text-base min-[350px]:rounded-xl min-[350px]:text-xl"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative mx-auto mt-6 block w-full max-w-[380px] cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] py-2.5 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-70 min-[350px]:mt-8 min-[350px]:py-4"
        >
          <span className="flex items-center justify-center gap-2">
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white min-[350px]:h-5 min-[350px]:w-5" />
            ) : (
              <span className="text-xs tracking-wide min-[300px]:text-sm min-[350px]:text-base">
                Verifikasi
              </span>
            )}
          </span>
        </button>
      </form>

      <p className="mt-5 text-center text-[10px] text-slate-400 min-[300px]:mt-6 min-[300px]:text-xs min-[350px]:mt-10 min-[350px]:text-sm lg:mt-8">
        Belum menerima kode?
        <button
          type="button"
          className="ml-1.5 font-bold text-cyan-400 transition-colors hover:text-cyan-300 min-[300px]:ml-2"
        >
          Kirim ulang
        </button>
      </p>
    </div>
  );
}

export default VerifyCodeForm;
