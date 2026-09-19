import { ImageResponse } from "next/og";
import { loadRelistedLogoDataUrl } from "@/lib/pwa/loadLogoDataUrl";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default async function AppleIcon() {
  const logoSrc = await loadRelistedLogoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
        }}
      >
        <img
          src={logoSrc}
          alt=""
          width={112}
          height={87}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
