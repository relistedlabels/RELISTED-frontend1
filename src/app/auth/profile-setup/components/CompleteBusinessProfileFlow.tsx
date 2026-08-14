"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";

// Import your step components
import StepOneBusiness from "./StepOneBusiness";
import StepTwoBusinessDetails from "./StepTwoBusinessDetails";
import StepThreeContact from "./StepThreeContact";
import StepFourPayment from "./StepFourPayment";

const MAX_STEPS = 2;

const CompleteBusinessProfileFlow: React.FC<{
  returnUrl?: string | null;
  isUpgrade?: boolean;
}> = ({ returnUrl, isUpgrade = false }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNextStep = () => {
    if (currentStep < MAX_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progressPercentage = (currentStep / MAX_STEPS) * 100;

  const renderStepComponent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepOneBusiness onNext={handleNextStep} returnUrl={returnUrl} />
        );
      case 2:
        return (
          <StepTwoBusinessDetails
            onNext={handleNextStep}
            onBack={handlePrevStep}
            returnUrl={returnUrl}
          />
        );
      // case 3:
      //   return (
      //     <StepThreeContact onNext={handleNextStep} onBack={handlePrevStep} />
      //   );

      // case 4:
      //   return (
      //     <StepFourPayment
      //       onBack={handlePrevStep}
      //     />
      //   );
      default:
        return <div>Error: Invalid Step</div>;
    }
  };

  // Titles for each step
  const stepTitles = [
    "Personal Information",
    "Business Profile",
    // "Emergency Contact",
    // "Bank Account Details",
  ];

  return (
    <div className="font-sans flex flex-col min-h-screen">
      <div className="w-full sm:w-[600px] bg-white p-4 py-8 md:p-10 min-h-screen md:min-h-0 md:mt-10 sm:rounded-3xl text-gray-600 shadow-xl">
        {/* Header Section */}
        <div className="mb-8 text-center flex flex-col items-center">
          <img src="/images/logo1.svg" alt="Logo" className="h-10 w-10 mb-4" />
          <Paragraph2 className="text-3xl font-bold text-black mb-1">
            {isUpgrade ? "Become a Lister" : "Complete Your Profile"}
          </Paragraph2>
          <Paragraph1 className="text-base text-gray-600 max-w-[400px] leading-relaxed">
            {isUpgrade
              ? "You need a lister account to access this area. Set up your business profile to start listing and earning."
              : "Let's verify your details so you can start listing and earning from your wardrobe."}
          </Paragraph1>
          {isUpgrade && (
            <Link
              href="/shop"
              className="mt-4 text-sm text-gray-500 underline underline-offset-2 hover:text-gray-700"
            >
              Continue shopping instead
            </Link>
          )}
        </div>

        {/* Step Indicator & Progress Bar */}
        <div className="mb-8">
          <Paragraph3 className="text-xl font-bold text-center text-black mb-2">
            {currentStep}/{MAX_STEPS}
          </Paragraph3>
          <Paragraph3 className="text-2xl font-bold text-center text-black mb-4">
            {stepTitles[currentStep - 1]}
          </Paragraph3>

          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-black h-2.5 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Dynamic Step Component */}
        <div className="mt-8">{renderStepComponent()}</div>
      </div>
    </div>
  );
};

export default CompleteBusinessProfileFlow;
