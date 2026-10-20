import { Delayed } from "@/components/ui/delayed";
import { Sk, SkLines } from "@/components/ui/skeleton";
import { PageTop } from "@/components/layout/page-top";

export default function Loading() {
  return (
    <>
      <PageTop />
      <main className="relative z-[3]">
        <Delayed>
          <header className="ab-head">
            <div className="ab-grid">
              <div className="ab-photo">
                <Sk r={30} style={{ aspectRatio: "844 / 1264" }} />
              </div>
              <div className="ab-text">
                <Sk h={50} w={240} r={14} style={{ maxWidth: "100%" }} />
                <div style={{ marginTop: 24 }}>
                  <SkLines count={8} />
                </div>
              </div>
            </div>
          </header>
        </Delayed>
      </main>
    </>
  );
}
