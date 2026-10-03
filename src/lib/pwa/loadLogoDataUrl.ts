import { readFile } from "node:fs/promises";
import path from "node:path";

/** White R mark from `/public/images/logo.svg` for dark app icon backgrounds. */
export async function loadRelistedLogoDataUrl(): Promise<string> {
  const logoSvg = await readFile(
    path.join(process.cwd(), "public/images/logo.svg"),
    "utf8",
  );
  return `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString("base64")}`;
}
