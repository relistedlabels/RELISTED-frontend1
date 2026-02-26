"use client";

import { useEffect } from "react";
import { useMe } from "@/lib/queries/auth/useMe";
import { useFavorites } from "@/lib/queries/renters/useFavorites";
import { useFavoriteCountStore } from "@/store/useFavoriteCountStore";

/**
 * FavoritesInitializer
 * Initializes the favorite count from the server when the user is authenticated.
 * This component should be placed in the root layout to ensure the count is updated on app load.
 */
export function FavoritesInitializer() {
  const { data: user } = useMe();
  const { data: favoritesData } = useFavorites(1, 1);
  const reset = useFavoriteCountStore((state) => state.reset);

  useEffect(() => {
    if (!user) {
      // Reset count when user logs out
      reset();
    }
  }, [user, reset]);

  return null;
}
