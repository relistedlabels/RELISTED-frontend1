"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { devAuth } from "@/lib/devAuth";
import FullPageLoader from "@/common/ui/FullPageLoader";

const PUBLIC_PATHS = ["/dev", "/waitlist", "/auth", "/listers/inventory"];

export default function DevGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // ⛔ reset immediately on route change
    setChecked(false);

    const hasAccess = devAuth.hasAccess();

    if (pathname === "/") {
      if (!hasAccess) {
        router.replace("/waitlist");
        return;
      }
      setChecked(true);
      return;
    }

    const isPublic = PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );

    if (isPublic) {
      setChecked(true);
      return;
    }

    if (!hasAccess) {
      router.replace("/dev");
      return;
    }

    setChecked(true);
  }, [pathname, router]);

  // ⛔ block render until access check completes
  if (!checked) return <FullPageLoader />;

  return <>{children}</>;
}
