import { useState } from "react"
import ProfileAvatar from "./ProfileAvatar"
import ProfileInformation from "./ProfileInformation"
import ProfilePassword from "./ProfilePassword"
import ProfileAction from "./ProfileAction"

const initialProfileData = {
  avatar: null, // File object
  name: "",
  email: "",
  nim: "",
  jurusan: "",
}

const initialPasswordData = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
}

function ProfileForm() {
  const [profileData, setProfileData] = useState(initialProfileData)
  const [passwordData, setPasswordData] = useState(initialPasswordData)

  function updateProfileField(field, value) {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  function updatePasswordField(field, value) {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit() {
    // sementara cuma log dulu, belum ada backend
    console.log("Update profile:", profileData)
    if (passwordData.newPassword) {
      console.log("Update password:", passwordData)
    }
  }

  return (
    <section className="relative bg-brand-dark px-4 py-12 md:px-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <ProfileAvatar
          value={profileData.avatar}
          onChange={(file) => updateProfileField("avatar", file)}
        />

        <ProfileInformation
          profileData={profileData}
          updateProfileField={updateProfileField}
        />

        <ProfilePassword
          passwordData={passwordData}
          updatePasswordField={updatePasswordField}
        />

        <ProfileAction
          profileData={profileData}
          passwordData={passwordData}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  )
}

export default ProfileForm
