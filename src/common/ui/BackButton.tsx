"use client";

import { useRouter } from "next/navigation"; // For Next.js 13+
import { HiOutlineChevronLeft } from "react-icons/hi2";

interface BackButtonProps {
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ className }) => {
  const router = useRouter();

  const handleBack = () => {
    router.back(); // Takes user to the previous URL
  };

  const defaultClasses = "text-gray-900 cursor-pointer hover:text-gray-700";
  const combinedClasses = className
    ? `${defaultClasses} ${className}`
    : defaultClasses;

  return (
    <button onClick={handleBack} className={combinedClasses}>
      <HiOutlineChevronLeft className="w-6 h-6" />
    </button>
  );
};

export default BackButton;
