import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { Toaster } from "sonner";
import ApiTestComponent from "@/common/debug/ApiTestComponent";
import { AuthStateMonitorProvider } from "@/common/layer/AuthStateMonitorProvider";
import DesktopNavbar from "@/common/layer/DesktopNavbar";
import DevGuard from "@/common/layer/DevGuard";
import { FavoritesInitializer } from "@/common/layer/FavoritesInitializer";
import Footer from "@/common/layer/Footer";
import MobileNavbar from "@/common/layer/MobileNavbar";
import { UnauthorizedSignInRedirect } from "@/common/layer/UnauthorizedSignInRedirect";
import { UploaderProvider } from "@/context/UploaderProvider";
import QueryProvider from "@/lib/providers/query-provider";
import { Header } from "./Header";

export const metadata: Metadata = {
  title:
    "RELISTED LABELS is a peer-to-peer rental platform redefining how women access fashion across Africa.",
  description:
    "We enable individuals rent and buy standout pieces at a fraction of the retail price from each other and the brands they love. At the same time, users earn from their wardrobe by listing pieces through our secure, easy to navigate software.",
  keywords: ["Relisted", "Fashion", "Heritage", "Luxury", "Global Style"],
  authors: [{ name: "Relisted" }],
  openGraph: {
    title:
      "RELISTED LABELS is a peer-to-peer rental platform redefining how women access fashion across Africa.",
    description:
      "We enable individuals rent and buy standout pieces at a fraction of the retail price from each other and the brands they love. At the same time, users earn from their wardrobe by listing pieces through our secure, easy to navigate software.",
    url: "https://www.relisted.com",
    siteName: "Relisted",
    images: [
      {
        url: "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1764859037/Gemini_Generated_Image_co76dbco76dbco76_ufwf1e.png",
        secureUrl:
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1764859037/Gemini_Generated_Image_co76dbco76dbco76_ufwf1e.png",
        width: 1200,
        height: 630,
        alt: "Relisted",
      },
      {
        url: "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1764859022/Screenshot_2025-11-23_182146_nrhuzi.png",
        secureUrl:
          "https://res.cloudinary.com/dcb4ilgmr/image/upload/v1764859022/Screenshot_2025-11-23_182146_nrhuzi.png",
        width: 512,
        height: 512,
        type: "image/png",
        alt: "Relisted Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "RELISTED LABELS is a peer-to-peer rental platform redefining how women access fashion across Africa.",
    description:
      "We enable individuals rent and buy standout pieces at a fraction of the retail price from each other and the brands they love. At the same time, users earn from their wardrobe by listing pieces through our secure, easy to navigate software.",
    images: ["/og-image.jpg"],
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className=" ">
        {/* <DevGuard> */}
        <QueryProvider>
          <AuthStateMonitorProvider>
            <UnauthorizedSignInRedirect />
            <FavoritesInitializer />
            <UploaderProvider>
              <DesktopNavbar />
              <MobileNavbar />

              {/* <Header /> */}
              {children}
              <Toaster position="top-right" />
              <Footer />
              {/* <ApiTestComponent /> */}
            </UploaderProvider>
          </AuthStateMonitorProvider>
        </QueryProvider>
        {/* </DevGuard> */}
      </body>
    </html>
  );
}
