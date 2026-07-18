import { Delayed } from "@/components/ui/delayed";

export default function Loading() {
  return (
    <main className="relative z-[3] mx-auto w-full max-w-[1180px] px-[22px] pt-28 pb-16 sm:pt-32">
      <Delayed>
        <div className="skeleton" style={{ height: 40, width: 200, borderRadius: 10 }} />
        <div className="skeleton mt-4" style={{ height: 16, maxWidth: 460, borderRadius: 8 }} />
        <div className="mt-8 grid grid-cols-1 gap-[18px] md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 340, borderRadius: 22 }} />
          ))}
        </div>
      </Delayed>
    </main>
  );
}
