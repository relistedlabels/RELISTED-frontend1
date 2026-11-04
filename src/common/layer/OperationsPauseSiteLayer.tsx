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
};

/** Break announcement strip (in header) + first-visit modal. */
export function OperationsPauseSiteLayer({
  children,
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

  return (
    <>
      {showPauseChrome && !heroPreview ? (
        <OperationsPauseBanner pause={pause} onOpenAnnouncement={openModal} />
      ) : null}
      {children}
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
