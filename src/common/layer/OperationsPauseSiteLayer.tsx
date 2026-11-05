"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import {
  dismissOperationsPauseAnnouncement,
  isOperationsPauseAnnouncementDismissed,
} from "@/lib/operations/operationsPause";
import { isOperationsPauseHeroPreviewEnabled } from "@/lib/operations/operationsPauseHeroCandidates";
import { useOperationsPause } from "@/lib/queries/site/useOperationsPause";
import {
  OPERATIONS_PAUSE_HERO_PREVIEW_PAUSE,
  OperationsPauseAnnouncementModal,
} from "./OperationsPauseAnnouncementModal";
import { OperationsPauseBanner } from "./OperationsPauseBanner";

type OperationsPauseSiteLayerProps = {
  children: ReactNode;
  /** Use `fixed` for lister/admin layouts with their own top bars. */
  bannerPlacement?: "inline" | "fixed";
};

/** Break announcement strip (in header) + first-visit modal. */
export function OperationsPauseSiteLayer({
  children,
  bannerPlacement = "inline",
}: OperationsPauseSiteLayerProps) {
  const searchParams = useSearchParams();
  const heroPreview = isOperationsPauseHeroPreviewEnabled(searchParams);

  const operationsPause = useOperationsPause();
  const { active, pauseReady } = operationsPause;
  const pause = heroPreview ? OPERATIONS_PAUSE_HERO_PREVIEW_PAUSE : operationsPause;
  const showPauseChrome = heroPreview || (pauseReady && active);

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (heroPreview) {
      setModalOpen(true);
      return;
    }
    if (!pauseReady) return;
    if (!active) {
      setModalOpen(false);
      return;
    }
    if (!isOperationsPauseAnnouncementDismissed()) {
      setModalOpen(true);
    }
  }, [active, pauseReady, heroPreview]);

  const closeModal = useCallback(() => {
    if (!heroPreview) {
      dismissOperationsPauseAnnouncement();
    }
    setModalOpen(false);
  }, [heroPreview]);

  const openModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const showBanner = showPauseChrome && !heroPreview;
  const contentOffsetClass =
    showBanner && bannerPlacement === "fixed"
      ? "pt-[var(--operations-pause-banner-height,0px)]"
      : undefined;

  return (
    <>
      {showBanner ? (
        <OperationsPauseBanner
          pause={pause}
          onOpenAnnouncement={openModal}
          placement={bannerPlacement}
        />
      ) : null}
      <div className={contentOffsetClass}>{children}</div>
      {showPauseChrome ? (
        <OperationsPauseAnnouncementModal
          open={modalOpen}
          pause={pause}
          onContinue={closeModal}
          heroPreview={heroPreview}
        />
      ) : null}
    </>
  );
}
