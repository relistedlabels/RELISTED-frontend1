import { OnboardingBackdrop } from "./components/OnboardingBackdrop";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate min-h-[100dvh] w-full overflow-hidden">
      <OnboardingBackdrop />
      <div className="relative z-10 min-h-[100dvh]">{children}</div>
    </div>
  );
}
