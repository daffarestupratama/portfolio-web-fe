import { Delayed } from "@/components/ui/delayed";
import { Sk, SkLines } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="ad" data-wide>
      <Delayed>
        <div className="ad-grid" data-aside>
          <Sk r={24} className="ad-aside sk-ad-aside" />
          <div className="ad-content">
            <Sk h={32} w={130} r={999} />
            <Sk h={44} r={12} style={{ marginTop: 26, width: "88%" }} />
            <div className="ad-cover-well" style={{ marginTop: 26 }}>
              <Sk r={21} style={{ aspectRatio: "16 / 9" }} />
            </div>
            <div style={{ marginTop: 32 }}>
              <SkLines count={6} />
            </div>
          </div>
        </div>
      </Delayed>
    </main>
  );
}
