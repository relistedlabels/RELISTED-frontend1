"use client"; // This tells Next.js it's a client-side component

import Button from "@/common/ui/Button";
import Image from "next/image";
import { GFS_Didot } from "next/font/google";
import localFont from "next/font/local";
import {
  Header1,
  Header1Plus,
  Header2,
  Header3,
  Header4,
  Paragraph1,
  Paragraph2,
} from "@/common/ui/Text";



export default function Home() {
  const handleClick = () => {
    alert("Button clicked!");
  };
  return (
    <div className={` `}>
      <div className="p-6">
        <Header1 className="text-blue-600">This is Header 1</Header1>
        <Header1Plus className="text-blue-600">This is Header 1</Header1Plus>
        <Header2 className="text-primary">This is Header 2</Header2>
        <Header3>This is Header 3</Header3>
        <Header4>This is Header 4</Header4>
        <Paragraph1>
          This is a paragraph component. It can have a{" "}
          <span className="font-bold">span</span> text for emphasis.
        </Paragraph1>
        <Paragraph2>
          This is a paragraph component. It can have a{" "}
          <span className="font-bold">span</span> text for emphasis.
        </Paragraph2>
      </div>
      hello
      <Button
        text="Let’s work together"
        href="https://google.com"
        isLink={true}
        color="text-white"
        backgroundColor="bg-red-500"
        border="border-2 border-red-500"
      />
      <Button
        text="Custom Button"
        onClick={handleClick} // onClick is passed from a client component
        additionalClasses="border-white bg-black w-[300px]"
      />
     
    </div>
  );
}
