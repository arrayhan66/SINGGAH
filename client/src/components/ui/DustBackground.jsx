import { lazy, Suspense } from "react"

const DustBackgroundCanvas = lazy(() => import("./DustBackgroundCanvas"))

function DustBackground(props) {
  return (
    <Suspense fallback={null}>
      <DustBackgroundCanvas {...props} />
    </Suspense>
  )
}

export default DustBackground
