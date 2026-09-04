import { createElement, useEffect, useState } from "react";
import { X, ArrowUpRight, CalendarClock, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  formatFullDate,
  notifIcon,
  notifBg,
  notifText,
  notifTypeLabel,
} from "../../utils/notificationHelpers";
import { imageUrl } from "../../utils/imageUrl";

const tipeLabel = {
  admin: "Admin",
  mahasiswa: "Mahasiswa",
  dosen: "Dosen",
  umum: "Umum",
};

function NotificationDetailModal({ notif, onClose, onNavigate }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const referenceType = notif.reference_type;
  const referenceId = notif.reference_id;

  const isSelfUser = referenceType === "user" && !isAdmin;
  const hasReference =
    Boolean(referenceType && referenceId) && !isSelfUser;

  const [reference, setReference] = useState(null);
  const [loadingRef, setLoadingRef] = useState(hasReference);
  const [refFailed, setRefFailed] = useState(false);

  const endpoint = !hasReference
    ? null
    : referenceType === "project"
      ? `/projects/${referenceId}`
      : referenceType === "news"
        ? `/news/${referenceId}`
        : `/users/${referenceId}`;

  useEffect(() => {
    const doc = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = doc.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlPos = doc.style.position;
    const prevBodyPos = body.style.position;
    const scrollY = window.scrollY;

    doc.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    doc.classList.add("no-scroll");

    const blockScroll = (e) => e.preventDefault();
    document.addEventListener("wheel", blockScroll, { passive: false });
    document.addEventListener("touchmove", blockScroll, { passive: false });

    return () => {
      doc.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.position = prevBodyPos;
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      doc.style.position = prevHtmlPos;
      doc.classList.remove("no-scroll");
      document.removeEventListener("wheel", blockScroll);
      document.removeEventListener("touchmove", blockScroll);
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    if (!endpoint) return;
    let active = true;
    api
      .get(endpoint)
      .then((res) => {
        if (!active) return;
        const d = res.data.data;
        if (referenceType === "project") {
          setReference({
            type: "project",
            title: d.title,
            image: d.thumbnail,
            subtitle: d.category ? `Karya • ${d.category}` : "Karya",
            path: isAdmin
              ? `/projects/edit/${d.slug || d.id}`
              : `/karya/${d.category || ""}/${d.slug || d.id}`,
          });
        } else if (referenceType === "news") {
          setReference({
            type: "news",
            title: d.title,
            image: d.headline_image,
            subtitle: "Berita",
            path: `/berita/${d.slug || d.id}`,
          });
        } else {
          setReference({
            type: "user",
            title: d.name,
            image: d.avatar,
            subtitle: [
              d.tipe ? tipeLabel[d.tipe] || d.tipe : null,
              d.pending_tipe
                ? `Menunggu verifikasi ${tipeLabel[d.pending_tipe] || d.pending_tipe}`
                : null,
              d.nim_nip || null,
            ]
              .filter(Boolean)
              .join(" • "),
            path: `/users/${d.username || d.id}`,
          });
        }
      })
      .catch(() => {
        if (active) setRefFailed(true);
      })
      .finally(() => {
        if (active) setLoadingRef(false);
      });
    return () => {
      active = false;
    };
  }, [endpoint, referenceType, isAdmin]);

  const selfReference = isSelfUser
    ? {
        type: "user",
        title: user?.name || "Akun Saya",
        image: user?.avatar,
        subtitle: user?.tipe ? tipeLabel[user.tipe] || user.tipe : "",
        path: "/profile",
      }
    : null;

  const shownRef = selfReference || reference;

  const fallbackPath = !referenceType
    ? null
    : referenceType === "project"
      ? isAdmin
        ? "/projects"
        : "/karya"
      : referenceType === "news"
        ? "/berita"
        : isAdmin
          ? "/users"
          : "/profile";

  const actionLabel = !referenceType
    ? null
    : referenceType === "project"
      ? isAdmin
        ? "Lihat Project"
        : "Lihat Karya"
      : referenceType === "news"
        ? "Lihat Berita"
        : isAdmin
          ? "Lihat Pengguna"
          : "Lihat Profil";

  const handleNavigate = () => {
    if (!actionLabel || !fallbackPath) return;
    onNavigate(shownRef ? shownRef.path : fallbackPath);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
      <div className="w-full max-w-[calc(100vw-2rem)] sm:max-w-md animate-modal-in overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-brand-navy to-brand-dark shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`notification-type-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${notifBg(notif.type)}`}
            >
              {createElement(notifIcon(notif.type), {
                size: 22,
                strokeWidth: 2.2,
                className: `${notifText(notif.type)} drop-shadow-[0_1px_2px_rgba(2,6,23,0.35)]`,
              })}
            </div>
            <div>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${notifBg(notif.type)} ${notifText(notif.type)}`}
              >
                {notifTypeLabel(notif.type)}
              </span>
              <p className="mt-1 text-xs text-slate-500">Detail Notifikasi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-5 py-5">
          <h3 className="text-lg font-semibold leading-snug text-white">
            {notif.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {notif.message}
          </p>

          {referenceType && (
            <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
              {loadingRef ? (
                <div className="flex items-center gap-2.5 py-2 text-xs text-slate-400">
                  <Loader2 size={14} className="animate-spin text-cyan-400" />
                  Memuat referensi...
                </div>
              ) : shownRef ? (
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 ${
                      shownRef.type === "user" ? "rounded-full" : ""
                    }`}
                  >
                    {shownRef.image ? (
                      <img
                        src={imageUrl(shownRef.image)}
                        alt={shownRef.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg text-slate-500">
                        {shownRef.type === "user" ? "👤" : "🗂️"}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-white">
                      {shownRef.title}
                    </p>
                    {shownRef.subtitle && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                        {shownRef.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="py-2 text-xs text-slate-400">
                  {refFailed
                    ? "Referensi tidak dapat dimuat."
                    : "Referensi tidak ditemukan."}
                </p>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <CalendarClock size={14} />
            <span>{formatFullDate(notif.created_at)}</span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 border-t border-white/10 px-5 py-4">
          {actionLabel ? (
            <button
              type="button"
              onClick={handleNavigate}
              disabled={loadingRef}
              className="notification-detail-cta flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-semibold text-brand-dark shadow-lg shadow-cyan-500/20 transition hover:from-cyan-300 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLabel}
              <ArrowUpRight size={16} />
            </button>
          ) : (
            <div className="flex-1" />
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationDetailModal;
