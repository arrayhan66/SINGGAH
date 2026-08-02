import { createContext, useContext, useState } from "react"

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

const initialUsers = [
  {
    id: 1,
    name: "Muhammad Raihan",
    username: "raihan",
    email: "raihan@gmail.com",
    role: "Admin",
    status: "Aktif",
    tipe: "admin",
    avatar: "https://i.pravatar.cc/300?img=1",
    is_verified: true,
    created_at: "2026-01-15T08:30:00Z",
    projectCount: 12,
  },
  {
    id: 2,
    name: "Budi Santoso",
    username: "budi",
    email: "budi@gmail.com",
    role: "Mahasiswa",
    status: "Aktif",
    tipe: "mahasiswa",
    avatar: "https://i.pravatar.cc/300?img=2",
    is_verified: true,
    created_at: "2026-03-10T10:00:00Z",
    projectCount: 5,
  },
  {
    id: 3,
    name: "Citra Dewi",
    username: "citra",
    email: "citra@gmail.com",
    role: "Mahasiswa",
    status: "Nonaktif",
    tipe: "mahasiswa",
    avatar: "https://i.pravatar.cc/300?img=5",
    is_verified: false,
    created_at: "2026-04-22T14:15:00Z",
    projectCount: 0,
  },
  {
    id: 4,
    name: "Dr. Ahmad Fauzi",
    username: "ahmadf",
    email: "ahmadf@gmail.com",
    role: "Admin",
    status: "Aktif",
    tipe: "dosen",
    avatar: "https://i.pravatar.cc/300?img=8",
    is_verified: true,
    created_at: "2025-11-05T09:00:00Z",
    projectCount: 8,
  },
  {
    id: 5,
    name: "Siti Nurhaliza",
    username: "sitin",
    email: "sitin@gmail.com",
    role: "Mahasiswa",
    status: "Aktif",
    tipe: "umum",
    avatar: "https://i.pravatar.cc/300?img=9",
    is_verified: false,
    created_at: "2026-06-01T16:45:00Z",
    projectCount: 2,
  },
]

export function UserProvider({ children }) {
  const [userList, setUserList] = useState(initialUsers)

  function addUser(user) {
    setUserList((prev) => [
      ...prev,
      {
        id: Date.now(),
        username: user.username || slugify(user.name),
        ...user,
      },
    ])
  }

  function updateUser(id, user) {
    setUserList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...user } : u)),
    )
  }

  function deleteUser(id) {
    setUserList((prev) => prev.filter((u) => u.id !== id))
  }

  function getUserById(id) {
    return userList.find((u) => u.id === Number(id))
  }

  function getUserByUsername(username) {
    return userList.find(
      (u) => String(u.username).toLowerCase() === String(username).toLowerCase(),
    )
  }

  return (
    <UserContext.Provider
      value={{
        userList,
        addUser,
        updateUser,
        deleteUser,
        getUserById,
        getUserByUsername,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUsers() {
  return useContext(UserContext)
}
