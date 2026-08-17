import AdminLayout from "../../../layouts/AdminLayout"
import useUserForm from "../../../hooks/useUserForm"
import UserFormHero from "../../../components/sections/admin/ManageUsers/UserFormHero"
import UserFormSection from "../../../components/sections/admin/ManageUsers/UserFormSection"

function UserForm() {
  const {
    formData,
    updateField,
    handlePublish,
    isEditMode,
    saving,
    goBack,
  } = useUserForm()

  return (
    <AdminLayout>
      <UserFormHero isEditMode={isEditMode} onBack={goBack} />
      <UserFormSection
        formData={formData}
        updateField={updateField}
        onPublish={handlePublish}
        isEditMode={isEditMode}
        saving={saving}
      />
    </AdminLayout>
  )
}

export default UserForm
