import AdminUserFormMain from "./AdminUserFormMain"
import AdminUserFormSidebar from "./AdminUserFormSidebar"

export default function UserFormSection({ formData, updateField, onPublish, isEditMode, saving }) {
  return (
    <div className="px-4 md:px-6 lg:px-8 pb-12 md:pb-16">
      <div className="mt-6 grid grid-cols-1 items-start gap-6 min-[1000px]:grid-cols-[1fr_340px]">
        <AdminUserFormMain
          formData={formData}
          updateField={updateField}
          onPublish={onPublish}
          isEditMode={isEditMode}
          saving={saving}
        />
        <div className="flex flex-col gap-6">
          <AdminUserFormSidebar
            formData={formData}
            updateField={updateField}
          />
          <div className="border-t border-white/[0.06] pt-6 min-[1000px]:hidden">
            <button
              type="button"
              onClick={onPublish}
              className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0]"
            >
              {isEditMode ? "Simpan Perubahan" : "Tambah User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
