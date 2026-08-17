import useReports from "../../../../hooks/useReports"
import ReportsHero from "./ReportsHero"
import ReportsContent from "./ReportsContent"

export default function ReportsSection() {
  const {
    loading,
    viewYear,
    monthlyData,
    stats,
    summary,
    years,
    handleYearChange,
  } = useReports()

  return (
    <>
      <ReportsHero
        stats={stats}
        loading={loading}
        viewYear={viewYear}
        years={years}
        onYearChange={handleYearChange}
      />

      <ReportsContent
        monthlyData={monthlyData}
        summary={summary}
        viewYear={viewYear}
      />
    </>
  )
}
