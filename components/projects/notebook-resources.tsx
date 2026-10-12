import type { NotebookResource } from "@/content/projects";
import { titleCase } from "@/lib/mappers";

interface NotebookResourcesProps {
  resources: NotebookResource[];
}

const EMBED_KINDS = new Set(["interactive_chart", "dashboard", "html_export", "map"]);

/** Renders a single notebook/output resource by kind: embed (iframe), link, or
 *  file download — degrading to a title + description card when nothing is filled in.
 *  Card styling is 2a's (kind chip, title, description, action at the foot). */
function ResourceItem({ resource }: { resource: NotebookResource }) {
  const embedSrc = resource.embedUrl || (EMBED_KINDS.has(resource.kind) ? resource.url : null);
  const canEmbed = Boolean(embedSrc) && EMBED_KINDS.has(resource.kind);
  const linkUrl = !canEmbed ? resource.url : null;
  const fileUrl = !canEmbed && !linkUrl ? resource.fileUrl : null;
  const actionUrl = linkUrl || fileUrl;

  return (
    <div className="nb">
      <span className="nb-kind mono">{titleCase(resource.kind)}</span>
      <h3 className="nb-title">{resource.title}</h3>
      {resource.description && <p className="nb-desc">{resource.description}</p>}

      {canEmbed && embedSrc && (
        <iframe
          src={embedSrc}
          title={resource.title}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          className="nb-embed"
        />
      )}

      {actionUrl && (
        <a
          href={actionUrl}
          target="_blank"
          rel="noopener noreferrer"
          {...(fileUrl ? { download: true } : {})}
          className="nb-action mono"
        >
          {fileUrl ? "Download" : "Open"}
          <span aria-hidden="true"> ↗</span>
        </a>
      )}
    </div>
  );
}

export function NotebookResources({ resources }: NotebookResourcesProps) {
  if (resources.length === 0) return null;
  return (
    <div className="nb-grid">
      {resources.map((r) => (
        <ResourceItem key={r.id} resource={r} />
      ))}
    </div>
  );
}
