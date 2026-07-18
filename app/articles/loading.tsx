import { Delayed } from "@/components/ui/delayed";

export default function Loading() {
  return (
    <main className="relative z-[3] mx-auto w-full max-w-[1180px] px-[22px] pt-28 pb-16 sm:pt-32">
      <Delayed>
        <div className="skeleton" style={{ height: 40, width: 200, borderRadius: 10 }} />
        <div className="skeleton mt-4" style={{ height: 16, maxWidth: 460, borderRadius: 8 }} />
        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <aside className="flex flex-col gap-4 lg:order-2 lg:w-[290px] lg:shrink-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 84, borderRadius: 12 }} />
            ))}
          </aside>
          <div className="flex flex-1 flex-col gap-4 lg:order-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 150, borderRadius: 18 }} />
            ))}
          </div>
        </div>
      </Delayed>
    </main>
  );
}
