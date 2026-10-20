import { Delayed } from "@/components/ui/delayed";
import { Sk, SkLines } from "@/components/ui/skeleton";
import { PageTop } from "@/components/layout/page-top";

export default function Loading() {
  return (
    <>
      <PageTop />
      <main className="art" data-wide>
        <Delayed>
          <div className="art-grid" data-aside>
            <Sk r={24} className="art-aside sk-art-aside" />
            <div className="art-content">
              <Sk h={32} w={130} r={999} />
              <Sk h={44} r={12} style={{ marginTop: 26, width: "88%" }} />
              <div className="art-cover-well" style={{ marginTop: 26 }}>
                <Sk r={21} style={{ aspectRatio: "16 / 9" }} />
              </div>
              <div style={{ marginTop: 32 }}>
                <SkLines count={6} />
              </div>
            </div>
          </div>
        </Delayed>
      </main>
    </>
  );
}
