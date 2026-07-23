/** Append a prefilled message to a wa.me base URL (from site-setting.whatsappUrl). */
export function waLink(base: string, text: string): string {
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}text=${encodeURIComponent(text)}`;
}
