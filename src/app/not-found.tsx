"use client";

import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gray-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-gray-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gray-800 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      {/* Glass container */}
      <div className="relative z-10 px-6 py-12 sm:px-8 sm:py-16 backdrop-blur-md bg-white/5 border border-white/15 rounded-3xl shadow-2xl max-w-md sm:max-w-lg text-center">
        {/* 404 Text */}
        <div className="mb-8">
          <h1 className="text-8xl sm:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-white mb-4 select-none">
            404
          </h1>
          <div className="h-1 w-24 mx-auto bg-gradient-to-r from-white to-gray-400 rounded-full"></div>
        </div>

        {/* Description */}
        <div className="mb-10">
          <Paragraph2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Page Not Found
          </Paragraph2>
          <Paragraph1 className="text-sm sm:text-base text-gray-300 leading-relaxed">
            Oops! The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </Paragraph1>
        </div>

        {/* Return to home button */}
        <Link href="/">
          <button className="group relative w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl overflow-hidden border border-white/20">
            <span className="relative z-10 flex items-center justify-center gap-2">
              Return to Home
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </button>
        </Link>

        {/* Additional info */}
        <p className="mt-8 text-xs sm:text-sm text-gray-400">
          If this is a mistake, please{" "}
          <a
            href="mailto:support@relisted.com"
            className="text-gray-200 hover:text-white underline"
          >
            contact support
          </a>
        </p>
      </div>

      {/* Add required styles */}
      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
          }
          25% {
            animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
          }
          50% {
            animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
            transform: translate(30px, -50px) scale(1.1);
          }
          75% {
            animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
