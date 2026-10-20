import { Delayed } from "@/components/ui/delayed";
import { Sk, SkPageHeader } from "@/components/ui/skeleton";
import { PageTop } from "@/components/layout/page-top";

export default function Loading() {
  return (
    <>
      <PageTop />
      <main className="relative z-[3]">
        <Delayed>
          <SkPageHeader titleWidth={320} />
          <div className="tr">
            <div className="tr-hero-well">
              <Sk r={21} style={{ aspectRatio: "21 / 9" }} />
            </div>
            <div className="tr-grid" style={{ marginTop: 48 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Sk key={i} h={230} r={26} />
              ))}
            </div>
          </div>
        </Delayed>
      </main>
    </>
  );
}
