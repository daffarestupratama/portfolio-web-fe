import { Delayed } from "@/components/ui/delayed";

export default function Loading() {
  return (
    <main className="relative z-[3] mx-auto w-full max-w-[760px] px-[22px] pt-28 pb-16 sm:pt-32">
      <Delayed>
        <div className="skeleton" style={{ height: 40, width: 220, borderRadius: 10 }} />
        <div className="skeleton mt-4" style={{ height: 16, maxWidth: 460, borderRadius: 8 }} />
        <div className="skeleton mt-8" style={{ height: 260, borderRadius: 22 }} />
        <div className="mt-12 flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 18 }} />
          ))}
        </div>
      </Delayed>
    </main>
  );
}
