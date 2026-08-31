import { useState, useEffect, Fragment, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  AtSign,
  Mail,
  Lock,
  EyeOff,
  Eye,
  CreditCard,
  ImagePlus,
  Camera,
  Briefcase,
  GraduationCap,
  Users,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Hourglass,
} from "lucide-react";
import api from "../../../../services/api";
import GoogleLogin from "../../../ui/GoogleLoginButton";
import PopupToast from "../../../ui/PopupToast";

function RegisterForm() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrationClosed, setRegistrationClosed] = useState(false);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);

  useEffect(() => {
    api.get("/settings")
      .then((res) => {
        const data = res.data.data || {};
        if (data.registrationOpen === false) setRegistrationClosed(true);
        if (data.emailVerification === false) setRequireEmailVerification(false);
      })
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    role: "umum",
    nama: "",
    username: "",
    email: "",
    nim: "",
    password: "",
    confirmPassword: "",
  });

  const [fotoProfil, setFotoProfil] = useState(null);
  const [fotoIdentitas, setFotoIdentitas] = useState(null);
  const [fotoProfilPreview, setFotoProfilPreview] = useState(null);
  const [fotoIdentitasPreview, setFotoIdentitasPreview] = useState(null);

  const [emailCheck, setEmailCheck] = useState(null);
  const lastCheckedRef = useRef(null);

  useEffect(() => {
    if (step !== 2) {
      setEmailCheck(null);
      return;
    }

    const email = formData.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailCheck(null);
      return;
    }

    if (
      lastCheckedRef.current &&
      lastCheckedRef.current.email === email &&
      !lastCheckedRef.current.loading
    ) {
      setEmailCheck(lastCheckedRef.current.result);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      lastCheckedRef.current = { email, loading: true };
      setEmailCheck({ checking: true });
      try {
        const res = await api.post("/auth/check-email", { email });
        if (cancelled) return;
        lastCheckedRef.current = { email, loading: false, result: res.data.data };
        setEmailCheck(res.data.data);
      } catch {
        if (cancelled) return;
        lastCheckedRef.current = null;
        setEmailCheck(null);
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [formData.email, step]);

  const useEmailSuggestion = () => {
    if (!emailCheck?.suggestion) return;
    lastCheckedRef.current = null;
    setFormData((prev) => ({ ...prev, email: emailCheck.suggestion }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setFormData((prev) => ({
      ...prev,
      [name]: name === "username" ? value.toLowerCase() : value,
    }));
  };

  const handleFileChange = (e, setFileState, setPreview) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileState(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const nextStep = () => {
    if (step === 2) {
      if (!formData.nama || !formData.username || !formData.email) {
        setError("Nama, username, dan email wajib diisi.");
        return;
      }
      if (formData.nama.trim().length < 3) {
        setError("Nama minimal 3 karakter.");
        return;
      }
      if (!/^[a-zA-Z0-9_]{3,}$/.test(formData.username)) {
        setError(
          "Username minimal 3 karakter dan hanya boleh huruf, angka, dan underscore.",
        );
        return;
      }
    }
    if (step === 3) {
      if (formData.role === "mahasiswa" && !formData.nim) {
        setError("NIM wajib diisi untuk pendaftaran mahasiswa.");
        return;
      }
      if (
        (formData.role === "mahasiswa" || formData.role === "dosen") &&
        !fotoIdentitas
      ) {
        setError(
          formData.role === "mahasiswa"
            ? "Foto KTM wajib diunggah untuk pendaftaran mahasiswa."
            : "Foto Kartu Identitas wajib diunggah untuk pendaftaran dosen.",
        );
        return;
      }
    }
    setStep((prev) => prev + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.nama.trim().length < 3) {
      setError("Nama minimal 3 karakter.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Kata sandi tidak cocok!");
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,}$/.test(formData.username)) {
      setError(
        "Username minimal 3 karakter dan hanya boleh huruf, angka, dan underscore.",
      );
      return;
    }

    if (formData.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (!/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError("Password harus mengandung minimal 1 huruf besar dan 1 angka.");
      return;
    }

    setIsLoading(true);

    try {
      const fd = new FormData();
      fd.append("name", formData.nama);
      fd.append("username", formData.username);
      fd.append("email", formData.email);
      fd.append("password", formData.password);
      fd.append("tipe", formData.role);

      if (
        formData.role === "mahasiswa" ||
        formData.role === "dosen"
      ) {
        fd.append("nim_nip", formData.nim);
      }

      if (fotoProfil) {
        fd.append("avatar", fotoProfil);
      }

      if (
        (formData.role === "mahasiswa" || formData.role === "dosen") &&
        fotoIdentitas
      ) {
        fd.append("identitas_photo", fotoIdentitas);
      }

      await api.post("/auth/register", fd);

      if (requireEmailVerification) {
        localStorage.setItem("registerEmail", formData.email);
        localStorage.setItem("verifyType", "register");
        navigate("/verify-code");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Gagal mendaftar. Silakan coba lagi.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col justify-center px-3 py-6 sm:px-6 sm:py-8 md:px-12 md:py-12 lg:w-1/2 lg:px-20 2xl:px-24">
      <div className="w-full">
        {registrationClosed ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10">
              <AlertCircle className="h-8 w-8 text-amber-300" />
            </div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Pendaftaran Ditutup</h2>
            <p className="mt-3 text-sm text-slate-400">
              Saat ini pendaftaran akun baru sedang ditutup oleh admin. Silakan coba lagi nanti.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-500"
            >
              Kembali ke Login
            </Link>
          </div>
        ) : (
        <>
        <div className="mb-6 sm:mb-8 md:mb-12">
          <div className="mb-6 sm:mb-6 md:mb-8 w-full">
            <div className="flex w-full items-center px-0.5 sm:px-1 md:px-2">
              {[1, 2, 3, 4].map((i) => (
                <Fragment key={i}>
                  <div
                    className={`flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                      step >= i
                        ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                        : "bg-white text-cyan-600"
                    }`}
                  >
                    {step > i ? <CheckCircle2 size={16} /> : i}
                  </div>
                  {i < 4 && (
                    <div
                      data-step-connector
                      className={`mx-1 sm:mx-2 md:mx-3 h-1 flex-1 rounded-full transition-all duration-300 ${
                        step > i ? "bg-cyan-500" : "bg-white/90"
                      }`}
                    />
                  )}
                </Fragment>
              ))}
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-2xl md:text-3xl lg:text-4xl">
            {step === 1 && "Daftar Sebagai"}
            {step === 2 && "Informasi Dasar"}
            {step === 3 && "Lengkapi Identitas"}
            {step === 4 && "Keamanan Akun"}
          </h2>
          <p className="mt-2 text-xs leading-5 text-slate-400 sm:mt-2 sm:text-sm sm:leading-6 md:text-base">
            {step === 1 && "Pilih jenis akun yang ingin Anda daftarkan."}
            {step === 2 && "Gunakan email aktif untuk keperluan verifikasi."}
            {step === 3 &&
              (formData.role === "mahasiswa" || formData.role === "dosen"
                ? formData.role === "dosen"
                  ? "Lengkapi identitas Anda. Kartu Identitas dan Foto KTM wajib diunggah."
                  : "Lengkapi identitas Anda. NIM dan Foto KTM wajib diunggah."
                : "Lengkapi identitas akun Anda. Foto bersifat opsional.")}
            {step === 4 && "Buat kata sandi yang kuat dan mudah diingat."}
          </p>
        </div>

        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <div className="mb-6 sm:mb-7">
            <GoogleLogin onError={setError} />
            <p className="mt-2 text-center text-[11px] leading-4 text-slate-400 sm:text-xs">
              Daftar 1-klik dengan Google. Akun baru otomatis menjadi tipe{" "}
              <strong className="text-slate-300">Umum</strong> — kamu bisa
              upgrade ke Mahasiswa/Dosen nanti lewat halaman profil.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-white/5" />
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500 min-[350px]:text-xs">
                <span className="h-1 w-1 rounded-full bg-cyan-400/70" />
                atau daftar manual
                <span className="h-1 w-1 rounded-full bg-cyan-400/70" />
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent via-white/15 to-white/5" />
            </div>
          </div>
        )}

        <form onSubmit={handleRegister} noValidate className="flex flex-col gap-5 sm:gap-6 md:gap-8">
          {error && (
            <PopupToast
              show
              variant="danger"
              position="top-right"
              onClose={() => setError("")}
            >
              <div className="px-4 py-3.5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/20">
                    <AlertCircle className="h-4.5 w-4.5 text-red-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="pt-1 text-sm font-semibold text-white">
                      Gagal
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{error}</p>
                  </div>
                </div>
              </div>
            </PopupToast>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
              {[
                { id: "umum", label: "Umum", icon: Users },
                { id: "mahasiswa", label: "Mahasiswa", icon: GraduationCap },
                { id: "dosen", label: "Dosen", icon: Briefcase },
              ].map((item) => (
                <label
                  key={item.id}
                  data-role-card
                  className={`group relative flex min-h-24 sm:min-h-28 md:min-h-36 cursor-pointer flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4 overflow-hidden rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 text-center transition-all duration-300 ease-out hover:-translate-y-1.5 active:scale-[0.97] ${
                    formData.role === item.id
                      ? "border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400/40 ring-offset-2 ring-offset-slate-950"
                      : "border-white bg-white text-slate-800 shadow-sm hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700 hover:shadow-xl hover:shadow-cyan-400/15"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={item.id}
                    checked={formData.role === item.id}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span
                    className={`pointer-events-none absolute -bottom-8 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-cyan-400 blur-2xl transition-opacity duration-300 ${
                      formData.role === item.id
                        ? "opacity-40"
                        : "opacity-0 group-hover:opacity-15"
                    }`}
                  />
                  <item.icon
                    size={28}
                    className={`relative w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 transition-transform duration-300 ease-out ${
                      formData.role === item.id
                        ? "scale-110 text-cyan-300"
                        : "text-cyan-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:text-cyan-600"
                    }`}
                  />
                  <span className="relative text-sm sm:text-base font-semibold leading-none">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-slate-300">
                  Nama Lengkap
                </label>
                <div className="relative text-cyan-500 focus-within:text-cyan-400">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="nama"
                    required
                    value={formData.nama}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 sm:py-2.5 pl-9 sm:pl-10 pr-3 text-sm text-slate-900 shadow-sm focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20 [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f8fafc_inset] [&:-webkit-autofill]:transition-none focus:[&:-webkit-autofill]:shadow-[0_0_0_1000px_#fff_inset]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-slate-300">
                  Username
                </label>
                <div className="relative text-cyan-500 focus-within:text-cyan-400">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4">
                    <AtSign size={18} />
                  </div>
                  <input
                    type="text"
                    name="username"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Masukkan username"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 sm:py-2.5 pl-9 sm:pl-10 pr-3 text-sm text-slate-900 shadow-sm focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20 [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f8fafc_inset] [&:-webkit-autofill]:transition-none focus:[&:-webkit-autofill]:shadow-[0_0_0_1000px_#fff_inset]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-slate-300">
                  Email Aktif
                </label>
                <div className="relative text-cyan-500 focus-within:text-cyan-400">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Masukkan Email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 sm:py-3 pl-9 sm:pl-11 pr-4 text-sm text-slate-900 shadow-sm focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20 [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f8fafc_inset] [&:-webkit-autofill]:transition-none focus:[&:-webkit-autofill]:shadow-[0_0_0_1000px_#fff_inset]"
                  />
                </div>

                {emailCheck?.checking && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-500" />
                    Memeriksa ketersediaan email...
                  </p>
                )}

                {emailCheck?.domainValid === false && !emailCheck.checking && (
                  <div className="mt-2 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[11px] sm:text-xs bg-red-500/10 border-red-500/30 text-red-200">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>
                      Domain{" "}
                      <strong className="font-semibold text-white">
                        @{emailCheck.domain}
                      </strong>{" "}
                      tidak memiliki server email yang terdaftar. Pastikan kamu
                      mengetik alamat email aktif yang benar.
                    </span>
                  </div>
                )}

                {emailCheck?.domainValid === true && !emailCheck.checking && (
                  <p className="mt-1.5 text-[11px] sm:text-xs text-slate-400">
                    Kode verifikasi akan dikirim. Email palsu atau tidak terdaftar
                    (mis. gmail yang tidak ada) tidak akan menerima kodenya,
                    sehingga tidak bisa menyelesaikan pendaftaran.
                  </p>
                )}

                {emailCheck?.exists && !emailCheck.checking && (
                  <div className="mt-2 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[11px] sm:text-xs bg-amber-500/10 border-amber-500/30 text-amber-200">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>
                      {emailCheck.verified ? (
                        <>
                          Email{" "}
                          <strong className="font-semibold text-white">
                            {formData.email}
                          </strong>{" "}
                          sudah terdaftar dan aktif.{" "}
                          <Link
                            to="/login"
                            className="font-bold text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
                          >
                            Masuk
                          </Link>{" "}
                          jika ini memang akun kamu.
                        </>
                      ) : (
                        <>
                          Email{" "}
                          <strong className="font-semibold text-white">
                            {formData.email}
                          </strong>{" "}
                          sudah pernah didaftarkan (belum terverifikasi). Gunakan
                          email lain, atau cek kotak masuk email tersebut untuk
                          kode verifikasi yang pernah dikirim.
                        </>
                      )}
                    </span>
                  </div>
                )}

                {emailCheck?.suggestion && !emailCheck.checking && (
                  <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2.5 text-[11px] sm:text-xs text-cyan-200">
                    <span>
                      Mungkin maksud kamu:{" "}
                      <strong className="font-semibold break-all text-cyan-100">
                        {emailCheck.suggestion}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={useEmailSuggestion}
                      className="shrink-0 cursor-pointer rounded-lg bg-cyan-500/20 px-2.5 py-1 text-[11px] font-bold text-cyan-100 transition-colors hover:bg-cyan-500/30"
                    >
                      Gunakan
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6">
              {(formData.role === "mahasiswa" || formData.role === "dosen") && (
                <div className="flex items-center gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-xs sm:text-sm text-amber-200">
                  <Hourglass size={16} className="shrink-0" />
                  <span>
                    Pendaftaran sebagai{" "}
                    <strong className="text-amber-100">
                      {formData.role === "mahasiswa" ? "Mahasiswa" : "Dosen"}
                    </strong>{" "}
                    akan ditinjau admin terlebih dahulu. Tipe akun berubah setelah
                    data kamu disetujui.
                  </span>
                </div>
              )}

              {(formData.role === "mahasiswa" || formData.role === "dosen") && (
                <div>
                  <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-slate-300">
                    {formData.role === "mahasiswa"
                      ? "Nomor Induk Mahasiswa"
                      : "Nomor Induk Pegawai / NIDN (Opsional)"}
                  </label>
                  <div className="relative text-cyan-500 focus-within:text-cyan-400">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4">
                      <CreditCard size={18} />
                    </div>
                    <input
                      type="text"
                      name="nim"
                      required={formData.role === "mahasiswa"}
                      value={formData.nim}
                      onChange={handleChange}
                      placeholder={
                        formData.role === "mahasiswa"
                          ? "Masukkan NIM"
                          : "Masukkan Kartu Identitas (Opsional)"
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 sm:py-3 pl-9 sm:pl-11 pr-4 text-sm text-slate-900 shadow-sm focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20 [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f8fafc_inset] [&:-webkit-autofill]:transition-none focus:[&:-webkit-autofill]:shadow-[0_0_0_1000px_#fff_inset]"
                    />
                  </div>
                </div>
              )}

              <div
                className={`grid gap-10 sm:gap-5 ${
                  formData.role === "umum"
                    ? "grid-cols-1"
                    : "grid-cols-1 sm:grid-cols-2"
                }`}
              >
                <div className="min-w-0">
                  <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-slate-300">
                    Foto Profil
                  </label>
                  <label className="flex w-full h-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-4 sm:py-6 shadow-sm transition-all hover:border-cyan-500 hover:bg-white">
                    {fotoProfilPreview ? (
                      <div className="relative">
                        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-cyan-400/60 via-blue-500/30 to-blue-400/50 blur-[6px]" />
                        <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-white/90 shadow-lg shadow-cyan-500/20">
                          <img
                            src={fotoProfilPreview}
                            alt="Preview Foto Profil"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md transition-transform group-hover:scale-110">
                          <Camera size={14} />
                        </div>
                      </div>
                    ) : (
                      <div className="mb-1.5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-white/60 shadow-inner">
                        <ImagePlus className="h-8 w-8 text-cyan-500" size={20} />
                      </div>
                    )}
                    <span className={`max-w-full break-all px-2 text-center text-[10px] sm:text-xs text-slate-600 ${
                        fotoProfil ? "mt-3" : "mt-1.5"
                      }`}>
                      {fotoProfil ? "Ganti Foto" : "Unggah Pas Foto"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileChange(e, setFotoProfil, setFotoProfilPreview)
                      }
                      className="hidden"
                    />
                  </label>
                </div>

                {(formData.role === "mahasiswa" ||
                  formData.role === "dosen") && (
                  <div className="min-w-0">
                    <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-slate-300">
                      {formData.role === "mahasiswa"
                        ? "Foto KTM"
                        : "Kartu Identitas Dosen"}
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <label className="flex w-full h-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-3 py-5 sm:px-5 sm:py-7 shadow-sm transition-all hover:border-cyan-500 hover:bg-white">
                      {fotoIdentitasPreview ? (
                        <div className="relative mx-auto w-fit max-w-full">
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/60 via-blue-500/30 to-blue-400/50 blur-[6px]" />
                          <div className="relative flex items-center justify-center rounded-2xl p-2">
                            <img
                              src={fotoIdentitasPreview}
                              alt="Preview Foto Identitas"
                              className="max-h-40 w-auto max-w-full object-contain"
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md">
                            <Camera size={14} />
                          </div>
                        </div>
                      ) : (
                        <div className="mb-2 flex h-24 w-36 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 shadow-inner">
                          <ImagePlus className="h-8 w-8 text-cyan-500" size={20} />
                        </div>
                      )}

                      <span
                        className={`max-w-full break-all px-2 text-center text-[10px] sm:text-xs text-slate-600 ${
                          fotoIdentitas ? "mt-4" : "mt-2"
                        }`}
                      >
                        {fotoIdentitas
                          ? "Ganti Foto"
                          : formData.role === "mahasiswa"
                            ? "Unggah Foto KTM (wajib)"
                            : "Unggah Kartu Identitas Dosen (wajib)"}
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            setFotoIdentitas,
                            setFotoIdentitasPreview,
                          )
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-6">
              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-slate-300">
                  Kata Sandi
                </label>
                <div className="relative text-cyan-500 focus-within:text-cyan-400">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimal 8 karakter"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 sm:py-3 pl-9 sm:pl-11 pr-10 sm:pr-12 text-sm text-slate-900 shadow-sm focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 text-slate-500 hover:text-cyan-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-slate-300">
                  Konfirmasi Sandi
                </label>
                <div className="relative text-cyan-500 focus-within:text-cyan-400">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Ulangi kata sandi"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 sm:py-3 pl-9 sm:pl-11 pr-10 sm:pr-12 text-sm text-slate-900 shadow-sm focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 text-slate-500 hover:text-cyan-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 sm:mt-4 flex flex-col gap-2 sm:gap-3 md:flex-row">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="w-full sm:w-auto flex items-center justify-center cursor-pointer rounded-xl bg-slate-800 px-4 py-2.5 sm:py-3 text-xs sm:text-sm"
              >
                Kembali
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                data-next-button
                className="group flex w-full sm:flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-[background-position] duration-500 hover:bg-[position:100%_0] cursor-pointer"
              >
                Selanjutnya
                <ChevronRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex-1 overflow-hidden cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] py-3 sm:py-3.5 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-[background-position] duration-500 hover:bg-[position:100%_0] disabled:opacity-80"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <span className="flex items-center gap-2 text-sm sm:text-base">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Mendaftar...
                    </span>
                  ) : (
                    <span className="text-sm sm:text-base">Selesaikan Pendaftaran</span>
                  )}
                </span>
              </button>
            )}
          </div>
        </form>

        <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-slate-400">
          Sudah memiliki akun?
          <Link
            to="/login"
            className="ml-1.5 font-bold text-cyan-400 transition-colors hover:text-cyan-300 hover:underline"
          >
            Masuk
          </Link>
        </p>
        </>
        )}
      </div>
    </div>
  );
}

export default RegisterForm;
