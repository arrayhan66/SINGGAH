import UserLayout from "../../../layouts/UserLayout"
import UploadHero from "../../../components/sections/user/Upload/UploadHero"
import UploadForm from "../../../components/sections/user/Upload/UploadForm"
import "../../../styles/user-light.css"

export default function Upload() {
  return (
    <div className="user-page light-page">
      <UserLayout>
        <UploadHero />
        <UploadForm />
      </UserLayout>
    </div>
  )
}
