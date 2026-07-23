import { Delayed } from "@/components/ui/delayed";

export default function Loading() {
  return (
    <main className="relative z-[3] pt-28 pb-8 sm:pt-32">
      <div className="mx-auto w-full max-w-[1180px] px-[22px]">
        <Delayed>
          <div className="skeleton" style={{ height: 48, maxWidth: 520, borderRadius: 12 }} />
          <div className="skeleton mt-4" style={{ height: 18, maxWidth: 620, borderRadius: 8 }} />
          <div className="skeleton mt-2" style={{ height: 18, maxWidth: 560, borderRadius: 8 }} />
          <div className="skeleton mt-7" style={{ height: 46, width: 190, borderRadius: 999 }} />

          <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 320, borderRadius: 22 }} />
            ))}
          </div>
        </Delayed>
      </div>
    </main>
  );
}
