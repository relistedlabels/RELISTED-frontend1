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
  /** Omit slide overlay; use smooth color transitions (works on solid dark fills). */
  simpleHover?: boolean;
  /** Smaller type and padding below `sm`; default sizing from `sm` up. */
  responsive?: boolean;
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
  backgroundColor = "bg-black",
  isLink = false,
  additionalClasses = "",
  simpleHover = false,
  responsive = false,
  icon, // Destructure the icon prop
}) => {
  const transitionPart = simpleHover
    ? "transition-colors duration-200 ease-out"
    : "";
  const layoutPart = simpleHover
    ? "relative flex items-center justify-center"
    : "relative overflow-hidden group flex items-center justify-center";
  const sizeClasses = responsive
    ? "text-xs leading-snug px-3 py-2 sm:text-sm sm:px-4 sm:py-2.5"
    : "px-4 py-2.5 text-sm";
  const commonClasses = `${layoutPart} font-semibold ${transitionPart} ${sizeClasses} ${backgroundColor} ${color} ${border} ${body_Font.className} rounded-lg cursor-pointer text-center disabled:cursor-not-allowed disabled:opacity-50 ${additionalClasses}`;

  const hoverEffectClasses =
    "absolute inset-0 bg-black -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out";

  const inner = (
    <span className="relative z-10 flex items-center justify-center gap-2">
      {icon && <span>{icon}</span>} {/* Render icon if provided */}
      {text}
    </span>
  );

  const content = simpleHover ? (
    inner
  ) : (
    <>
      <span className={hoverEffectClasses} aria-hidden="true"></span>
      {inner}
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
