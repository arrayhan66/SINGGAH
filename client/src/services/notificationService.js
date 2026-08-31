import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
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

export async function markAsUnread(id) {
  const { data } = await api.patch(`/notifications/${id}/unread`)
  return data.data
}

export async function markAllAsRead() {
  const { data } = await api.patch("/notifications/read-all")
  return data.data
}

export async function deleteNotification(id) {
  const { data } = await api.delete(`/notifications/${id}`)
  return data.data
}

export async function deleteAllNotifications() {
  const { data } = await api.delete("/notifications/all")
  return data.data
}

export async function bulkUpdateNotifications(ids, action) {
  const { data } = await api.post("/notifications/bulk", { ids, action })
  return data.data
}

export async function bulkDeleteNotifications(ids) {
  const { data } = await api.delete("/notifications/bulk", { data: { ids } })
  return data.data
}

export async function sendAnnouncement({ title, message, audience }) {
  const { data } = await api.post("/notifications/announcements", {
    title,
    message,
    audience,
  })
  return data.data
}
