import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ProtectedRoute } from "./ProtectedRoute"
import { ResetFlowRoute } from "./ResetFlowRoute"

import Hall from "../pages/Hall/Hall"
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
import UserMyProject from "../pages/user/MyProject/MyProject"
import UserProfile from "../pages/user/Profile/Profile"
import UserKaryaTersimpan from "../pages/user/KaryaTersimpan/KaryaTersimpan"

/* === ADMIN IMPORT === */
import AdminHome from "../pages/admin/Home/Home"
import AdminProjects from "../pages/admin/ManageProjects/Projects"
import ManageNews from "../pages/admin/ManageNews/Berita"
import BeritaForm from "../pages/admin/ManageNews/BeritaForm"
import ManageUsers from "../pages/admin/ManageUsers/Users"
import UserForm from "../pages/admin/ManageUsers/UserForm"
import UserDetail from "../pages/admin/ManageUsers/UserDetail"

function AppRouter() {
  return (
    <BrowserRouter>
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
        <Route path="/hall" element={<Hall />} />
        <Route path="/berita" element={<News />} />
        <Route path="/berita/:slug" element={<NewsDetail />} />

        {/* === AUTH ROUTES === */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
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

        {/* === USER ROUTES === */}
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/karya"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <Karya />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/karya/:slug"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <KaryaDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/karya/:slug/:projectSlug"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <KaryaProjectDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/about"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <About />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/hall"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <Hall />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/berita"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <News />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/upload"
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
          path="/user/my-project"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <UserMyProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/profile"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/karya-tersimpan"
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
          path="/admin/projects"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/berita"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageNews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/berita/tambah"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <BeritaForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/berita/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <BeritaForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/tambah"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserDetail />
            </ProtectedRoute>
          }
        />
        {/* === NOT FOUND === */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
