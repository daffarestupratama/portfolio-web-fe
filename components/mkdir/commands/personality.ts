import type { Command, TermSegment } from "../terminal-types";
import { rich } from "../lines";
import { cowsay as buildCow, DIR_LOGO, COLOR_BLOCKS } from "../ascii";
import { matrixApp } from "../apps/matrix";
import { formatUptime } from "../util";
import { DOMAIN, LOCATION, ROLE } from "../config";

const FORTUNES = [
  "There are only two hard things in computer science: cache invalidation, naming things, and off-by-one errors.",
  "Weeks of coding can save you hours of planning.",
  "A SQL query walks into a bar, walks up to two tables and asks: can I join you?",
  "The best time to normalize your data was at design time. The second best time is now.",
  "It's not a bug — it's an undocumented feature.",
  "Ship it. The map is not the territory, and neither is staging.",
  "Data is like a city: the value is in the streets between the buildings.",
  "git commit -m 'final' — narrator: it was not final.",
];

function neofetchInfo(env: {
  user: string;
  host: string;
  launchedAt: Date;
  counts: { projects: number; articles: number; tours: number };
  stack: string[];
}): TermSegment[][] {
  const kv = (label: string, value: string): TermSegment[] => [
    { text: label.padEnd(11), tone: "accent" },
    { text: value },
  ];
  const title = `${env.user}@${env.host}`;
  return [
    [{ text: title, tone: "green" }],
    [{ text: "-".repeat(title.length), tone: "dim" }],
    kv("OS:", "dirOS 1.0 x86_64 (web)"),
    kv("Host:", DOMAIN),
    kv("Role:", ROLE),
    kv("Location:", LOCATION),
    kv("Shell:", "dirsh 1.0"),
    kv("Theme:", "dirOS-dark [always]"),
    kv("Uptime:", formatUptime(env.launchedAt)),
    kv("Packages:", `${env.stack.length} (curated)`),
    kv("Stack:", env.stack.slice(0, 5).join(", ")),
    kv(
      "Content:",
      `${env.counts.projects} projects · ${env.counts.articles} articles` +
        (env.counts.tours > 0 ? ` · ${env.counts.tours} tours` : ""),
    ),
    [{ text: "" }],
    [{ text: COLOR_BLOCKS, tone: "accent" }],
  ];
}

const neofetch: Command = {
  name: "neofetch",
  aliases: ["fetch"],
  summary: "system info card for the site",
  category: "system",
  manText:
    "neofetch             Print the /dir ASCII logo and a neofetch-style info card\n" +
    "about this site (role, stack, uptime, content counts).",
  run(ctx) {
    const info = neofetchInfo(ctx.env);
    const narrow = typeof window !== "undefined" && window.innerWidth < 640;

    if (narrow) {
      // Stack the art above the info so nothing wraps badly on phones.
      for (const l of DIR_LOGO) ctx.printRich([rich([{ text: l, tone: "accent" }], { pre: true })]);
      ctx.print("");
      for (const row of info) ctx.printRich([rich(row, { pre: true })]);
      return;
    }

    const artWidth = Math.max(...DIR_LOGO.map((l) => l.length));
    const rows = Math.max(DIR_LOGO.length, info.length);
    for (let i = 0; i < rows; i++) {
      const artLine = (DIR_LOGO[i] ?? "").padEnd(artWidth);
      const segments: TermSegment[] = [{ text: `${artLine}    `, tone: "accent" }, ...(info[i] ?? [])];
      ctx.printRich([rich(segments, { pre: true })]);
    }
  },
};

const fortune: Command = {
  name: "fortune",
  summary: "a random programmer fortune",
  category: "personality",
  manText: "fortune              Print a random quip.",
  run(ctx) {
    ctx.print(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]!);
  },
};

const cowsay: Command = {
  name: "cowsay",
  summary: "a cow says your text",
  category: "personality",
  manText: "cowsay [text ...]    An ASCII cow says whatever you type.",
  run(ctx) {
    ctx.printPre(buildCow(ctx.args.join(" ")), "green");
  },
};

const sudo: Command = {
  name: "sudo",
  summary: "attempt to run as root",
  category: "personality",
  manText: "sudo <anything>      Nice try.",
  run(ctx) {
    ctx.print(`[sudo] password for ${ctx.env.user}: `, "dim");
    ctx.print(`${ctx.env.user} is not in the sudoers file. This incident will be reported.`, "red");
  },
};

const matrix: Command = {
  name: "matrix",
  summary: "enter the matrix (any key exits)",
  category: "personality",
  manText: "matrix               Character-rain effect. Press any key or tap to exit.",
  run(ctx) {
    ctx.runApp(matrixApp());
  },
};

export const personalityCommands: Command[] = [neofetch, fortune, cowsay, sudo, matrix];
