"use client";

import React from "react";
import { firstProductAttachmentImageUrl } from "@/lib/product/sortProductAttachmentUploads";
import { cloudinaryOptimizedImageUrl } from "@/lib/media/cloudinaryOptimizedImageUrl";

/** Admin product rows return Prisma-shaped payloads from GET /api/admin/products/*. */
export function listingThumbnailUrl(product: {
  attachments?: {
    uploads?: Array<{ url?: string | null; displayOrder?: number | null }>;
  } | null;
  image?: string;
}): string | null {
  const u = firstProductAttachmentImageUrl(product.attachments?.uploads);
  if (u) return u;
  if (typeof product.image === "string" && product.image.trim())
    return product.image.trim();
  return null;
}

export function curatorAvatarUrl(product: {
  curator?: {
    avatar?: string | null;
    profile?: {
      avatar?: string | null;
      avatarUpload?: { url?: string } | null;
    } | null;
  } | null;
}): string | null {
  const c = product.curator;
  if (!c) return null;
  return (
    c.profile?.avatarUpload?.url ??
    c.profile?.avatar ??
    c.avatar ??
    null
  );
}

export function getInitials(name?: string): string {
  if (!name?.trim()) return "U";
  return name
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

export function AdminListingThumb({
  url,
  alt,
}: {
  url: string | null;
  alt?: string;
}) {
  if (!url) {
    return <div className="w-16 h-16 rounded object-cover bg-gray-200" />;
  }
  return (
    <img
      src={cloudinaryOptimizedImageUrl(url, { preset: "thumb" })}
      alt={alt || "Product"}
      className="w-16 h-16 rounded object-cover"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}

export function AdminCuratorAvatar({
  url,
  name,
  sizeClassName = "w-8 h-8 text-xs",
}: {
  url: string | null;
  name?: string;
  sizeClassName?: string;
}) {
  return (
    <div
      className={`${sizeClassName} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center font-semibold text-gray-600 shrink-0`}
    >
      {url ? (
        <img
          src={cloudinaryOptimizedImageUrl(url, { preset: "thumb" })}
          alt={name || "Curator"}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
