function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />
}

export function TextSkeleton({ className = "" }) {
  return <Skeleton className={`h-3.5 ${className}`} />
}

export function ImageSkeleton({ className = "" }) {
  return <Skeleton className={`aspect-[4/3] w-full ${className}`} />
}

export function ProjectCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <ImageSkeleton className="rounded-xl" />
      <div className="mt-4 space-y-2.5">
        <TextSkeleton className="h-5 w-3/4" />
        <TextSkeleton className="h-3 w-full" />
        <TextSkeleton className="h-3 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-10" />
        </div>
      </div>
    </div>
  )
}

export function ProjectGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 md:gap-7 lg:grid-cols-3 lg:gap-8 xl:gap-9 3xl:grid-cols-4 3xl:gap-10 4xl:grid-cols-5 4xl:gap-12">
      {Array.from({ length: count }, (_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function NewsCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
      <Skeleton className="h-40 w-full rounded-none sm:h-48 md:h-52 lg:h-56 3xl:h-64 4xl:h-72" />
      <div className="p-4 sm:p-5 md:p-6 lg:p-7 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20 sm:h-3.5 sm:w-24" />
          <Skeleton className="h-3 w-16 sm:h-3.5 sm:w-20" />
        </div>
        <Skeleton className="h-5 w-11/12 sm:h-6 md:h-7" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full sm:h-3.5" />
          <Skeleton className="h-3 w-full sm:h-3.5" />
          <Skeleton className="h-3 w-3/4 sm:h-3.5" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-white/10 sm:pt-4">
          <Skeleton className="h-3 w-20 sm:h-3.5 sm:w-24" />
          <Skeleton className="h-7 w-16 rounded-xl sm:h-8 sm:w-20 md:h-9 lg:h-10 lg:w-24" />
        </div>
      </div>
    </div>
  )
}

export function NewsGridSkeleton({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-5 md:px-8 lg:px-10 xl:px-12">
      <div className="flex flex-col items-center text-center">
        <Skeleton className="h-8 w-48 sm:h-10 md:h-12" />
        <Skeleton className="mt-4 h-3.5 w-full max-w-xl" />
        <Skeleton className="mt-2 h-3.5 w-4/5 max-w-md" />
      </div>
    </div>
  )
}

export function DetailHeroSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl px-2 min-[280px]:px-3 sm:px-5">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
        <ImageSkeleton className="aspect-video rounded-none" />
        <div className="p-4 sm:p-8 lg:p-10 2xl:p-12">
          <div className="mb-5 flex flex-wrap items-center gap-2 sm:mb-6 sm:gap-4">
            <Skeleton className="h-6 w-24 rounded-full sm:h-7" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-3/4 sm:h-9 lg:h-10" />
          <Skeleton className="mt-3 h-4 w-1/3" />
          <div className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
            <Skeleton className="h-9 w-24 rounded-xl sm:h-10" />
            <Skeleton className="h-9 w-24 rounded-xl sm:h-10" />
            <Skeleton className="h-9 w-24 rounded-xl sm:h-10" />
          </div>
          <div className="mt-8 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function StatsRowSkeleton({ count = 3 }) {
  return (
    <div className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5"
        >
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  )
}

export function CategoryCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8 2xl:p-10 3xl:p-12 4xl:p-14">
      <div className="flex items-start justify-between">
        <Skeleton className="h-16 w-16 rounded-3xl sm:h-20 sm:w-20 2xl:h-24 2xl:w-24 3xl:h-28 3xl:w-28 4xl:h-32 4xl:w-32" />
        <Skeleton className="h-6 w-20 rounded-full sm:h-7 sm:w-24 3xl:h-8 3xl:w-28 4xl:h-9 4xl:w-32" />
      </div>
      <Skeleton className="mt-6 h-6 w-2/3 sm:mt-8 sm:h-7 2xl:mt-10 2xl:h-8 3xl:mt-12 3xl:h-9 4xl:mt-14 4xl:h-10" />
      <Skeleton className="mt-4 h-4 w-full sm:mt-5 2xl:mt-6 3xl:mt-7 4xl:mt-8" />
      <Skeleton className="mt-2 h-4 w-4/5 2xl:mt-2.5 3xl:mt-3 4xl:mt-3.5" />
      <div className="mt-auto pt-8 2xl:pt-10 3xl:pt-12 4xl:pt-14">
        <Skeleton className="h-10 w-full rounded-xl sm:h-11 2xl:h-12 3xl:h-14 4xl:h-16" />
      </div>
    </div>
  )
}

export function CategoryGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 2xl:gap-10 3xl:gap-12 4xl:gap-14">
      {Array.from({ length: count }, (_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default Skeleton
