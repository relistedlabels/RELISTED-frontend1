"use client";

import React from "react";
import Image from "next/image";
import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";

export default function ContactSection() {
  return (
    <section className="w-full bg-gray-100  pt-[85px] sm:pt-[100px] ">
      <div className="grid grid-cols-1 md:grid-cols-2 justify-center items-center gap-10 ">
        {/* Image - hidden on mobile */}
        <div className="relative w-full h-screen hidden md:block">
          <Image
            src="/images/parabg.png" // replace with your image path
            alt="Contact Us"
            fill
            className="object-cover"
          />
        </div>

        {/* Form */}
        <div className="w-full  p-4 sm:px-24">
          <Header1Plus className="text-3xl uppercase text-center font-serif mb-6">
            Contact Us
          </Header1Plus>
          <form className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label htmlFor="firstName" className="mb-1 font-medium">
                  <Paragraph1>First Name</Paragraph1>
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Enter first name"
                  className="w-full bg-white  p-3 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="lastName" className="mb-1 font-medium">
                  <Paragraph1>Last Name</Paragraph1>
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Enter last name"
                  className="w-full bg-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="email" className="mb-1 font-medium">
                <Paragraph1>Email</Paragraph1>
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter email"
                className="w-full bg-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="message" className="mb-1 font-medium">
                <Paragraph1>Message</Paragraph1>
              </label>
              <textarea
                id="message"
                placeholder="Leave us a message"
                rows={5}
                className="w-full bg-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <Button
                type="submit"
                text="Sign In"
                backgroundColor="bg-black"
                border="border border-black "
                color="text-white"
              />
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
