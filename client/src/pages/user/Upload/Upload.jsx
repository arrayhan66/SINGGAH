import UserLayout from "../../../layouts/UserLayout"
import UploadHero from "../../../components/sections/user/Upload/UploadHero"
import UploadForm from "../../../components/sections/user/Upload/UploadForm"

export default function Upload() {
  return (
    <UserLayout>
      <UploadHero />
      <UploadForm />
    </UserLayout>
  )
}
