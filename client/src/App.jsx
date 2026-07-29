import AppRoutes from "./routes/AppRouter"
import { BeritaProvider } from "./context/BeritaContext"
import { UserProvider } from "./context/UserContext"
import { ProjectProvider } from "./context/ProjectContext"

function App() {
  return (
    <UserProvider>
      <ProjectProvider>
        <BeritaProvider>
          <AppRoutes />
        </BeritaProvider>
      </ProjectProvider>
    </UserProvider>
  )
}

export default App
