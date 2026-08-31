import { createContext, useContext, useState, useEffect, useCallback } from "react"
import api from "../services/api"
import { useAuth } from "./AuthContext"

const UserContext = createContext()

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const toDisplay = (user) => ({
  ...user,
  is_verified: Boolean(user.is_verified),
  status:
    user.status === "active"
      ? "Aktif"
      : user.status === "inactive"
        ? "Nonaktif"
        : user.status,
  role: user.role || "user",
})

const toApi = (payload) => {
  const { password, ...rest } = payload

  const cleaned = {
    ...rest,
    status:
      payload.status === "Aktif"
        ? "active"
        : payload.status === "Nonaktif"
          ? "inactive"
          : payload.status,
  }

  if (password && String(password).trim()) {
    cleaned.password = password
  }

  if (cleaned.avatar && String(cleaned.avatar).startsWith("blob:")) {
    delete cleaned.avatar
  }

  const hasFile = cleaned.avatar instanceof File || cleaned.identitas_photo instanceof File

  if (hasFile) {
    const fd = new FormData()
    for (const [key, value] of Object.entries(cleaned)) {
      if (value != null) {
        fd.append(key, value)
      }
    }
    return fd
  }

  return cleaned
}

const fetchAllUsers = async () => {
  const perPage = 100
  let page = 1
  let all = []

  while (true) {
    const res = await api.get("/users", { params: { page, limit: perPage } })
    const { items = [], pagination } = res.data.data || {}
    const rows = items || []
    all = all.concat(rows)
    const totalPages = pagination?.totalPages || 1
    if (page >= totalPages) break
    page += 1
  }

  return all
}

export function UserProvider({ children }) {
  const { user } = useAuth()
  const [userList, setUserList] = useState([])
  const [loading, setLoading] = useState(false)

  const isAdmin = user?.role === "admin"

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return
    setLoading(true)
    try {
      const all = await fetchAllUsers()
      setUserList(all.map(toDisplay))
    } catch (err) {
      console.error("Failed to fetch users:", err)
      setUserList([])
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) return
    fetchAllUsers()
      .then((all) => setUserList(all.map(toDisplay)))
      .catch((err) => {
        console.error("Failed to fetch users:", err)
        setUserList([])
      })
      .finally(() => setLoading(false))
  }, [isAdmin])

  async function addUser(user) {
    try {
      await api.post("/users", toApi({ ...user, username: user.username || slugify(user.name) }))
      await fetchUsers()
    } catch (err) {
      console.error("Failed to add user:", err)
      throw err
    }
  }

  async function updateUser(id, user) {
    try {
      await api.put(`/users/${id}`, toApi(user))
      await fetchUsers()
    } catch (err) {
      console.error("Failed to update user:", err)
      throw err
    }
  }

  async function deleteUser(id) {
    try {
      await api.delete(`/users/${id}`)
      await fetchUsers()
    } catch (err) {
      console.error("Failed to delete user:", err)
      throw err
    }
  }

  async function approveTipe(id) {
    try {
      await api.post(`/users/${id}/approve-tipe`, { approved: true })
      setUserList((prev) =>
        prev.map((u) =>
          u.id === Number(id)
            ? { ...u, tipe: u.pending_tipe || u.tipe, pending_tipe: null }
            : u,
        ),
      )
      fetchUsers().catch(() => {})
    } catch (err) {
      console.error("Failed to approve tipe:", err)
      throw err
    }
  }

  async function rejectTipe(id, reason = "") {
    try {
      await api.post(`/users/${id}/approve-tipe`, {
        approved: false,
        reason,
      })
      setUserList((prev) =>
        prev.map((u) =>
          u.id === Number(id)
            ? { ...u, pending_tipe: null, rejection_reason: reason }
            : u,
        ),
      )
      fetchUsers().catch(() => {})
    } catch (err) {
      console.error("Failed to reject tipe:", err)
      throw err
    }
  }

  function getUserById(id) {
    return userList.find((u) => u.id === Number(id))
  }

  function getUserByUsername(username) {
    return userList.find(
      (u) => String(u.username).toLowerCase() === String(username).toLowerCase(),
    )
  }

  async function fetchUserByUsername(username) {
    try {
      const res = await api.get("/users", {
        params: { username, limit: 1 },
      })
      const items = (res.data.data.items || res.data.data || []).map(toDisplay)
      const found = items[0]
      if (found) {
        setUserList((prev) => [
          ...prev.filter((u) => u.id !== found.id),
          found,
        ])
      }
      return found ? { ...found } : null
    } catch (err) {
      console.error("Failed to fetch user by username:", err)
      return null
    }
  }

  return (
    <UserContext.Provider
      value={{
        userList,
        loading,
        addUser,
        updateUser,
        deleteUser,
        approveTipe,
        rejectTipe,
        getUserById,
        getUserByUsername,
        fetchUserByUsername,
        refetchUsers: fetchUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUsers() {
  return useContext(UserContext)
}
