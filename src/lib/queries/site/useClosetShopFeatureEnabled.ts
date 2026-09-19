import { usePublicSiteFeatures } from "./useSiteFeatures";
import { isClosetShopFeatureEnabled } from "@/lib/site/closetShopFeature";

export function useClosetShopFeatureEnabled(): {
  enabled: boolean;
  isLoading: boolean;
} {
  const { data, isLoading } = usePublicSiteFeatures();
  return {
    enabled: isClosetShopFeatureEnabled(data?.data),
    isLoading,
  };
}
