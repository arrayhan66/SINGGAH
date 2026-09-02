const loaders = {
  "/": () => import("../pages/Home/Home"),
  "/karya": () => import("../pages/Karya/Karya"),
  "/upload": () => import("../pages/user/Upload/Upload"),
  "/about": () => import("../pages/About/About"),
  "/berita": () => import("../pages/News/News"),
  "/profile": () => import("../pages/user/Profile/Profile"),
  "/karya-tersimpan": () => import("../pages/user/KaryaTersimpan/KaryaTersimpan"),
  "/my-karya": () => import("../pages/user/MyKarya/MyKarya"),
  "/login": () => import("../pages/auth/Login/Login"),
  "/hall": () => import("../pages/Hall/Hall"),
}

const started = {}

export function prefetchRoute(pathname) {
  const loader = loaders[pathname]
  if (!loader || started[pathname]) return
  started[pathname] = true
  loader().catch(() => {
    started[pathname] = false
  })
}

export function prefetchRouteFromLink(to) {
  const path = typeof to === "string" ? to : to?.pathname
  if (!path) return
  prefetchRoute(path.split("?")[0])
}