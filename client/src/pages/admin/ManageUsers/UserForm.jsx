import AdminLayout from "../../../layouts/AdminLayout"
import useUserForm from "../../../hooks/useUserForm"
import UserFormHero from "../../../components/sections/admin/ManageUsers/UserFormHero"
import UserFormSection from "../../../components/sections/admin/ManageUsers/UserFormSection"
import FormAlert from "../../../components/ui/FormAlert"
import Toast from "../../../components/ui/Toast"

export default function UserForm() {
  const {
    formData,
    updateField,
    handlePublish,
    isEditMode,
    saving,
    error,
    clearError,
    notification,
    clearNotification,
    goBack,
  } = useUserForm()

  return (
    <AdminLayout>
      {error && <FormAlert message={error} type="error" onClose={clearError} />}
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onDone={clearNotification}
        />
      )}
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
