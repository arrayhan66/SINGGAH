import Skeleton, {
  ProjectGridSkeleton,
  CategoryGridSkeleton,
  NewsCardSkeleton,
} from "./Skeleton"

function FormShell({ className = "", children }) {
  return (
    <div
      className={`skeleton-card border border-white/10 bg-white/[0.04] ${className}`}
      aria-hidden="true"
    >
      {children}
    </div>
  )
}

function PageHeadingSkeleton({ icon = true, titleWidth = "w-64 sm:w-96" }) {
  return (
    <div className="text-center">
      {icon && (
        <Skeleton className="mx-auto h-14 w-14 rounded-2xl sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 3xl:h-28 3xl:w-28 4xl:h-32 4xl:w-32" />
      )}
      <Skeleton
        className={`mx-auto mt-2 h-9 sm:mt-3 sm:h-11 md:mt-4 md:h-12 lg:mt-5 lg:h-14 3xl:mt-7 3xl:h-16 4xl:mt-8 4xl:h-[4.5rem] ${titleWidth}`}
      />
      <div className="mx-auto mt-5 w-full max-w-2xl space-y-2 px-6 sm:mt-6 3xl:mt-8 4xl:mt-10">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mx-auto h-4 w-10/12" />
      </div>
    </div>
  )
}

