export function OnboardingBackdrop() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-[#f7f3ec] via-[#efe8de] to-[#e5ddd2]" />

      <div
        className="absolute inset-0 opacity-[0.42] scale-110 blur-[56px]"
        style={{
          backgroundImage: "url(/images/sin1.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      />

      <div
        className="top-0 right-0 absolute opacity-[0.28] blur-[64px] rounded-full w-[min(70vw,640px)] h-[min(70vw,640px)] translate-x-1/3 -translate-y-1/4"
        style={{
          backgroundImage: "url(/images/sin2.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="-bottom-32 -left-20 absolute bg-[#3A3A32]/20 blur-3xl rounded-full w-[min(70vw,620px)] h-[min(70vw,620px)]" />
      <div className="top-1/3 -right-16 absolute bg-[#c4a484]/25 blur-3xl rounded-full w-80 h-80" />

      <div className="absolute inset-0 bg-gradient-to-t from-[#fafaf8]/80 via-transparent to-[#fafaf8]/30" />

      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #1b1f26 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}
