import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import { createSerwistRoute } from "@serwist/turbopack";

function getSerwistRevision() {
  const stdout = spawnSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf-8",
  }).stdout?.trim();
  return stdout || crypto.randomUUID();
}

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    additionalPrecacheEntries: [{ url: "/offline", revision: getSerwistRevision() }],
    swSrc: "src/app/sw.ts",
    useNativeEsbuild: true,
  });
