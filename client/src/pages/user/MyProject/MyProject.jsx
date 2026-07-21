import UserLayout from "../../../layouts/UserLayout"
import MyProjectHero from "../../../components/sections/user/MyProject/MyProjectHero"
import MyProjectStats from "../../../components/sections/user/MyProject/MyProjectStats"
import MyProjectList from "../../../components/sections/user/MyProject/MyProjectList"

function MyProject() {
  return (
    <UserLayout>
      <MyProjectHero />
      <MyProjectStats />
      <MyProjectList />
    </UserLayout>
  )
}

export default MyProject
