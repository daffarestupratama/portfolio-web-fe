export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ opacity: "var(--blob-op)" }}
    >
      <div
        className="absolute"
        style={{
          top: "-14%",
          left: "-10%",
          width: "52vw",
          height: "52vw",
          borderRadius: "50%",
          background: "radial-gradient(circle at 40% 40%, var(--blob-sky), transparent 66%)",
          filter: "blur(80px)",
          animation: "driftA var(--drift) ease-in-out infinite",
        }}
      />
      <div
        className="absolute"
        style={{
          top: "18%",
          right: "-14%",
          width: "56vw",
          height: "56vw",
          borderRadius: "50%",
          background: "radial-gradient(circle at 60% 40%, var(--blob-green), transparent 66%)",
          filter: "blur(88px)",
          animation: "driftB var(--drift) ease-in-out infinite",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: "-20%",
          left: "26%",
          width: "60vw",
          height: "52vw",
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 50%, var(--blob-lum), transparent 68%)",
          filter: "blur(90px)",
          animation: "driftC var(--drift) ease-in-out infinite",
        }}
      />
    </div>
  );
}
