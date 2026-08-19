import useManageCategories from "../../../../hooks/useManageCategories"
import Toast from "../../../../components/ui/Toast"
import AdminCategoryDeleteModal from "./AdminCategoryDeleteModal"
import CategoryHero from "./CategoryHero"
import CategoryContent from "./CategoryContent"
import CategoryForm from "./CategoryForm"

export default function CategorySection() {
  const {
    loading,
    search,
    setSearch,
    stateFilter,
    setStateFilter,
    view,
    setView,
    showForm,
    editing,
    formName,
    setFormName,
    formDesc,
    setFormDesc,
    showAll,
    setShowAll,
    deleteTarget,
    setDeleteTarget,
    isOpen,
    dropdownPos,
    notification,
    buttonRef,
    panelRef,
    filtered,
    stateCounts,
    visibleCategories,
    toggleDropdown,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseForm,
    handleSave,
    handleConfirmDelete,
  } = useManageCategories()

  return (
    <>
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onDone={() => {}}
        />
      )}

      <CategoryHero
        search={search}
        onSearchChange={setSearch}
        stateFilter={stateFilter}
        onStateFilterChange={setStateFilter}
        stateCounts={stateCounts}
        view={view}
        onViewChange={setView}
        onAddClick={handleOpenAdd}
        isOpen={isOpen}
        dropdownPos={dropdownPos}
        onToggleDropdown={toggleDropdown}
        buttonRef={buttonRef}
        panelRef={panelRef}
        onFilterSelect={(value) => {
          setStateFilter(value)
        }}
      />

      <div className="relative px-4 pb-8 md:px-6 md:pb-10 lg:px-8 lg:pb-12 mt-6 md:mt-8">
        {showForm && (
          <CategoryForm
            editing={editing}
            formName={formName}
            onNameChange={setFormName}
            formDesc={formDesc}
            onDescChange={setFormDesc}
            onSave={handleSave}
            onClose={handleCloseForm}
          />
        )}

        <CategoryContent
          loading={loading}
          filtered={filtered}
          visibleCategories={visibleCategories}
          search={search}
          showAll={showAll}
          onShowAllToggle={() => setShowAll((prev) => !prev)}
          view={view}
          onEdit={handleOpenEdit}
          onDelete={(cat) => setDeleteTarget(cat)}
        />
      </div>

      <AdminCategoryDeleteModal
        category={deleteTarget}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
