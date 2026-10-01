import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { UserX } from "lucide-react"
import PopupToast from "./PopupToast"

const AUTO_CLOSE_MS = 4000

function UserDeletedModal({
  isOpen,
  userName = "",
  redirectPath = null,
  onClose,
}) {
  const navigate = useNavigate()
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setLeaving(false)
    if (!redirectPath) return
    const timer = setTimeout(() => {
      navigate(redirectPath)
      onClose?.()
    }, AUTO_CLOSE_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  function handleClose() {
    if (leaving) return
    setLeaving(true)
    setTimeout(() => onClose?.(), 250)
  }

  if (!isOpen) return null

  return (
    <PopupToast
      show={isOpen}
      variant="success"
      onClose={handleClose}
      duration={AUTO_CLOSE_MS}
    >
      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/20">
            <UserX className="h-4.5 w-4.5 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="pt-1 text-sm font-semibold text-emerald-300">
              Berhasil Hapus Akun
            </h3>
            <p className="mt-0.5 min-w-0 break-words text-xs text-slate-400">
              {userName ? (
                <>
                  Akun{" "}
                  <span className="font-medium text-slate-200">
                    &quot;{userName}&quot;
                  </span>{" "}
                  beserta seluruh data karya, komentar, dan like sudah dihapus
                  permanen.
                </>
              ) : (
                "Akun beserta seluruh data karya, komentar, dan like sudah dihapus permanen."
              )}
            </p>
          </div>
        </div>
      </div>
    </PopupToast>
  )
}

export default UserDeletedModal
