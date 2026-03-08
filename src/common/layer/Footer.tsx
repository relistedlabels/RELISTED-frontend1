"use client";
import React from "react";
import { Header1, Header1Plus, ParagraphLink2 } from "../ui/Text";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { shouldShowNavBar } from "@/lib/navbarRoutes";

export default function Footer() {
  const pathname = usePathname();

  if (!shouldShowNavBar(pathname)) return null;

  return (
    <footer className="w-full bg-black text-white py-14 px-4 sm:px-0  font-light tracking-wide">
      <div className="mx-auto  container">
        {" "}
        <div className="w-full  grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* NAVIGATION */}
          <div className="space-y-3.5">
            <ParagraphLink2 className=" text-[#8F8F8F]">
              NAVIGATION
            </ParagraphLink2>
            <ul className="flex flex-col space-y-3.5 text-sm opacity-70">
              <li>
                <Link href="/">
                  <ParagraphLink2 className="hover:opacity-100 cursor-pointer">
                    Home
                  </ParagraphLink2>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <ParagraphLink2 className="hover:opacity-100 cursor-pointer">
                    About
                  </ParagraphLink2>
                </Link>
              </li>
              <li>
                <Link href="/contact-us">
                  <ParagraphLink2 className="hover:opacity-100 cursor-pointer">
                    Contact
                  </ParagraphLink2>
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy">
                  <ParagraphLink2 className="hover:opacity-100 cursor-pointer">
                    Privacy Policy
                  </ParagraphLink2>
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions">
                  <ParagraphLink2 className="hover:opacity-100 cursor-pointer">
                    Terms & Conditions
                  </ParagraphLink2>
                </Link>
              </li>
            </ul>
          </div>

          {/* SHOP */}
          <div className="space-y-3.5">
            <ParagraphLink2 className=" text-[#8F8F8F]">SHOP</ParagraphLink2>
            <ul className="flex flex-col space-y-3.5 text-sm opacity-70">
              <li>
                <Link href="/shop">
                  <ParagraphLink2 className="hover:opacity-100 cursor-pointer">
                    Browse all
                  </ParagraphLink2>
                </Link>
              </li>
              <li>
                <Link href="/listers-marketplace">
                  <ParagraphLink2 className="hover:opacity-100 cursor-pointer">
                    All Listers
                  </ParagraphLink2>
                </Link>
              </li>
              <li>
                <Link href="/shop?gender=Men&title=Men%27s+Collections&description=Shop+men%27s+fashion">
                  <ParagraphLink2 className="hover:opacity-100 cursor-pointer">
                    Mens
                  </ParagraphLink2>
                </Link>
              </li>
              <li>
                <Link href="/shop?gender=Woman&title=Women%27s+Collections&description=Shop+women%27s+fashion">
                  <ParagraphLink2 className="hover:opacity-100 cursor-pointer">
                    Womens
                  </ParagraphLink2>
                </Link>
              </li>
              {/* <li>
                <Link href="/shop?gender=Kids&title=Kids+Collections&description=Shop+kids+fashion">
                  <ParagraphLink2 className="hover:opacity-100 cursor-pointer">
                    Kids
                  </ParagraphLink2>
                </Link>
              </li> */}
            </ul>
          </div>

          {/* SUPPORT & CONTACT */}
          <div className="space-y-3.5">
            <ParagraphLink2 className=" text-[#8F8F8F]">
              SUPPORT & CONTACT
            </ParagraphLink2>
            <ul className="flex flex-col space-y-3.5 text-sm opacity-70">
              <li>
                <a href="mailto:relistedlabels.contact@gmail.com?subject=Support%20Request">
                  <ParagraphLink2 className="hover:opacity-100 cursor-pointer">
                    Support
                  </ParagraphLink2>
                </a>
              </li>
              <li>
                <a href="mailto:relistedlabels.contact@gmail.com?subject=Partnership%20Inquiry">
                  <ParagraphLink2 className="hover:opacity-100 cursor-pointer">
                    Partnerships
                  </ParagraphLink2>
                </a>
              </li>
              <li>
                <a href="mailto:relistedlabels.contact@gmail.com?subject=Press%20Inquiry">
                  <ParagraphLink2 className="hover:opacity-100 cursor-pointer">
                    Press
                  </ParagraphLink2>
                </a>
              </li>
              <li>
                <a href="mailto:relistedlabels.contact@gmail.com?subject=Career%20Inquiry">
                  <ParagraphLink2 className="hover:opacity-100 cursor-pointer">
                    Careers
                  </ParagraphLink2>
                </a>
              </li>
            </ul>
          </div>

          {/* SOCIAL */}
          <div className="space-y-3.5">
            <ParagraphLink2 className=" text-[#8F8F8F]">SOCIAL</ParagraphLink2>
            <ul className="flex flex-col space-y-3.5 text-sm opacity-70">
              <li>
                <Link
                  href="https://www.instagram.com/relistedlabels?igsh=ZDZybGdwaGY5YWs5"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ParagraphLink2 className="hover:opacity-100 cursor-pointer">
                    Instagram
                  </ParagraphLink2>
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.tiktok.com/@relistedlabels?_r=1&_t=ZS-94Ux8kvQOwf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ParagraphLink2 className="hover:opacity-100 cursor-pointer">
                    TikTok
                  </ParagraphLink2>
                </Link>
              </li>
            </ul>
          </div>

          {/* SUBSCRIBE TO NEWSLETTER */}
          <div className="space-y-3.5 lg:col-span-2">
            <ParagraphLink2 className="  text-[#8F8F8F]">
              SUBSCRIBE TO NEWSLETTER
            </ParagraphLink2>

            <form className="flex items-center p-2 font-semibold bg-transparent border border-gray-700 overflow-hidden lg:w-full justify-between">
              <input
                type="email"
                placeholder="Your Email"
                className=" bg-transparent outline-none  px-3 placeholder-gray-500"
              />
              <button
                type="submit"
                className="bg-white text-black py-2 px-5  h-full"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>
        <hr className=" mt-14 text-gray-500" />
        <ParagraphLink2 className="mt-8  text-center sm:text-start">
          Copyright © 2026, RELISTED Labels
        </ParagraphLink2>
        {/* COPYRIGHT TEXT */}
        <div className=" text-center sm:hidden flex justify-center py-8">
          {" "}
          <Header1>RELISTED</Header1>
        </div>
      </div>{" "}
    </footer>
  );
}
