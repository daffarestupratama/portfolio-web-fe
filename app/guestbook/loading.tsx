import { Delayed } from "@/components/ui/delayed";
import { Sk, SkPageHeader } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="relative z-[3]">
      <Delayed>
        <SkPageHeader titleWidth={240} />
        <section className="gb">
          <div className="gb-grid">
            <Sk h={420} r={28} />
            <div>
              <Sk h={26} w={170} r={8} />
              <div className="gb-list" style={{ marginTop: 20 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Sk key={i} h={130} r={24} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </Delayed>
    </main>
  );
}
