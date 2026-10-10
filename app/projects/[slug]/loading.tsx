import { Delayed } from "@/components/ui/delayed";
import { Sk, SkLines } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="relative z-[3]">
      <Delayed>
        <header className="pj-head">
          <Sk h={32} w={130} r={999} />
          <div className="pj-badges">
            <Sk h={26} w={120} r={999} />
            <Sk h={26} w={90} r={999} />
          </div>
          <Sk h={46} r={12} style={{ marginTop: 14, width: "85%" }} />
          <Sk h={18} r={9} style={{ marginTop: 16, width: "70%" }} />
        </header>
        <section className="pj-body">
          <div className="pj-cover-well">
            <Sk r={22} style={{ aspectRatio: "16 / 9" }} />
          </div>
          <div style={{ marginTop: 40 }}>
            <SkLines count={5} widths={(i) => `${90 - i * 8}%`} />
          </div>
        </section>
      </Delayed>
    </main>
  );
}
