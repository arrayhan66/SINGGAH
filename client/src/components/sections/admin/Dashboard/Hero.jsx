import { useState } from "react"
import { LayoutDashboard, Megaphone, ArrowRight } from "lucide-react"
import { useAuth } from "../../../../context/AuthContext"
import AdminHeroBackground from "../../../ui/AdminHeroBackground"
import DashboardStats from "./DashboardStats"
import AnnouncementModal from "../../../ui/AnnouncementModal"
import { sendAnnouncement } from "../../../../services/notificationService"

function AdminHero() {
  const { user } = useAuth()
  const name = user?.name || "Admin"
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const [announceError, setAnnounceError] = useState("")
  const [announceSuccess, setAnnounceSuccess] = useState("")
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false)

  const handleSendAnnouncement = async ({ title, message, audience }) => {
    setAnnounceError("")
    setAnnounceSuccess("")
    setIsSendingAnnouncement(true)
    try {
      const result = await sendAnnouncement({ title, message, audience })
      setAnnounceSuccess(
        `Pengumuman terkirim ke ${result?.affected ?? 0} pengguna`,
      )
    } catch (err) {
      setAnnounceError(err?.response?.data?.message || "Gagal mengirim pengumuman")
    } finally {
      setIsSendingAnnouncement(false)
    }
  }

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Selamat Pagi" : hour < 17 ? "Selamat Siang" : "Selamat Sore"

  const quickActions = [
    {
      label: "Pengumuman",
      icon: Megaphone,
      onOpen: () => {
        setAnnounceError("")
        setAnnounceSuccess("")
        setShowAnnouncement(true)
      },
    },
  ]

  return (
    <>
      <AdminHeroBackground fullWidth>
        <div className="px-4 min-[260px]:px-3 pt-5 min-[260px]:pt-5 pb-1 md:px-6 md:pt-6">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-3 sm:gap-4">
          <div className="dashboard-hero-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 sm:h-16 sm:w-16">
            <LayoutDashboard className="h-7 w-7 text-cyan-300 sm:h-8 sm:w-8" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
              {greeting}
              <span className="hidden min-[400px]:inline">, </span>
              <br className="min-[400px]:hidden" />
              <span className="text-cyan-300">{name}</span>
            </h1>
<p className="mt-1 text-sm text-slate-400 max-w-xl">
              Kelola karya, berita, dan aktivitas SINGGAH
            </p>
          </div>
        </div>

        <div className="mt-5 min-[260px]:mt-4 md:mt-6 flex flex-wrap items-center gap-2.5 min-[260px]:gap-2 md:gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={action.onOpen}
                className="dashboard-quickaction-card group flex w-auto cursor-pointer items-center justify-start gap-2 rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.08] to-white/[0.02] px-3 py-1.5 transition-all duration-200 active:translate-y-0"
              >
                <span className="quickaction-icon flex h-7 w-7 min-[260px]:h-6 min-[260px]:w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 shadow-md shadow-cyan-500/20 transition-transform duration-200 group-hover:scale-110">
                  <Icon size={14} strokeWidth={2} className="text-white" />
                </span>
                <span className="quickaction-label text-xs min-[260px]:text-[11px] font-semibold tracking-tight text-white transition-colors duration-200">
                  {action.label}
                </span>
                <span className="quickaction-arrow ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-400 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                  <ArrowRight size={12} strokeWidth={2.5} />
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <DashboardStats />
      </AdminHeroBackground>

      {showAnnouncement && (
        <AnnouncementModal
          onSend={handleSendAnnouncement}
          onClose={() => setShowAnnouncement(false)}
          isSending={isSendingAnnouncement}
          error={announceError}
          success={announceSuccess}
        />
      )}
    </>
  )
}

export default AdminHero
