import { Delayed } from "@/components/ui/delayed";
import { Sk, SkPageHeader } from "@/components/ui/skeleton";
import { bentoRows } from "@/components/cards/bento";
import { PageTop } from "@/components/layout/page-top";

export default function Loading() {
  return (
    <>
      <PageTop />
      <main className="relative z-[3]">
        <Delayed>
          <SkPageHeader titleWidth={200} />
          <section className="pg-body">
            <div className="bento" data-layout="projects">
              {Array.from({ length: 6 }).map((_, i) => (
                <Sk key={i} r={26} className="sk-tile" rows={bentoRows("projects", i)} />
              ))}
            </div>
          </section>
        </Delayed>
      </main>
    </>
  );
}
