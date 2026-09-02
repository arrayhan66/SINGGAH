import useSettings from "../../../../hooks/useSettings"
import SettingsHero from "./SettingsHero"
import SettingsForm from "./SettingsForm"
import { AdminSettingsSkeleton } from "../../../ui/PageSkeletons"

export default function SettingsSection() {
  const {
    activeTab,
    animDir,
    form,
    loading,
    saving,
    saveError,
    saved,
    menuButtonRef,
    menuRef,
    menuOpen,
    menuPos,
    active,
    handleChange,
    handleSave,
    switchTab,
    toggleMenu,
    selectTabFromMenu,
  } = useSettings()

  if (loading) {
    return <AdminSettingsSkeleton />
  }

  return (
    <>
      <SettingsHero
        activeTab={activeTab}
        active={active}
        onSwitchTab={switchTab}
        menuButtonRef={menuButtonRef}
        menuRef={menuRef}
        menuOpen={menuOpen}
        menuPos={menuPos}
        onToggleMenu={toggleMenu}
        onSelectTabFromMenu={selectTabFromMenu}
      />

      <div className="px-4 min-[260px]:px-3 pb-12 md:px-6 md:pb-16 lg:px-8">
        <SettingsForm
          activeTab={activeTab}
          active={active}
          animDir={animDir}
          form={form}
          loading={loading}
          saving={saving}
          saveError={saveError}
          saved={saved}
          onChange={handleChange}
          onSave={handleSave}
        />
      </div>
    </>
  )
}
