"use client";

import React from "react";
import Link from "next/link";
import localFont from "next/font/local";

const body_Font = localFont({
  src: "../fonts/Poppins/Poppins-Regular.ttf",
});

interface ButtonProps {
  text: string;
  onClick?: () => void;
  href?: string;
  color?: string;
  border?: string;
  backgroundColor?: string;
  isLink?: boolean;
  additionalClasses?: string;
  type?: any;
  disabled?: any;
  icon?: React.ReactNode; // Add an icon prop of type ReactNode
}

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  type,
  disabled,
  href,
  color = "text-white",
  border = "border",
  backgroundColor = "bg-primary",
  isLink = false,
  additionalClasses = "",
  icon, // Destructure the icon prop
}) => {
  const commonClasses = `relative font-semibold justify-center flex items-center  overflow-hidden group ${backgroundColor} ${color} ${border} ${body_Font.className} px-[17px] py-[7px] font-medium  text-[13px] sm:text-[13px]  rounded-[4px] cursor-pointer text-center ${additionalClasses}`;

  const hoverEffectClasses =
    "absolute inset-0 bg-black  -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out";

  const content = (
    <>
      <span className={hoverEffectClasses} aria-hidden="true"></span>
      <span className="relative  z-10 flex items-center gap-2">
        {icon && <span>{icon}</span>} {/* Render icon if provided */}
        {text}
      </span>
    </>
  );

  if (isLink && href) {
    return (
      <Link href={href} passHref className={commonClasses} onClick={onClick}>
        <p>{content}</p>
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={commonClasses}
      disabled={disabled}
    >
      {content}
    </button>
  );
};

export default Button;
