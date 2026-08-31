import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { getRedirectFrom } from "../../utils/redirectFrom";

function GoogleLogo({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

let gsiPromise = null;

function loadGsi() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (gsiPromise) return gsiPromise;
  gsiPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(window.google);
    s.onerror = () => {
      gsiPromise = null;
      reject(new Error("Gagal memuat Google Sign-In"));
    };
    document.head.appendChild(s);
  });
  return gsiPromise;
}

export default function GoogleLogin({ onError, label = "Lanjutkan dengan Google" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const cbRef = useRef(null);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    cbRef.current = async (response) => {
      const idToken = response?.credential;
      if (!idToken) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await api.post("/auth/google", { idToken });
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
        setLoading(false);
        if (onError) {
          onError(
            err.response?.data?.message ||
              "Gagal masuk dengan Google. Silakan coba lagi.",
          );
        }
      }
    };
  }, [onError, login, location, navigate]);

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;
    loadGsi()
      .then((google) => {
        if (cancelled) return;
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => cbRef.current(response),
          auto_select: false,
        });
      })
      .catch(() => {
        if (!cancelled && onError) {
          onError("Gagal memuat Google Sign-In. Periksa koneksi internet.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, onError]);

  function handleClick() {
    setLoading(true);
    window.google?.accounts?.id?.prompt(() => {});
  }

  if (!clientId) return null;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="group relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl border border-slate-300/80 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-400 hover:cursor-pointer hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:py-4"
      >
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-50 via-white to-blue-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {loading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-500" />
            <span className="relative">Menghubungkan ke Google...</span>
          </>
        ) : (
          <>
            <GoogleLogo className="relative h-5 w-5 shrink-0" />
            <span className="relative">{label}</span>
          </>
        )}
      </button>
    </div>
  );
}
