import { OnboardingBackdrop } from "./components/OnboardingBackdrop";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <OnboardingBackdrop />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
