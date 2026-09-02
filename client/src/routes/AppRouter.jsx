import { lazy, Suspense, useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import { ProtectedRoute } from "./ProtectedRoute"
import { GuestRoute } from "./GuestRoute"
import { ResetFlowRoute } from "./ResetFlowRoute"
import RoleSplit from "./RoleSplit"
import ScrollToTop from "../components/layout/ScrolltoTop"
import { prefetch } from "../utils/prefetch"

const Hall = lazy(() => import("../pages/Hall/Hall"))
const Home = lazy(() => import("../pages/Home/Home"))
const News = lazy(() => import("../pages/News/News"))
const NewsDetail = lazy(() => import("../pages/News/NewsDetail"))
const About = lazy(() => import("../pages/About/About"))
const NotFound = lazy(() => import("../pages/NotFound/NotFound"))
const Karya = lazy(() => import("../pages/Karya/Karya"))
const KaryaDetail = lazy(() => import("../pages/Karya/KaryaDetail"))
const KaryaProjectDetail = lazy(() => import("../pages/Karya/KaryaProjectDetail"))
const Login = lazy(() => import("../pages/auth/Login/Login"))
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword/ForgotPassword"))
const Register = lazy(() => import("../pages/auth/Register/Register"))
const VerifyCode = lazy(() => import("../pages/auth/VerifyCode/VerifyCode"))
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword/ResetPassword"))
const UserUpload = lazy(() => import("../pages/user/Upload/Upload"))
const UserEditKarya = lazy(() => import("../pages/user/EditKarya/EditKarya"))
const UserMyKarya = lazy(() => import("../pages/user/MyKarya/MyKarya"))
const UserProfile = lazy(() => import("../pages/user/Profile/Profile"))
const UserKaryaTersimpan = lazy(() => import("../pages/user/KaryaTersimpan/KaryaTersimpan"))
const AdminHome = lazy(() => import("../pages/admin/Home/Home"))
const AdminProfile = lazy(() => import("../pages/admin/Profile/Profile"))
const AdminProjects = lazy(() => import("../pages/admin/ManageProjects/Projects"))
const AdminProjectDetail = lazy(() => import("../pages/admin/ManageProjects/AdminProjectDetail"))
const ProjectForm = lazy(() => import("../pages/admin/ManageProjects/ProjectForm"))
const AdminAddProjectView = lazy(() => import("../components/sections/admin/ManageProjects/AdminAddProjectView"))
const ManageNews = lazy(() => import("../pages/admin/ManageNews/Berita"))
const BeritaForm = lazy(() => import("../pages/admin/ManageNews/BeritaForm"))
const BeritaPreview = lazy(() => import("../pages/admin/ManageNews/BeritaPreview"))
const ManageUsers = lazy(() => import("../pages/admin/ManageUsers/Users"))
const UserForm = lazy(() => import("../pages/admin/ManageUsers/UserForm"))
const UserDetail = lazy(() => import("../pages/admin/ManageUsers/UserDetail"))
const ManageCategories = lazy(() => import("../pages/admin/ManageCategories/ManageCategories"))
const MediaLibrary = lazy(() => import("../pages/admin/MediaLibrary/MediaLibrary"))
const Reports = lazy(() => import("../pages/admin/Reports/Reports"))
const Settings = lazy(() => import("../pages/admin/Settings/Settings"))

function AppRouter() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    prefetch(
      () => import("../pages/Home/Home"),
      () => import("../pages/Karya/Karya"),
      () => import("../pages/News/News"),
      () => import("../pages/About/About"),
      () => import("../pages/Hall/Hall"),
      () => import("../pages/user/Profile/Profile"),
      () => import("../pages/admin/ManageProjects/Projects"),
      () => import("../pages/Karya/KaryaDetail"),
      () => import("../pages/News/NewsDetail")
    )
  }, [])
  const hallFallback = (
    <div
      className={`flex h-screen w-screen items-center justify-center ${
        isDark ? "bg-night" : "bg-paper"
      }`}
    >
      <div
        className={`h-8 w-8 animate-spin rounded-full border-2 border-t-transparent ${
          isDark ? "border-sky-400" : "border-sky-600"
        }`}
      />
    </div>
  )

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={null}>
        <Routes>
        {/* === VISITOR ROUTES === */}
        <Route path="/" element={<Home />} />
        <Route path="/karya" element={<Karya />} />
        <Route path="/karya/:slug" element={<KaryaDetail />} />
        <Route
          path="/karya/:slug/:projectSlug"
          element={<KaryaProjectDetail />}
        />
        <Route path="/about" element={<About />} />
        <Route
          path="/hall"
          element={
            <Suspense fallback={hallFallback}>
              <Hall />
            </Suspense>
          }
        />
        <Route
          path="/hall/:categorySlug"
          element={
            <Suspense fallback={hallFallback}>
              <Hall />
            </Suspense>
          }
        />
        <Route path="/berita" element={<RoleSplit admin={<ManageNews />} visitor={<News />} />} />
        <Route path="/berita/:slug" element={<NewsDetail />} />

        {/* === AUTH ROUTES === */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        {/* DIKUNCI: Hanya bisa masuk kalau ada resetEmail */}
        <Route
          path="/verify-code"
          element={
            <ResetFlowRoute step="verify">
              <VerifyCode />
            </ResetFlowRoute>
          }
        />

        {/* DIKUNCI: Hanya bisa masuk kalau OTP sudah diverifikasi */}
        <Route
          path="/reset-password"
          element={
            <ResetFlowRoute step="reset">
              <ResetPassword />
            </ResetFlowRoute>
          }
        />

        {/* === USER-ONLY ROUTES === */}
        <Route
          path="/upload"
          element={
            <ProtectedRoute
              allowedRoles={["user", "admin"]}
              allowedTypes={["mahasiswa", "dosen"]}
            >
              <UserUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-karya/:slug"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <UserEditKarya />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-karya"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <UserMyKarya />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <RoleSplit
                admin={<AdminProfile />}
                visitor={<UserProfile />}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/karya-tersimpan"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <UserKaryaTersimpan />
            </ProtectedRoute>
          }
        />

        {/* === ADMIN ROUTES === */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/berita/tambah"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <BeritaForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/berita/edit/:slug"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <BeritaForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/berita/preview/:slug"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <BeritaPreview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/detail/:slug"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminProjectDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/tambah"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAddProjectView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/edit/:slug"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ProjectForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/tambah"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/edit/:slug"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:slug"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kategori"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/media"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <MediaLibrary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laporan"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pengaturan"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Settings />
            </ProtectedRoute>
          }
        />
        {/* === NOT FOUND === */}
        <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default AppRouter