function SearchBarSkeleton({ className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-xl ${className}`}>
      <Skeleton className="h-12 w-full rounded-2xl sm:h-14 3xl:h-16" />
    </div>
  )
}

function BackChipSkeleton() {
  return (
    <div className="mb-2 flex sm:-mb-2 lg:-mb-4 3xl:-mb-6 4xl:-mb-8">
      <Skeleton className="h-11 w-28 rounded-full sm:h-12" />
    </div>
  )
}

export function KaryaPageSkeleton() {
  return (
    <div className="relative">
      <div className="pt-4 text-center sm:pt-6">
        <PageHeadingSkeleton />
        <div className="pt-8 2xl:pt-12 3xl:pt-14 4xl:pt-16">
          <SearchBarSkeleton />
        </div>
        <div className="pt-14 2xl:pt-20 3xl:pt-24 4xl:pt-28">
          <CategoryGridSkeleton count={6} />
        </div>
      </div>
    </div>
  )
}

export function KaryaProjectsPageSkeleton() {
  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-5 md:px-8 lg:px-10 xl:px-12 xl:max-w-[1280px] 3xl:max-w-[1600px] 3xl:px-14 4xl:max-w-[2000px] 4xl:px-16">
      <BackChipSkeleton />
      <div className="text-center">
        <Skeleton className="mx-auto mt-4 h-9 w-56 sm:h-11 sm:w-72 md:h-12 md:w-96 lg:h-14 lg:w-[30rem] 3xl:mt-6 3xl:h-16 4xl:mt-8 4xl:h-[4.5rem]" />
        <div className="mx-auto mt-4 w-full max-w-2xl space-y-2 px-6 sm:mt-5 3xl:mt-6 4xl:mt-8">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mx-auto h-4 w-4/5" />
        </div>
      </div>
      <div className="pt-6 sm:pt-8 3xl:pt-10 4xl:pt-12">
        <SearchBarSkeleton />
      </div>
<div className="pt-8 sm:pt-10 3xl:pt-14 4xl:pt-16">
        <ProjectGridSkeleton count={6} />
      </div>
    </div>
  )
}

export function BeritaPageSkeleton() {
  return (
    <div className="relative">
      <div className="pt-4 text-center sm:pt-6">
        <PageHeadingSkeleton />
        <div className="pt-8 2xl:pt-12 3xl:pt-14 4xl:pt-16">
          <SearchBarSkeleton />
        </div>
        <div className="pt-10 sm:pt-12 3xl:pt-16 4xl:pt-20">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 md:gap-7 lg:gap-8 min-[75rem]:grid-cols-3 xl:gap-9 3xl:gap-10 4xl:gap-12">
            {Array.from({ length: 6 }, (_, i) => (
              <NewsCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function MyKaryaStatsSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-7 xl:gap-8 3xl:mt-16 3xl:gap-10 4xl:mt-20 4xl:gap-12">
      {Array.from({ length: 4 }, (_, i) => (
        <FormShell key={i} className="flex items-center gap-3 p-5 sm:gap-4 sm:p-6 md:gap-5 md:p-7 3xl:gap-6 3xl:p-8 4xl:gap-8 4xl:p-10">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl sm:h-12 sm:w-12 md:h-13 md:w-13 3xl:h-16 3xl:w-16 4xl:h-20 4xl:w-20" />
          <div className="flex-1">
            <Skeleton className="h-5 w-14 sm:h-6 3xl:h-7 4xl:h-9" />
            <Skeleton className="mt-1 h-3 w-24 sm:mt-2 sm:h-4 3xl:h-5 4xl:h-6" />
          </div>
        </FormShell>
      ))}
    </div>
  )
}

export function KnownListSkeleton() {
  return (
    <div className="space-y-6">
      <SearchBarSkeleton className="max-w-none" />
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-40 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
      <div className="pt-2">
        <ProjectGridSkeleton count={6} />
      </div>
    </div>
  )
}

export function MyKaryaPageSkeleton({ stats = true }) {
  return (
    <div className="relative mx-auto max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1800px] 4xl:max-w-[2200px]">
      {stats && <MyKaryaStatsSkeleton />}
      <div className="pt-8 2xl:pt-12 3xl:pt-14 4xl:pt-16">
        <KnownListSkeleton />
      </div>
    </div>
  )
}

export function SavedKaryaPageSkeleton() {
  return (
    <div>
      <PageHeadingSkeleton />
      <div className="mt-6 sm:mt-8 3xl:mt-10 4xl:mt-12">
        <SearchBarSkeleton />
      </div>
      <div className="mt-8 sm:mt-10 3xl:mt-14 4xl:mt-16">
        <ProjectGridSkeleton count={6} />
      </div>
    </div>
  )
}

export function ProjectDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl px-2 min-[280px]:px-3 sm:px-5">
      <FormShell className="overflow-hidden rounded-3xl">
        <Skeleton className="aspect-video w-full rounded-none" />
        <div className="p-4 sm:p-8 lg:p-10 2xl:p-12">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="mt-4 h-8 w-3/4 sm:h-9 lg:h-10" />
          <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
            <Skeleton className="h-9 w-28 rounded-xl sm:h-10" />
            <Skeleton className="h-9 w-28 rounded-xl sm:h-10" />
            <Skeleton className="h-9 w-28 rounded-xl sm:h-10" />
          </div>
          <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
          <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl">
            <Skeleton className="h-full w-full rounded-none" />
          </div>
          <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Skeleton className="h-7 w-16 rounded-lg" />
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-24 rounded-lg" />
          </div>
        </div>
      </FormShell>
    </div>
  )
}

export function CommentsSkeleton({ count = 3 }) {
  return (
    <div className="mx-auto mt-6 w-full max-w-5xl px-2 min-[280px]:px-3 sm:px-5 sm:mt-8">
      <FormShell className="p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="mt-5 space-y-5">
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </FormShell>
    </div>
  )
}

export function BeritaDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl px-3 min-[350px]:px-5 sm:px-8 2xl:max-w-5xl">
      <FormShell className="overflow-hidden rounded-2xl min-[350px]:rounded-3xl">
        <div className="p-4 min-[350px]:p-5 sm:p-8 lg:p-10 pb-6 min-[350px]:pb-8 sm:pb-12 lg:pb-14">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
          <div className="mt-6 flex flex-wrap gap-1.5 min-[350px]:gap-2 sm:mt-8 sm:mt-10">
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-24 rounded-md" />
          </div>
          <Skeleton className="mt-5 h-8 w-11/12 sm:h-9 lg:h-10" />
          <Skeleton className="mt-2 h-8 w-2/5 sm:h-9 lg:h-10" />
          <div className="mt-4 flex items-center gap-3 pt-4">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-none min-[350px]:h-64 sm:h-88 lg:h-[420px]" />
        <div className="space-y-3 p-4 min-[350px]:p-6 sm:p-10 lg:p-14 sm:px-12">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-6 min-[350px]:px-6 sm:px-12 sm:py-8">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-32 rounded-xl" />
        </div>
      </FormShell>

      <div className="mt-10 min-[350px]:mt-16 sm:mt-20">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="mt-6 grid gap-4 min-[350px]:gap-6 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function EditKaryaFormSkeleton() {
  return (
    <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-6 sm:gap-8 2xl:gap-10 3xl:gap-12 4xl:gap-14">
      <FormShell className="p-5 sm:p-8">
        <Skeleton className="h-6 w-48 sm:h-7" />
        <Skeleton className="mt-5 aspect-video w-full rounded-xl" />
        <div className="mt-4 flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </FormShell>

      {[0, 1, 2].map((i) => (
        <FormShell key={i} className="p-5 sm:p-8">
          <Skeleton className="h-6 w-40 sm:h-7" />
          <div className="mt-5 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-2/3 rounded-xl" />
          </div>
        </FormShell>
      ))}

      <FormShell className="p-5 sm:p-8">
        <Skeleton className="h-6 w-32 sm:h-7" />
        <div className="mt-5 flex flex-wrap gap-2">
          <Skeleton className="h-11 w-40 rounded-xl" />
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>
      </FormShell>

      <FormShell className="p-5 sm:p-8">
        <Skeleton className="h-6 w-36 sm:h-7" />
        <Skeleton className="mt-5 aspect-video w-full rounded-xl" />
        <div className="mt-5 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </FormShell>

      <FormShell className="p-5 sm:p-8">
        <Skeleton className="h-12 w-full rounded-xl" />
      </FormShell>
    </div>
  )
}

export function AboutPageSkeleton() {
  return (
    <div className="relative">
      <Skeleton className="h-12 w-72 sm:h-14 lg:h-16 2xl:h-20 3xl:h-24 4xl:h-28" />
      <div className="mt-6 space-y-3 lg:mt-8">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <FormShell className="mt-10 p-5 sm:p-8 2xl:p-12 3xl:p-14 4xl:p-16">
        <Skeleton className="h-7 w-48 sm:h-9 2xl:h-11 3xl:h-13 4xl:h-14" />
        <div className="mt-6 space-y-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 sm:gap-5">
              <Skeleton className="h-12 w-12 shrink-0 rounded-xl min-[280px]:h-14 min-[280px]:w-14 2xl:h-20 2xl:w-20 3xl:h-24 3xl:w-24 4xl:h-28 4xl:w-28" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 sm:h-5" />
                <Skeleton className="h-3.5 w-56 sm:h-4" />
              </div>
            </div>
          ))}
        </div>
      </FormShell>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 2xl:mt-16 2xl:gap-10 3xl:mt-20 3xl:gap-12 4xl:mt-24 4xl:gap-14">
        {Array.from({ length: 4 }, (_, i) => (
          <FormShell key={i} className="p-4 sm:p-6 2xl:p-8 3xl:p-10 4xl:p-12">
            <Skeleton className="h-7 w-7 sm:h-[38px] sm:w-[38px] 2xl:h-12 2xl:w-12 3xl:h-14 3xl:w-14 4xl:h-16 4xl:w-16" />
            <Skeleton className="mt-5 h-5 w-24 sm:h-6" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
          </FormShell>
        ))}
      </div>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 2xl:mt-16 2xl:gap-10 3xl:mt-20 3xl:gap-12 4xl:mt-24 4xl:gap-14">
        {Array.from({ length: 2 }, (_, i) => (
          <FormShell
            key={i}
            className="flex flex-col items-center justify-center p-8 sm:p-12 2xl:p-16 3xl:p-20 4xl:p-24"
          >
            <Skeleton className="h-10 w-16 sm:h-16 sm:w-24 2xl:h-20 2xl:w-28 3xl:h-24 3xl:w-32 4xl:h-28 4xl:w-36" />
            <Skeleton className="mt-3 h-4 w-20 sm:h-5 sm:w-24" />
          </FormShell>
        ))}
      </div>
    </div>
  )
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 md:space-y-7 lg:space-y-8 pb-12 md:pb-16">
      <div className="px-4 min-[260px]:px-3 pt-5 min-[260px]:pt-5 pb-1 md:px-6 md:pt-6">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-3 sm:gap-4">
          <Skeleton className="h-14 w-14 shrink-0 rounded-2xl sm:h-16 sm:w-16" />
          <div className="min-w-0">
            <Skeleton className="mx-auto h-6 w-48 sm:mx-0 sm:h-7 sm:w-64" />
            <Skeleton className="mx-auto mt-2 h-3.5 w-64 max-w-xl sm:mx-0 sm:w-[30rem]" />
          </div>
        </div>
        <div className="mt-5 min-[260px]:mt-4 md:mt-6 flex flex-wrap items-center gap-2.5 min-[260px]:gap-2 md:gap-3">
          <Skeleton className="h-11 flex-1 basis-0 rounded-lg max-w-[150px] min-[260px]:max-w-[136px]" />
          <Skeleton className="h-11 flex-1 basis-0 rounded-lg max-w-[150px] min-[260px]:max-w-[136px]" />
          <Skeleton className="h-11 flex-1 basis-0 rounded-lg max-w-[150px] min-[260px]:max-w-[136px]" />
        </div>
      </div>
      <div className="px-4 min-[260px]:px-3 pb-1 md:px-6">
        <div className="grid grid-cols-1 min-[640px]:grid-cols-2 min-[1200px]:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <FormShell key={i} className="flex items-start gap-2 p-5 md:p-6">
              <div className="flex items-center gap-3 min-w-0">
                <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                <Skeleton className="h-8 w-10" />
              </div>
              <div className="ml-auto flex flex-col items-end gap-1">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3.5 w-14" />
              </div>
            </FormShell>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 min-[1200px]:grid-cols-3 min-[1200px]:gap-7">
          <div className="flex flex-col gap-6 min-[1200px]:col-span-2 min-[1200px]:gap-7">
            <FormShell className="p-5 md:p-6">
              <div className="flex items-center gap-3 pb-4">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-5 w-44" />
              </div>
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-[14px] p-3">
                    <Skeleton className="h-[72px] w-[72px] shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="mt-2 h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-7 w-12 shrink-0 rounded-md" />
                    <Skeleton className="h-8 w-16 shrink-0 rounded-md" />
                  </div>
                ))}
              </div>
            </FormShell>
            <FormShell className="p-5 md:p-6">
              <div className="flex items-center gap-3 pb-4">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-5 w-44" />
              </div>
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-[14px] p-3">
                    <Skeleton className="h-[72px] w-[72px] shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="mt-2 h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-7 w-12 shrink-0 rounded-md" />
                  </div>
                ))}
              </div>
            </FormShell>
          </div>
          <div className="flex flex-col gap-6 min-[1200px]:gap-7">
            <FormShell className="p-5 md:p-6">
              <div className="flex items-center gap-3 pb-4">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-5 w-40" />
              </div>
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-2.5 py-1">
                    <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-11/12" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                    <Skeleton className="h-3 w-10 shrink-0" />
                  </div>
                ))}
              </div>
            </FormShell>
            <FormShell className="p-5 md:p-6">
              <div className="flex items-center gap-3 pb-4">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-5 w-36" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            </FormShell>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminProjectsSkeleton() {
  return (
    <div className="pb-12 md:pb-16">
      <div className="px-4 md:px-6 lg:px-8 pt-8 md:pt-10">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-3 sm:gap-4 md:gap-5">
          <Skeleton className="h-[clamp(2.75rem,2.25rem+2vw,3.5rem)] w-[clamp(2.75rem,2.25rem+2vw,3.5rem)] shrink-0 rounded-2xl sm:h-16 sm:w-16" />
          <div className="min-w-0">
            <Skeleton className="mx-auto h-6 w-52 sm:mx-0 sm:h-8 sm:w-64" />
            <Skeleton className="mx-auto mt-2 h-3.5 w-72 max-w-xl sm:mx-0" />
          </div>
        </div>
      </div>
      <div className="px-4 pt-8 pb-5 md:px-6 md:pt-10 md:pb-6 lg:px-8">
        <FormShell className="rounded-2xl px-4 py-4 md:px-6 md:py-5">
          <div className="grid grid-cols-1 gap-3 min-[600px]:grid-cols-2 min-[1000px]:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex min-w-0 items-center gap-3.5 rounded-xl bg-white/[0.05] px-4 py-3.5">
                <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                <div className="min-w-0">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="mt-1.5 h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </FormShell>
      </div>
      <div className="px-4 pb-6 md:px-6 md:pb-8 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Skeleton className="h-12 w-full rounded-xl md:max-w-lg" />
          <Skeleton className="h-12 w-full rounded-xl md:w-40" />
        </div>
        <div className="mt-4 flex flex-col gap-2.5 md:mt-5">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="px-4 md:px-6 lg:px-8 space-y-8 md:space-y-10">
        {[0, 1].map((g) => (
          <div key={g} className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-5 w-56" />
            </div>
            <div className="grid grid-cols-1 min-[500px]:grid-cols-2 min-[1100px]:grid-cols-3 gap-5 md:gap-6">
              {Array.from({ length: 3 }, (_, i) => (
                <FormShell key={i} className="flex h-full flex-col overflow-hidden rounded-2xl p-0">
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                    <Skeleton className="h-full w-full rounded-none" />
                    <Skeleton className="absolute right-2.5 top-2.5 h-9 w-9 rounded-xl" />
                    <Skeleton className="absolute bottom-3 left-3 h-6 w-28 rounded-full" />
                  </div>
                  <div className="flex flex-1 flex-col p-4 md:p-5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-3.5 w-28" />
                    </div>
                    <Skeleton className="mt-3 h-4 w-11/12" />
                    <div className="mt-2.5 flex gap-3">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <div className="mt-4">
                      <Skeleton className="h-8 w-full rounded-lg" />
                    </div>
                  </div>
                </FormShell>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AdminNewsListSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-3.5 w-40" />
      <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {Array.from({ length: 6 }, (_, i) => (
          <NewNewsCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

function NewNewsCardSkeleton() {
  return (
    <FormShell className="overflow-hidden rounded-2xl p-0">
      <div className="relative h-40 w-full overflow-hidden bg-slate-950 sm:h-44 md:h-48">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <div className="p-4 md:p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-16" />
        </div>
        <Skeleton className="mt-3 h-5 w-11/12" />
        <Skeleton className="mt-2 h-3 w-full" />
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-7 w-14 rounded-lg" />
          <Skeleton className="h-7 w-14 rounded-lg" />
        </div>
      </div>
    </FormShell>
  )
}

export function AdminUsersSkeleton() {
  return (
    <FormShell className="overflow-hidden rounded-2xl p-0">
      <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.03] px-4 py-3.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="ml-auto h-4 w-40 hidden min-[500px]:block" />
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="hidden h-6 w-20 rounded-md min-[600px]:block" />
            <Skeleton className="hidden h-6 w-16 rounded-md min-[400px]:block" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    </FormShell>
  )
}

export function AdminUserDetailSkeleton() {
  return (
    <div className="px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-12 md:pb-16">
      <Skeleton className="h-11 w-44 rounded-full" />
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        <FormShell className="flex flex-col items-center p-6 sm:p-8">
          <Skeleton className="h-24 w-24 rounded-full sm:h-28 sm:w-28" />
          <Skeleton className="mt-4 h-6 w-40" />
          <Skeleton className="mt-1.5 h-4 w-24" />
          <Skeleton className="mt-4 h-6 w-24 rounded-full" />
          <div className="mt-6 w-full space-y-2">
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </FormShell>
        <FormShell className="lg:col-span-2 p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            ))}
          </div>
        </FormShell>
      </div>
    </div>
  )
}

export function AdminCategoriesSkeleton() {
  return (
    <FormShell className="overflow-hidden rounded-2xl p-0">
      <div className="grid grid-cols-4 gap-2 border-b border-white/5 bg-white/[0.03] px-4 py-3.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-12 justify-self-end" />
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-3.5">
            <Skeleton className="h-6 w-6 rounded-lg" />
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="ml-auto h-3.5 w-40 hidden min-[800px]:block" />
            <Skeleton className="ml-auto h-3 w-20" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    </FormShell>
  )
}

export function AdminMediaSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }, (_, i) => (
        <FormShell key={i} className="overflow-hidden rounded-xl p-0">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </FormShell>
      ))}
    </div>
  )
}

export function AdminReportsSkeleton() {
  return (
    <div className="px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-12 md:pb-16">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
        {Array.from({ length: 4 }, (_, i) => (
          <FormShell key={i} className="p-4 md:p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="mt-1 h-3.5 w-24" />
              </div>
            </div>
          </FormShell>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-7">
        <FormShell className="p-5 md:p-6">
          <Skeleton className="h-5 w-40" />
          <div className="mt-6 flex h-40 items-end gap-3 px-2">
            {[96, 64, 132, 84, 116, 74, 148, 102].map((h, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded-[4px]"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        </FormShell>
        <FormShell className="p-5 md:p-6">
          <Skeleton className="h-5 w-40" />
          <div className="mt-6 flex items-center justify-center">
            <Skeleton className="h-[156px] w-[156px] rounded-full" />
          </div>
        </FormShell>
      </div>
    </div>
  )
}

export function AdminSettingsSkeleton() {
  return (
    <div className="px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-12 md:pb-16">
      <div className="flex flex-col gap-3 min-[700px]:flex-row min-[700px]:items-center min-[700px]:gap-2 pb-5">
        <Skeleton className="h-11 w-28 rounded-xl" />
        <Skeleton className="h-11 w-32 rounded-xl" />
        <Skeleton className="h-11 w-28 rounded-xl" />
        <Skeleton className="ml-auto h-11 w-28 rounded-xl" />
      </div>
      <FormShell className="max-w-3xl p-5 sm:p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-11 w-36 rounded-xl" />
          </div>
        </div>
      </FormShell>
    </div>
  )
}

export function AdminNewsFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-10 w-40 rounded-lg" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        <FormShell className="p-4 sm:p-6">
          <div className="flex items-center gap-1 border-b border-white/10 pb-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="ml-auto h-9 w-28 rounded-lg" />
          </div>
          <Skeleton className="mt-4 h-10 w-full rounded-lg" />
          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </FormShell>
        <div className="flex flex-col gap-5">
          <FormShell className="p-4 sm:p-5">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </FormShell>
          <FormShell className="p-4 sm:p-5">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          </FormShell>
        </div>
      </div>
    </div>
  )
}

export default {
  PageHeadingSkeleton,
  SearchBarSkeleton,
  KaryaPageSkeleton,
  KaryaProjectsPageSkeleton,
  BeritaPageSkeleton,
  MyKaryaStatsSkeleton,
  MyKaryaPageSkeleton,
  SavedKaryaPageSkeleton,
  ProjectDetailSkeleton,
  CommentsSkeleton,
  BeritaDetailSkeleton,
  EditKaryaFormSkeleton,
  AboutPageSkeleton,
  AdminDashboardSkeleton,
  AdminProjectsSkeleton,
  AdminNewsListSkeleton,
  AdminUsersSkeleton,
  AdminUserDetailSkeleton,
  AdminCategoriesSkeleton,
  AdminMediaSkeleton,
  AdminReportsSkeleton,
  AdminSettingsSkeleton,
  AdminNewsFormSkeleton,
}