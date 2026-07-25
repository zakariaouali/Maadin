export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-10 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-3 w-10 bg-stone/20 rounded" />
        <div className="h-3 w-2 bg-stone/20 rounded" />
        <div className="h-3 w-16 bg-stone/20 rounded" />
        <div className="h-3 w-2 bg-stone/20 rounded" />
        <div className="h-3 w-32 bg-stone/20 rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image gallery skeleton */}
        <div className="space-y-3">
          <div className="aspect-square bg-stone/10 rounded-sm" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-16 h-16 bg-stone/10 rounded-sm" />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className="flex flex-col gap-5 pt-2">
          <div className="h-3 w-24 bg-stone/20 rounded" />
          <div className="space-y-2">
            <div className="h-8 w-3/4 bg-stone/20 rounded" />
            <div className="h-8 w-1/2 bg-stone/10 rounded" />
          </div>
          <div className="flex gap-1">
            {[1,2,3,4,5].map((i) => <div key={i} className="w-4 h-4 bg-stone/20 rounded-sm" />)}
            <div className="h-4 w-20 bg-stone/10 rounded ms-2" />
          </div>
          <div className="h-9 w-32 bg-stone/20 rounded" />
          <div className="h-6 w-20 bg-stone/10 rounded" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-stone/10 rounded" />
            <div className="h-3 w-5/6 bg-stone/10 rounded" />
            <div className="h-3 w-4/6 bg-stone/10 rounded" />
          </div>
          <div className="h-px bg-stone/20 my-2" />
          <div className="flex gap-3 mt-2">
            <div className="h-11 flex-1 bg-stone/20 rounded-sm" />
            <div className="h-11 w-11 bg-stone/10 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
