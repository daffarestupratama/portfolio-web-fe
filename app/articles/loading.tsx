import { Delayed } from "@/components/ui/delayed";
import { Sk, SkPageHeader } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="relative z-[3]">
      <Delayed>
        <SkPageHeader titleWidth={200} />
        <section className="pg-body">
          <div className="af">
            <div className="af-list">
              <div className="ar-list">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Sk key={i} h={150} r={24} />
                ))}
              </div>
            </div>
            <div className="af-col">
              <Sk r={26} className="sk-af-panel" />
            </div>
          </div>
        </section>
      </Delayed>
    </main>
  );
}
