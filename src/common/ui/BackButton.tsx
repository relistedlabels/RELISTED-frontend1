"use client";

import { useRouter } from "next/navigation"; // For Next.js 13+
import { HiOutlineChevronLeft } from "react-icons/hi2";

const BackButton: React.FC = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back(); // Takes user to the previous URL
  };

  return (
    <button onClick={handleBack} className="text-gray-900 cursor-pointer hover:text-gray-700">
      <HiOutlineChevronLeft className="w-6 h-6" />
    </button>
  );
};

export default BackButton;
