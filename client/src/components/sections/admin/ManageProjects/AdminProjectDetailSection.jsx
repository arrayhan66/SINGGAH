import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DustBackground from "../../../ui/DustBackground"
import GlowBackground from "../../../ui/GlowBackground"
import GlassCard from "../../../ui/GlassCard"
import {
  CheckCircle2, XCircle, Clock, Pencil, Trash2,
  Calendar, User, Tag, Heart, Eye, Globe,
  AlertTriangle,
} from "lucide-react"
import { useAuth } from "../../../../context/AuthContext"
import { useProjects } from "../../../../context/ProjectContext"
import api from "../../../../services/api"

import KaryaProjectGallery from "../../karya/detail/KaryaProjectGallery"
import KaryaProjectContent from "../../karya/detail/KaryaProjectContent"
import KaryaProjectComments from "../../karya/detail/KaryaProjectComments"
import AdminProjectApproveModal from "./AdminProjectApproveModal"
import AdminProjectRejectModal from "./AdminProjectRejectModal"
import DeleteConfirmModal from "../../../ui/DeleteConfirmModal"
import Toast from "../../../ui/Toast"
import { ProjectDetailSkeleton, CommentsSkeleton } from "../../../ui/PageSkeletons"

const statusConfig = {
  pending: { label: "Menunggu Review", icon: Clock },
  published: { label: "Dipublikasikan", icon: Globe },
  rejected: { label: "Ditolak", icon: XCircle },
}

