import { useAuth } from "../context/AuthContext"

function RoleSplit({ admin, visitor }) {
  const { user } = useAuth()

  if (user?.role === "admin") return admin
  return visitor
}

export default RoleSplit
