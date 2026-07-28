import { useState } from "react"

function useSearchAndExpand(data, initialCount = 6) {
  const [search, setSearch] = useState("")
  const [showAll, setShowAll] = useState(false)

  const filteredData = data.filter((item) =>
    (item.name || item.title || "").toLowerCase().includes(search.toLowerCase()),
  )

  const visibleData = showAll
    ? filteredData
    : filteredData.slice(0, initialCount)

  const handleSearchChange = (value) => {
    setSearch(value)
    setShowAll(false)
  }

  return {
    search,
    handleSearchChange,
    visibleData,
    filteredData,
    showAll,
    setShowAll,
  }
}

export default useSearchAndExpand
