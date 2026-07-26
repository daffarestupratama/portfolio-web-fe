import type { Command, CommandContext } from "../terminal-types";
import { rich } from "../lines";
import { isHidden } from "../filesystem";
import { formatUptime } from "../util";
import { tildePath } from "../config";

// Display-group order for `help`. Built-in "personality" and CMS "fun" merge under
// one "fun" header; any unlisted category (unexpected CMS value) is appended.
const HELP_GROUP_ORDER = ["shell", "filesystem", "system", "fun", "about", "links", "custom", "misc"];
const displayGroup = (c: Command): string => (c.category === "personality" ? "fun" : c.category);

const help: Command = {
  name: "help",
  aliases: ["?"],
  summary: "list commands, or show help for one",
  category: "shell",
  manText:
    "help                 List every command, grouped by category.\n" +
    "help <command>       Show the detailed help for one command.\n\n" +
    "The list is generated from the command registry, so it always reflects\n" +
    "exactly what's installed.",
  run(ctx) {
    const topic = ctx.args[0];
    if (topic) {
      const cmd = ctx.registry.get(topic);
      if (!cmd) return ctx.printError(`help: no help topics match '${topic}'. Try \`help\`.`);
      ctx.print(`${cmd.name} — ${cmd.summary}`, "accent");
      ctx.print("");
      ctx.print(cmd.manText);
      return;
    }
    ctx.print("dirOS commands — `help <cmd>` or `man <cmd>` for details.", "dim");
    const groups = new Map<string, Command[]>();
    for (const c of ctx.registry.list()) {
      const g = displayGroup(c);
      const arr = groups.get(g) ?? [];
      arr.push(c);
      groups.set(g, arr);
    }
    const ordered = [
      ...HELP_GROUP_ORDER.filter((g) => groups.has(g)),
      ...[...groups.keys()].filter((g) => !HELP_GROUP_ORDER.includes(g)).sort(),
    ];
    for (const g of ordered) {
      const cmds = groups.get(g)!.slice().sort((a, b) => a.name.localeCompare(b.name));
      ctx.print("");
      ctx.print(g, "accent");
      for (const c of cmds) ctx.print(`  ${c.name.padEnd(10)} ${c.summary}`);
    }
  },
};

const man: Command = {
  name: "man",
  summary: "show the manual page for a command",
  category: "shell",
  manText: "man <command>        Display the full manual entry for a command.",
  run(ctx) {
    const topic = ctx.args[0];
    if (!topic) return ctx.printError("What manual page do you want? Try `man <command>`.");
    const cmd = ctx.registry.get(topic);
    if (!cmd) return ctx.printError(`No manual entry for ${topic}`);
    ctx.print(`${cmd.name.toUpperCase()}(1)`, "dim");
    ctx.print("");
    ctx.print("NAME", "accent");
    ctx.print(`  ${cmd.name} — ${cmd.summary}`);
    if (cmd.aliases?.length) {
      ctx.print("");
      ctx.print("ALIASES", "accent");
      ctx.print(`  ${cmd.aliases.join(", ")}`);
    }
    ctx.print("");
    ctx.print("DESCRIPTION", "accent");
    ctx.print(
      cmd.manText
        .split("\n")
        .map((l) => (l ? `  ${l}` : l))
        .join("\n"),
    );
  },
};

function parseLs(ctx: CommandContext) {
  const flags = ctx.args.filter((a) => a.startsWith("-")).join("");
  return { showAll: flags.includes("a"), pathArg: ctx.args.find((a) => !a.startsWith("-")) };
}

const ls: Command = {
  name: "ls",
  aliases: ["dir", "l"],
  summary: "list directory contents (-a shows hidden)",
  category: "filesystem",
  manText:
    "ls [-a] [path]       List the entries of a directory (default: current).\n" +
    "  -a                 Include hidden entries (dotfiles and dotdirs).\n\n" +
    "Directories are shown with a trailing slash.",
  run(ctx) {
    const { showAll, pathArg } = parseLs(ctx);
    const target = ctx.fs.resolve(ctx.cwd, pathArg);
    const node = ctx.fs.node(target);
    if (!node) return ctx.printError(`ls: cannot access '${pathArg}': No such file or directory`);
    if (node.type === "file") {
      ctx.print(pathArg ?? target);
      return;
    }
    let entries = ctx.fs.list(target) ?? [];
    if (!showAll) entries = entries.filter((e) => !isHidden(e.name));
    const dots = showAll ? [".", ".."] : [];
    const segments = [
      ...dots.map((name) => ({ text: `${name}/  `, tone: "dim" as const })),
      ...entries.flatMap((e) => {
        const dirLike = e.node.type === "dir";
        const tone = dirLike ? ("accent" as const) : isHidden(e.name) ? ("dim" as const) : ("fg" as const);
        return [{ text: `${e.name}${dirLike ? "/" : ""}`, tone }, { text: "  " }];
      }),
    ];
    if (!segments.length) return;
    ctx.printRich([rich(segments)]);
  },
};

