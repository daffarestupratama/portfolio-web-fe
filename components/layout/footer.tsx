export function Footer() {
  return (
    <footer className="relative z-[3] flex justify-center px-[22px] pt-[30px] pb-11">
      <div
        className="flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-4 px-5 py-[18px] sm:px-[22px]"
        style={{
          borderRadius: 20,
          background: "var(--glass-bg)",
          backgroundImage: "var(--glass-tint)",
          backdropFilter: "blur(var(--glass-blur)) saturate(180%)",
          border: "1px solid var(--glass-brd)",
          boxShadow: "inset 0 1px 0 var(--glass-hi)",
        }}
      >
        <span className="text-[13px]" style={{ color: "var(--ink-faint)" }}>
          © 2026 Daffa Ilham Restupratama
        </span>
        <span className="mono text-[11px]" style={{ color: "var(--ink-faint)" }}>
          Data · Business · Finance · Maps · Walking Tours
        </span>
      </div>
    </footer>
  );
}
