import type { NotebookResource } from "@/content/projects";
import { titleCase } from "@/lib/mappers";
import { ExternalLinkIcon } from "@/components/ui/icons";

interface NotebookResourcesProps {
  resources: NotebookResource[];
}

const EMBED_KINDS = new Set(["interactive_chart", "dashboard", "html_export", "map"]);

/** Renders a single notebook/output resource by kind: embed (iframe), link, or
 *  file download — degrading to a title + description card when nothing is filled in. */
function ResourceItem({ resource }: { resource: NotebookResource }) {
  const embedSrc = resource.embedUrl || (EMBED_KINDS.has(resource.kind) ? resource.url : null);
  const canEmbed = Boolean(embedSrc) && EMBED_KINDS.has(resource.kind);
  const linkUrl = !canEmbed ? resource.url : null;
  const fileUrl = !canEmbed && !linkUrl ? resource.fileUrl : null;
  const actionUrl = linkUrl || fileUrl;

  return (
    <div className="glass-card p-4" style={{ borderRadius: 16 }}>
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className="badge"
          style={{ color: "var(--accent-ink)", background: "var(--chip)", borderColor: "var(--chip-brd)" }}
        >
          {titleCase(resource.kind)}
        </span>
        <h3 className="text-[15px] font-semibold" style={{ letterSpacing: "-0.01em" }}>
          {resource.title}
        </h3>
      </div>

      {resource.description && (
        <p className="mt-2 text-[13.5px]" style={{ lineHeight: 1.55, color: "var(--ink-dim)" }}>
          {resource.description}
        </p>
      )}

      {canEmbed && embedSrc && (
        <iframe
          src={embedSrc}
          title={resource.title}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          className="mt-3 w-full"
          style={{ aspectRatio: "16 / 9", border: "1px solid var(--glass-brd)", borderRadius: 12 }}
        />
      )}

      {actionUrl && (
        <a
          href={actionUrl}
          target="_blank"
          rel="noopener noreferrer"
          {...(fileUrl ? { download: true } : {})}
          className="glass-pill mt-3 gap-2 px-4 py-2 text-[13px] font-semibold"
        >
          {fileUrl ? "Download" : "Open"}
          <ExternalLinkIcon />
        </a>
      )}
    </div>
  );
}

export function NotebookResources({ resources }: NotebookResourcesProps) {
  if (resources.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      {resources.map((r) => (
        <ResourceItem key={r.id} resource={r} />
      ))}
    </div>
  );
}
