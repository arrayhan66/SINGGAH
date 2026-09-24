import AppRoutes from "./routes/AppRouter"
import { BeritaProvider } from "./context/BeritaContext"
import { UserProvider } from "./context/UserContext"
import { ProjectProvider } from "./context/ProjectContext"
import MaintenanceGate from "./components/MaintenanceGate"
import ToastHost from "./components/ui/ToastHost"
import { useEffect } from "react"
import api from "./services/api"

let visitSent = false

function App() {
  useEffect(() => {
    if (visitSent) return
    visitSent = true
    api.post("/stats/visit").catch(() => {})
  }, [])

  return (
    <UserProvider>
      <ProjectProvider>
        <BeritaProvider>
          <MaintenanceGate>
            <AppRoutes />
          </MaintenanceGate>
        </BeritaProvider>
      </ProjectProvider>
      <ToastHost />
    </UserProvider>
  )
}

export default App