const cd: Command = {
  name: "cd",
  summary: "change the current directory",
  category: "filesystem",
  manText:
    "cd [path]            Change directory. With no argument, go home (~).\n" +
    "Understands absolute (/…), relative, .. and ~ paths.",
  run(ctx) {
    const pathArg = ctx.args[0] ?? "~";
    const target = ctx.fs.resolve(ctx.cwd, pathArg);
    const node = ctx.fs.node(target);
    if (!node) return ctx.printError(`cd: no such file or directory: ${ctx.args[0] ?? "~"}`);
    if (node.type !== "dir") return ctx.printError(`cd: not a directory: ${ctx.args[0]}`);
    ctx.setCwd(target);
  },
};

const pwd: Command = {
  name: "pwd",
  summary: "print the working directory",
  category: "filesystem",
  manText: "pwd                  Print the absolute path of the current directory.",
  run(ctx) {
    ctx.print(ctx.cwd);
  },
};

const cat: Command = {
  name: "cat",
  summary: "print file contents",
  category: "filesystem",
  manText: "cat <file> [...]     Print the contents of one or more files.",
  run(ctx) {
    if (!ctx.args.length) return ctx.printError("cat: missing file operand");
    for (const arg of ctx.args) {
      const target = ctx.fs.resolve(ctx.cwd, arg);
      const node = ctx.fs.node(target);
      if (!node) {
        ctx.printError(`cat: ${arg}: No such file or directory`);
        continue;
      }
      if (node.type === "dir") {
        ctx.printError(`cat: ${arg}: Is a directory`);
        continue;
      }
      ctx.print(node.content.replace(/\n$/, ""));
    }
  },
};

const tree: Command = {
  name: "tree",
  summary: "show the directory tree",
  category: "filesystem",
  manText: "tree [path]          Print a recursive tree of directories and files.",
  run(ctx) {
    const startArg = ctx.args.find((a) => !a.startsWith("-"));
    const start = ctx.fs.resolve(ctx.cwd, startArg);
    const root = ctx.fs.node(start);
    if (!root) return ctx.printError(`tree: ${startArg}: No such file or directory`);
    let dirs = 0;
    let files = 0;
    ctx.printRich([rich([{ text: startArg ? tildePath(start) : "." }], { pre: true })]);
    const walk = (path: string, prefix: string) => {
      const entries = (ctx.fs.list(path) ?? []).filter((e) => !isHidden(e.name));
      entries.forEach((e, i) => {
        const last = i === entries.length - 1;
        const dirLike = e.node.type === "dir";
        if (dirLike) dirs++;
        else files++;
        ctx.printRich([
          rich(
            [
              { text: `${prefix}${last ? "└── " : "├── "}`, tone: "dim" },
              { text: `${e.name}${dirLike ? "/" : ""}`, tone: dirLike ? "accent" : "fg" },
            ],
            { pre: true },
          ),
        ]);
        if (dirLike) walk(`${path}/${e.name}`, `${prefix}${last ? "    " : "│   "}`);
      });
    };
    walk(start, "");
    ctx.print("");
    ctx.print(`${dirs} directories, ${files} files`, "dim");
  },
};

const clear: Command = {
  name: "clear",
  aliases: ["cls"],
  summary: "clear the screen",
  category: "shell",
  manText: "clear                Clear the terminal scrollback. (Ctrl+L does the same.)",
  run(ctx) {
    ctx.clear();
  },
};

const echo: Command = {
  name: "echo",
  summary: "print a line of text",
  category: "shell",
  manText: "echo [text ...]      Write the given text back to the terminal.",
  run(ctx) {
    ctx.print(ctx.args.join(" "));
  },
};

const whoami: Command = {
  name: "whoami",
  summary: "print the current user",
  category: "system",
  manText: "whoami               Print the current username.",
  run(ctx) {
    ctx.print(ctx.env.user);
  },
};

const dateCmd: Command = {
  name: "date",
  summary: "print the current date and time",
  category: "system",
  manText: "date                 Print the current date and time.",
  run(ctx) {
    ctx.print(new Date().toString());
  },
};

const uptime: Command = {
  name: "uptime",
  summary: "how long the site has been live",
  category: "system",
  manText:
    "uptime               Show how long this site has been live (since launch),\n" +
    "not a fake machine uptime.",
  run(ctx) {
    const time = new Date().toLocaleTimeString("en-GB");
    ctx.print(` ${time}  up ${formatUptime(ctx.env.launchedAt)},  1 visitor,  load average: 0.00, 0.01, 0.05`);
  },
};

const history: Command = {
  name: "history",
  summary: "show recently run commands",
  category: "shell",
  manText: "history              List the commands run this session (↑/↓ to recall).",
  run(ctx) {
    if (!ctx.history.length) return ctx.print("(no history yet)", "dim");
    ctx.history.forEach((h, i) => ctx.print(`  ${String(i + 1).padStart(3)}  ${h}`));
  },
};

const exit: Command = {
  name: "exit",
  aliases: ["logout", "quit"],
  summary: "leave the terminal and return to the site",
  category: "shell",
  manText: "exit                 Sign off and return to the homepage.",
  run(ctx) {
    ctx.print("logout", "dim");
    ctx.print(`Connection to ${ctx.env.host} closed.`, "dim");
    ctx.navigate("/");
  },
};

export const shellCommands: Command[] = [
  help,
  man,
  ls,
  cd,
  pwd,
  cat,
  tree,
  clear,
  echo,
  whoami,
  dateCmd,
  uptime,
  history,
  exit,
];
