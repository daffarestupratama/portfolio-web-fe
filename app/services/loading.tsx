import { Delayed } from "@/components/ui/delayed";
import { Sk } from "@/components/ui/skeleton";
import { PageTop } from "@/components/layout/page-top";

export default function Loading() {
  return (
    <>
      <PageTop />
      <main className="relative z-[3]">
        <Delayed>
          <header className="sv-hero">
            <div className="sv-hero-grid">
              <div className="sv-hero-text">
                <Sk h={50} r={14} style={{ maxWidth: 560 }} />
                <Sk h={50} r={14} style={{ marginTop: 8, maxWidth: 420 }} />
                <Sk h={18} r={9} style={{ marginTop: 18, maxWidth: 620 }} />
                <Sk h={18} r={9} style={{ marginTop: 8, maxWidth: 540 }} />
                <div className="sv-hero-ctas">
                  <Sk h={48} w={200} r={999} />
                  <Sk h={48} w={110} r={999} />
                </div>
              </div>
              <Sk r={28} className="sk-stage" />
            </div>
          </header>
          <div className="sv-body">
            <div className="sv-sec sv-sec-first">
              <Sk h={34} w={280} r={10} style={{ maxWidth: "100%" }} />
              <div className="sv-ft-grid">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Sk key={i} h={190} r={24} />
                ))}
              </div>
            </div>
          </div>
        </Delayed>
      </main>
    </>
  );
}
