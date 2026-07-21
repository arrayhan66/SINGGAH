import { createContext, useContext, useState } from "react"

const UserContext = createContext()

const initialUsers = [
  {
    id: 1,
    name: "Muhammad Raihan",
    username: "raihan",
    email: "raihan@gmail.com",
    role: "Admin",
    status: "Aktif",
    avatar: "https://i.pravatar.cc/300?img=1",
    joinedAt: "12 Juli 2026",
    projectCount: 12,
  },
  {
    id: 2,
    name: "Budi Santoso",
    username: "budi",
    email: "budi@gmail.com",
    role: "Mahasiswa",
    status: "Aktif",
    avatar: "https://i.pravatar.cc/300?img=2",
    joinedAt: "10 Juli 2026",
    projectCount: 5,
  },
]

export function UserProvider({ children }) {
  const [userList, setUserList] = useState(initialUsers)

  function addUser(user) {
    setUserList((prev) => [
      ...prev,
      {
        id: Date.now(),
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

  return (
    <UserContext.Provider
      value={{
        userList,
        addUser,
        updateUser,
        deleteUser,
        getUserById,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUsers() {
  return useContext(UserContext)
}
