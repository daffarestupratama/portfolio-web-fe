import { Delayed } from "@/components/ui/delayed";

export default function Loading() {
  return (
    <main className="relative z-[3] mx-auto w-full max-w-[820px] px-[22px] pt-28 pb-16 sm:pt-32">
      <Delayed>
        <div className="skeleton" style={{ height: 44, width: 240, borderRadius: 10 }} />
        <div className="skeleton mt-4" style={{ height: 16, maxWidth: 560, borderRadius: 8 }} />
        <div className="skeleton mt-7" style={{ aspectRatio: "16 / 9", borderRadius: 15 }} />
        <div className="mt-8 flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 15, width: i % 3 === 2 ? "70%" : "100%", borderRadius: 6 }} />
          ))}
        </div>
      </Delayed>
    </main>
  );
}
