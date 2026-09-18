import { useState } from "react"
import { keepScrollOnExpand } from "../utils/preserveScrollOnExpand"

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

  const toggleShowAll = (next) => {
    keepScrollOnExpand()
    setShowAll(next)
  }

  return {
    search,
    handleSearchChange,
    visibleData,
    filteredData,
    showAll,
    setShowAll: toggleShowAll,
  }
}

export default useSearchAndExpand
