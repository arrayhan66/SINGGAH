export function getRedirectFrom(location) {
  if (!location?.state?.from) return ""
  const from = location.state.from
  const path =
    typeof from === "string"
      ? from
      : from.pathname + (from.search || "")
  if (!path || path === "/login" || path === "/register") return ""
  return path
}
