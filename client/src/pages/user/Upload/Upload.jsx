import UserLayout from "../../../layouts/UserLayout"
import UploadHero from "../../../components/sections/user/Upload/UploadHero"
import UploadForm from "../../../components/sections/user/Upload/UploadForm"

function Upload() {
  return (
    <UserLayout>
      <UploadHero />
      <UploadForm />
    </UserLayout>
  )
}

export default Upload
