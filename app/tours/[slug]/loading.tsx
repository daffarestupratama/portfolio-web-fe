import { Delayed } from "@/components/ui/delayed";
import { Sk, SkLines } from "@/components/ui/skeleton";
import { PageTop } from "@/components/layout/page-top";

export default function Loading() {
  return (
    <>
      <PageTop />
      <main className="relative z-[3]">
        <Delayed>
          <header className="pj-head">
            <Sk h={32} w={110} r={999} />
            <Sk h={46} r={12} style={{ marginTop: 22, width: "80%" }} />
            <Sk h={18} r={9} style={{ marginTop: 16, width: "95%" }} />
          </header>
          <section className="pj-body">
            <div className="pj-cover-well">
              <Sk r={22} style={{ aspectRatio: "16 / 9" }} />
            </div>
            <div style={{ marginTop: 40 }}>
              <SkLines count={5} widths={(i) => `${92 - i * 9}%`} />
            </div>
          </section>
        </Delayed>
      </main>
    </>
  );
}
