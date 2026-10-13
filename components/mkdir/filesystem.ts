import type { DirEntry, FileSystem, FsDir, FsFile, FsNode } from "./terminal-types";
import { DOMAIN, HOME } from "./config";
import { CONTACT_FALLBACK } from "@/lib/contact";

const file = (content: string): FsFile => ({ type: "file", content: content.trimStart() });
const dir = (children: Record<string, FsNode>): FsDir => ({ type: "dir", children });

/** `about/contact.txt`: one `key : value` line per row, keys padded into a column. The page
 *  builds the rows from site-setting.contactLinks (see buildContactText in content/mkdir.ts). */
export function formatContactText(rows: { key: string; value: string }[]): string {
  const width = Math.max(...rows.map((r) => r.key.length)) + 1;
  return rows.map((r) => `${r.key.padEnd(width)}: ${r.value}`).join("\n") + "\n";
}

/** Used when the page passes no contact text. */
const DEFAULT_CONTACT_TEXT = formatContactText([
  { key: "email", value: CONTACT_FALLBACK.email },
  { key: "linkedin", value: "linkedin.com/in/daffarestupratama" },
  { key: "github", value: "github.com/daffarestupratama" },
  { key: "site", value: DOMAIN },
]);

// Home tree (~). Hidden entries are those whose name starts with "." (shown by `ls -a`).
const homeTree = (contactText: string): Record<string, FsNode> => ({
  "README.md": file(`
Welcome to dirOS — the terminal corner of daffarestupratama.com.
Poke around with \`ls\`, \`cd\`, and \`cat\`. Type \`help\` for the full list,
or \`neofetch\` for the vitals. \`exit\` drops you back to the site.
`),
  about: dir({
    "whoami.txt": file(`
Daffa Ilham Restupratama
Information Systems graduate, Universitas Indonesia.
I live where data, business, and technology overlap — data science,
dashboards, GIS, and building things for the web.
`),
    "stack.txt": file(`
Everyday tools:
  - Python, SQL, pandas, scikit-learn
  - TypeScript, React, Next.js, Tailwind
  - Strapi, PostgreSQL, Cloudflare
  - QGIS / Leaflet for maps
`),
    "education.txt": file(`
B.Sc. Information Systems — Universitas Indonesia.
Focus: data science, information systems, and business process.
`),
    "contact.txt": file(contactText),
  }),
  projects: dir({
    "README.txt": file(`
A few things I've built (full write-ups live at /projects on the site):
  - Financial distress prediction for Indonesian public companies
  - Hospital website & information system (Jakarta)
  - Assorted dashboards and GIS maps
Run \`exit\` and open /projects for the real pages.
`),
  }),
  games: dir({
    "README.txt": file(`
Games are coming soon — a little browser game is planned for a later phase.
For now, try \`matrix\`. Check back after the next deploy.
`),
  }),
  music: dir({
    "README.txt": file(`
A "now playing" corner is planned here. Nothing spinning yet.
`),
  }),
  ".secrets": dir({
    "flag.txt": file(`
You found the hidden directory. Have a cookie. 🍪
Try \`fortune\`, \`cowsay hello\`, or \`sudo make me a sandwich\`.
`),
  }),
  ".motd": file("Type `help` to get started.\n"),
});

/** Normalize a path into absolute segments, resolving "." and "..". */
function normalize(path: string): string {
  const out: string[] = [];
  for (const seg of path.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") out.pop();
    else out.push(seg);
  }
  return "/" + out.join("/");
}

export function createFileSystem(home = HOME, contactText = DEFAULT_CONTACT_TEXT): FileSystem {
  const root: FsDir = dir({ home: dir({ visitor: dir(homeTree(contactText)) }) });

  function node(path: string): FsNode | null {
    const abs = normalize(path);
    if (abs === "/") return root;
    let cur: FsNode = root;
    for (const seg of abs.split("/").filter(Boolean)) {
      if (cur.type !== "dir" || !(seg in cur.children)) return null;
      cur = cur.children[seg]!;
    }
    return cur;
  }

  return {
    home,
    resolve(cwd, arg) {
      if (arg == null || arg === "") return cwd;
      let expanded = arg;
      if (arg === "~") expanded = home;
      else if (arg.startsWith("~/")) expanded = home + arg.slice(1);
      const base = expanded.startsWith("/") ? expanded : `${cwd}/${expanded}`;
      return normalize(base);
    },
    node,
    isDir(path) {
      return node(path)?.type === "dir";
    },
    list(path) {
      const target = node(path);
      if (!target || target.type !== "dir") return null;
      const entries: DirEntry[] = Object.entries(target.children).map(([name, n]) => ({ name, node: n }));
      // Directories first, then alphabetical.
      return entries.sort((a, b) => {
        const ad = a.node.type === "dir" ? 0 : 1;
        const bd = b.node.type === "dir" ? 0 : 1;
        return ad !== bd ? ad - bd : a.name.localeCompare(b.name);
      });
    },
  };
}

export const isHidden = (name: string): boolean => name.startsWith(".");
