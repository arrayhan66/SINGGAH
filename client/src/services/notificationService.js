import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:5000/api",
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function getNotifications(page = 1, limit = 10) {
  const { data } = await api.get("/notifications", {
    params: { page, limit },
  })
  return data.data
}

export async function markAsRead(id) {
  const { data } = await api.patch(`/notifications/${id}/read`)
  return data.data
}

export async function markAllAsRead() {
  const { data } = await api.patch("/notifications/read-all")
  return data.data
}
