// components/ProfileFromStore.tsx
"use client";

import React from "react";
import { useProfileStore } from "@/store/profileStore";

const ProfileFromStore = () => {
  const profile = useProfileStore((s) => s.profile);

  if (!profile) return null;

  console.log("PROFILE FROM STORE:", profile);

  return (
    <div>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
    </div>
  );
};

export default ProfileFromStore;
