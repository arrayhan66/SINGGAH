import { useState } from "react"
import { useAuth } from "../../../../context/AuthContext"
import ProfileAvatar from "./ProfileAvatar"
import ProfileInformation from "./ProfileInformation"
import ProfileAccountInfo from "./ProfileAccountInfo"
import ProfileStats from "./ProfileStats"
import ProfilePassword from "./ProfilePassword"
import ProfileDangerZone from "./ProfileDangerZone"
import ProfileAction from "./ProfileAction"
import ProfileVerification from "./ProfileVerification"
import GlowBackground from "../../../ui/GlowBackground"
import DustBackground from "../../../ui/DustBackground"

function ProfileForm({ isAdmin = false }) {
  const { user } = useAuth()

  const [profileData, setProfileData] = useState(() => ({
    avatar: null,
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    nim_nip: user?.nim_nip || "",
  }))

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [originalAvatarUrl, setOriginalAvatarUrl] = useState(
    user?.avatar || null,
  )

  const [identitasPhoto, setIdentitasPhoto] = useState(null)
  const [originalIdentitasUrl, setOriginalIdentitasUrl] = useState(
    user?.identitas_photo || null,
  )

  function updateProfileField(field, value) {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  function updatePasswordField(field, value) {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
  }

  function handleAvatarRemoved() {
    setProfileData((prev) => ({ ...prev, avatar: null }))
    setOriginalAvatarUrl(null)
  }

  function handleIdentitasChange(file) {
    setIdentitasPhoto(file)
    setOriginalIdentitasUrl(null)
  }

  function handleIdentitasRemoved() {
    setIdentitasPhoto(null)
    setOriginalIdentitasUrl(null)
  }

  function resetPasswordData() {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  return (
    <section className="relative overflow-hidden bg-brand-dark px-4 py-12 md:px-12">
      {!isAdmin && (
        <>
          <GlowBackground />
          <DustBackground />
        </>
      )}

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-8">
        <ProfileAvatar
          value={profileData.avatar}
          existingUrl={originalAvatarUrl}
          onChange={(file) => updateProfileField("avatar", file)}
          onRemove={handleAvatarRemoved}
        />

        <ProfileInformation
          profileData={profileData}
          updateProfileField={updateProfileField}
          userTipe={user?.tipe}
          pendingEmail={user?.pending_email}
          identitasPhoto={identitasPhoto}
          identitasUrl={originalIdentitasUrl}
          onIdentitasChange={handleIdentitasChange}
          onIdentitasRemove={handleIdentitasRemoved}
        />

        <ProfileVerification />

        <ProfileAccountInfo />

        {user?.tipe !== "umum" && <ProfileStats />}

        <ProfilePassword
          passwordData={passwordData}
          updatePasswordField={updatePasswordField}
        />

        <ProfileDangerZone />

        <ProfileAction
          profileData={profileData}
          passwordData={passwordData}
          onResetPassword={resetPasswordData}
          identitasPhoto={identitasPhoto}
        />
      </div>
    </section>
  )
}

export default ProfileForm
