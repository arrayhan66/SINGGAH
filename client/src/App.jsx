import AppRoutes from "./routes/AppRouter"
import { BeritaProvider } from "./context/BeritaContext"
import { UserProvider } from "./context/UserContext"

function App() {
  return (
    <UserProvider>
      <BeritaProvider>
        <AppRoutes />
      </BeritaProvider>
    </UserProvider>
  )
}

export default App
