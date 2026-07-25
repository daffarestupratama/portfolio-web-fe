/** The "/dir" wordmark as neofetch ASCII art — a leading slash + "dir" (figlet-ish). */
export const DIR_LOGO: string[] = [
  "   /       _ _      ",
  "  /     __| (_)_ __ ",
  " /     / _` | | '__|",
  "/     | (_| | | |   ",
  "       \\__,_|_|_|   ",
];

/** Small solid-block palette row shown under the neofetch info. */
export const COLOR_BLOCKS = "███ ███ ███ ███ ███ ███";

/** Build a cowsay block around a single message line. */
export function cowsay(message: string): string {
  const text = message.length ? message : "moo?";
  const top = " " + "_".repeat(text.length + 2);
  const bottom = " " + "-".repeat(text.length + 2);
  return [
    top,
    `< ${text} >`,
    bottom,
    "        \\   ^__^",
    "         \\  (oo)\\_______",
    "            (__)\\       )\\/\\",
    "                ||----w |",
    "                ||     ||",
  ].join("\n");
}
