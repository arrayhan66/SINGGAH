import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import { ProtectedRoute } from "./ProtectedRoute"
import { GuestRoute } from "./GuestRoute"
import { ResetFlowRoute } from "./ResetFlowRoute"
import RoleSplit from "./RoleSplit"

const Hall = lazy(() => import("../pages/Hall/Hall"))
import Home from "../pages/Home/Home"
import News from "../pages/News/News"
import NewsDetail from "../pages/News/NewsDetail"
import About from "../pages/About/About"
import NotFound from "../pages/NotFound/NotFound"
import ScrollToTop from "../components/layout/ScrolltoTop"
import Karya from "../pages/Karya/Karya"
import KaryaDetail from "../pages/Karya/KaryaDetail"
import KaryaProjectDetail from "../pages/Karya/KaryaProjectDetail"

/* === LOGIN IMPORT === */
import Login from "../pages/auth/Login/Login"
import ForgotPassword from "../pages/auth/ForgotPassword/ForgotPassword"
import Register from "../pages/auth/Register/Register"
import VerifyCode from "../pages/auth/VerifyCode/VerifyCode"
import ResetPassword from "../pages/auth/ResetPassword/ResetPassword"

/* === USER IMPORT === */
import UserUpload from "../pages/user/Upload/Upload"
import UserEditKarya from "../pages/user/EditKarya/EditKarya"
import UserMyKarya from "../pages/user/MyKarya/MyKarya"
import UserProfile from "../pages/user/Profile/Profile"
import UserKaryaTersimpan from "../pages/user/KaryaTersimpan/KaryaTersimpan"

/* === ADMIN IMPORT === */
import AdminHome from "../pages/admin/Home/Home"
import AdminProjects from "../pages/admin/ManageProjects/Projects"
import AdminProjectDetail from "../pages/admin/ManageProjects/AdminProjectDetail"
import ProjectForm from "../pages/admin/ManageProjects/ProjectForm"
import AdminAddProjectView from "../components/sections/admin/ManageProjects/AdminAddProjectView"
import ManageNews from "../pages/admin/ManageNews/Berita"
import BeritaForm from "../pages/admin/ManageNews/BeritaForm"
import BeritaPreview from "../pages/admin/ManageNews/BeritaPreview"
import AdminProfile from "../pages/admin/Profile/Profile"
import ManageUsers from "../pages/admin/ManageUsers/Users"
import UserForm from "../pages/admin/ManageUsers/UserForm"
import UserDetail from "../pages/admin/ManageUsers/UserDetail"
import ManageCategories from "../pages/admin/ManageCategories/ManageCategories"
import MediaLibrary from "../pages/admin/MediaLibrary/MediaLibrary"
import Reports from "../pages/admin/Reports/Reports"
import Settings from "../pages/admin/Settings/Settings"

function AppRouter() {
  return (
    <>
      <ScrollToTop />
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
            <Suspense
              fallback={
                <div className="flex h-screen w-screen items-center justify-center bg-[#0b1220]">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#38bdf8] border-t-transparent" />
                </div>
              }
            >
              <Hall />
            </Suspense>
          }
        />
        <Route
          path="/hall/:categorySlug"
          element={
            <Suspense
              fallback={
                <div className="flex h-screen w-screen items-center justify-center bg-[#0b1220]">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#38bdf8] border-t-transparent" />
                </div>
              }
            >
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
    </>
  )
}

export default AppRouter
