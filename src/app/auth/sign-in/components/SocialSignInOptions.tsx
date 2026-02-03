"use client";

import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { FaApple } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import { GoogleLoginButton } from "./GoogleLoginButton";

const SocialSignInOptions: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleAppleSignIn = () => {
    console.log("Attempting sign in with Apple...");
  };

  const handleLoginRedirect = () => {
    if (pathname === "/auth/sign-in") {
      router.push("/auth/create-account");
    } else {
      router.push("/auth/sign-in");
    }
  };

  const isLoginPage = pathname === "/auth/sign-in";

  return (
    <div className="font-sans w-full">
      {/* OR Separator */}
      <div className="flex- items-center hidden my-6">
        <div className="grow border-t border-gray-300" />
        <span className="shrink mx-4 text-sm font-medium text-gray-500">
          OR
        </span>
        <div className="grow border-t border-gray-300" />
      </div>
      <div className="space-y-4 hidden">
        <GoogleLoginButton />

        <button
          disabled
          onClick={handleAppleSignIn}
          className="w-full flex items-center justify-center space-x-3 py-3 px-4 border rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition"
        >
          <FaApple className="w-5 h-5 text-gray-900" />
          <span>Continue with Apple</span>
        </button>
      </div>

      <div className="text-center mt-6">
        <Paragraph1 className="text-sm text-gray-600">
          {isLoginPage ? "Don’t have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={handleLoginRedirect}
            className="font-bold text-black hover:underline"
          >
            {isLoginPage ? "Sign Up" : "Log In"}
          </button>
        </Paragraph1>
      </div>
    </div>
  );
};

export default SocialSignInOptions;
