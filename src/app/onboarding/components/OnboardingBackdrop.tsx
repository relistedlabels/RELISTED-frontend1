export function OnboardingBackdrop() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden bg-[#f3f2ee]"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#fafaf8] via-[#f3eee6] to-[#ebe6de]" />

      <div
        className="absolute inset-0 opacity-[0.22] scale-105 blur-[72px]"
        style={{
          backgroundImage: "url(/images/sin1.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div
        className="top-0 right-0 absolute opacity-[0.12] blur-[80px] rounded-full w-[min(52vw,520px)] h-[min(52vw,520px)] translate-x-1/4 -translate-y-1/4"
        style={{
          backgroundImage: "url(/images/sin2.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="-bottom-24 -left-16 absolute bg-[#3A3A32]/10 blur-3xl rounded-full w-[min(60vw,560px)] h-[min(60vw,560px)]" />
      <div className="-right-10 bottom-1/4 absolute bg-black/5 blur-3xl rounded-full w-72 h-72" />

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #1b1f26 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="absolute inset-0 bg-[#fafaf8]/35" />
    </div>
  );
}
