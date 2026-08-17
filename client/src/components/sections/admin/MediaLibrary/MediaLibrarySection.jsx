import useMediaLibrary from "../../../../hooks/useMediaLibrary"
import Toast from "../../../../components/ui/Toast"
import MediaLibraryHero from "./MediaLibraryHero"
import MediaLibraryContent from "./MediaLibraryContent"
import PreviewModal from "./PreviewModal"
import ConfirmDeleteModal from "./ConfirmDeleteModal"

export default function MediaLibrarySection() {
  const {
    loading,
    uploading,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    copiedId,
    view,
    setView,
    previewItem,
    setPreviewItem,
    deleteTarget,
    setDeleteTarget,
    isDragging,
    notification,
    setNotification,
    filterOpen,
    setFilterOpen,
    filterPos,
    fileInputRef,
    filterBtnRef,
    filterPanelRef,
    filtered,
    totalSize,
    stats,
    typeCounts,
    toggleTypeFilter,
    handleFileSelect,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDelete,
    confirmDelete,
    handleCopyUrl,
  } = useMediaLibrary()

  return (
    <>
      <MediaLibraryHero
        stats={stats}
        totalSize={totalSize}
        typeCounts={typeCounts}
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        view={view}
        onViewChange={setView}
        uploading={uploading}
        onUploadClick={handleFileSelect}
        fileInputRef={fileInputRef}
        filterOpen={filterOpen}
        filterPos={filterPos}
        onToggleFilter={toggleTypeFilter}
        filterBtnRef={filterBtnRef}
        filterPanelRef={filterPanelRef}
        onFilterSelect={(value) => {
          setTypeFilter(value)
          setFilterOpen(false)
        }}
      />

      <MediaLibraryContent
        loading={loading}
        filtered={filtered}
        media={filtered}
        view={view}
        isDragging={isDragging}
        uploading={uploading}
        copiedId={copiedId}
        onPreview={setPreviewItem}
        onCopy={handleCopyUrl}
        onDelete={handleDelete}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        fileInputRef={fileInputRef}
      />

      {previewItem && (
        <PreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          item={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {notification && (
        <Toast
          message={notification.msg}
          type={notification.type}
          onDone={() => setNotification(null)}
        />
      )}
    </>
  )
}
