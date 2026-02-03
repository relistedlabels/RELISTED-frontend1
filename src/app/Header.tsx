"use client";

import { useEffect } from "react";
import { useMe } from "@/lib/queries/auth/useMe";

export function Header() {
  const { data: user, isLoading } = useMe();


  
  useEffect(() => {
    if (isLoading) return;


    if (user) {
      console.log("Logged in:", {
        email: user.email,
        id: user.id,
      });
    } else {
      console.log("Not logged in");
    }
  }, [user, isLoading]);

  return null;

}