function AdminProjectDetailSection() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { approveProject, rejectProject, deleteProject } = useProjects()

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [comments, setComments] = useState([])

  const [approveModal, setApproveModal] = useState(false)
  const [rejectModal, setRejectModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (!slug) return

    setLoading(true)
    Promise.all([
      api.get(`/projects/${slug}`).then((res) => setProject(res.data.data)),
      api.get(`/projects/${slug}/comments`).then((res) => {
        setComments(Array.isArray(res.data.data) ? res.data.data : [])
      }),
    ]).catch((err) => {
      console.error("Failed to fetch project:", err)
    }).finally(() => setLoading(false))
  }, [slug])

  function showNotification(message, type = "success") {
    setNotification({ message, type })
  }

  function handleApprove(note) {
    approveProject(project.id, note)
    showNotification("Karya berhasil disetujui")
    setApproveModal(false)
    setProject((prev) => prev ? { ...prev, status: "published", approveNote: note } : prev)
  }

  function handleReject(reason) {
    rejectProject(project.id, reason)
    showNotification("Karya ditolak", "error")
    setRejectModal(false)
    setProject((prev) => prev ? { ...prev, status: "rejected", rejection_reason: reason } : prev)
  }

  async function handleDelete() {
    if (deleteLoading) return
    setDeleteLoading(true)
    try {
      await deleteProject(project.id)
      setDeleteLoading(false)
      setDeleteSuccess(true)
      showNotification("Karya berhasil dihapus")
      setTimeout(() => navigate("/projects"), 1200)
    } catch {
      setDeleteLoading(false)
      setDeleteModal(false)
    }
  }

  function formatDate(dateString) {
    if (!dateString) return ""
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        year: "numeric", month: "long", day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <section className="karya-projectdetail-page relative min-h-screen overflow-hidden bg-brand-dark pb-10 sm:pb-12 md:pb-16">
        <DustBackground />
        <GlowBackground />
        <div className="pt-6 sm:pt-8">
          <ProjectDetailSkeleton />
          <CommentsSkeleton />
        </div>
      </section>
    )
  }

  if (!project) {
    return (
      <section className="karya-projectdetail-page relative overflow-hidden bg-brand-dark py-32 text-center">
        <p className="text-slate-300">Karya tidak ditemukan.</p>
        <button
          onClick={() => navigate("/projects")}
          className="mt-6 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-3 text-slate-700 transition hover:bg-slate-50"
        >
          Kembali ke Karya
        </button>
      </section>
    )
  }

  const config = statusConfig[project.status] || statusConfig.pending
  const StatusIcon = config.icon

  const gallery = Array.from(
    new Set([
      project.thumbnail,
      ...(Array.isArray(project.images) ? project.images : []).map(
        (img) => img.image_url,
      ),
    ]),
  ).filter(Boolean)

  return (
    <section
      id="karya-project-detail"
      className="karya-projectdetail-page detail-page relative min-h-screen overflow-hidden bg-brand-dark pb-16 2xl:pb-24"
    >
      <GlowBackground />
      <DustBackground />

      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onDone={() => setNotification(null)}
        />
      )}

      <div className="relative mx-auto max-w-5xl px-2 min-[280px]:px-3 sm:px-5 pt-6 sm:pt-8">
        {/* Admin Status Banner */}
        <div
          className={`admin-status-banner mb-4 flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-2xl p-3 sm:gap-x-4 sm:gap-y-3 sm:p-4 sm:pl-6 min-[820px]:flex-nowrap ${project.status}`}
        >
          <span className="banner-accent hidden sm:block" aria-hidden="true" />

          <div className="flex min-w-0 grow basis-full items-center gap-3 min-[820px]:basis-auto">
            <span className="banner-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <StatusIcon className="banner-icon-svg h-5 w-5" />
            </span>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="banner-dot shrink-0" aria-hidden="true" />
                <p className="banner-label truncate text-sm font-semibold tracking-tight">{config.label}</p>
              </div>
              <p className="banner-id mt-0.5 text-xs">ID: #{project.id}</p>
            </div>
          </div>

          {project.status === "pending" && (
            <div className="grid w-full grid-cols-2 gap-2 min-[820px]:flex min-[820px]:w-auto min-[820px]:items-center">
              <button
                type="button"
                onClick={() => setApproveModal(true)}
                className="banner-btn banner-btn--primary"
              >
                <CheckCircle2 size={14} />
                Setujui
              </button>
              <button
                type="button"
                onClick={() => setRejectModal(true)}
                className="banner-btn banner-btn--ghost banner-btn--danger"
              >
                <XCircle size={14} />
                Tolak
              </button>
            </div>
          )}

          <span className="banner-divider hidden min-[820px]:block" aria-hidden="true" />

          <div className="grid w-full grid-cols-2 gap-2 min-[820px]:flex min-[820px]:w-auto min-[820px]:items-center">
            <button
              type="button"
              onClick={() => navigate(`/projects/edit/${project.slug || project.id}`)}
              className="banner-btn banner-btn--ghost"
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setDeleteModal(true)}
              className="banner-btn banner-btn--ghost banner-btn--danger"
            >
              <Trash2 size={14} />
              Hapus
            </button>
          </div>
        </div>

        <GlassCard className="overflow-hidden p-0">
          <KaryaProjectGallery
            slug={slug}
            gallery={gallery}
            activeImage={activeImage}
            setActiveImage={setActiveImage}
            projectTitle={project.title}
          />

          <div className="p-4 sm:p-8 lg:p-10 2xl:p-12">
            {/* Header Meta */}
            <div className="mb-5 border-b border-white/10 pb-5 sm:mb-6 sm:pb-6">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-400 sm:mb-4 sm:gap-4 sm:text-sm">
                {project.Category && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 font-medium text-cyan-300 sm:px-3">
                    <Tag size={12} className="sm:size-3.5" />
                    {project.Category.name}
                  </span>
                )}
                {project.year && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} className="sm:size-3.5" />
                    {project.year}
                  </span>
                )}
                {project.User && (
                  <span className="flex items-center gap-1.5">
                    <User size={12} className="sm:size-3.5" />
                    {project.User.name}
                  </span>
                )}
              </div>

              <h1 className="mb-4 text-2xl font-bold leading-tight text-white sm:text-3xl sm:leading-snug lg:text-4xl">
                {project.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 sm:px-4 sm:py-2.5 sm:text-sm">
                  <Heart size={14} className="text-pink-400/80" />
                  {project.likesCount ?? 0} Suka
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 sm:px-4 sm:py-2.5 sm:text-sm">
                  <Eye size={14} className="text-cyan-400/80" />
                  {project.viewsCount ?? 0} Dilihat
                </span>
              </div>
            </div>

            <KaryaProjectContent project={project} />

            {/* Rejection note */}
            {project.status === "rejected" && project.rejection_reason && (
              <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-red-400">Alasan Penolakan</h4>
                    <p className="mt-1 text-sm leading-relaxed text-red-200/80">
                      {project.rejection_reason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Approve note */}
            {project.status === "published" && project.approveNote && (
              <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-cyan-400">Catatan Persetujuan</h4>
                    <p className="mt-1 text-sm leading-relaxed text-cyan-200/80">
                      {project.approveNote}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {project.status === "published" && (
          <KaryaProjectComments
            comments={comments}
            setComments={setComments}
            projectSlug={slug}
            isLoggedIn={Boolean(user)}
            user={user}
            handleAuthRedirect={() => {}}
            formatDate={formatDate}
          />
        )}
      </div>

      {approveModal && (
        <AdminProjectApproveModal
          project={project}
          onConfirm={handleApprove}
          onCancel={() => setApproveModal(false)}
        />
      )}

      {rejectModal && (
        <AdminProjectRejectModal
          project={project}
          onConfirm={handleReject}
          onCancel={() => setRejectModal(false)}
        />
      )}

      {deleteModal && (
        <DeleteConfirmModal
          title="Hapus karya ini?"
          message={`Karya "${project.title}" akan dihapus permanen bersama semua data terkait dan tidak bisa dikembalikan.`}
          confirmLabel="Ya, Hapus Karya"
          onConfirm={handleDelete}
          onCancel={() => {
            setDeleteModal(false)
            setDeleteLoading(false)
            setDeleteSuccess(false)
          }}
          loading={deleteLoading}
          success={deleteSuccess}
        />
      )}
    </section>
  )
}

export default AdminProjectDetailSection
