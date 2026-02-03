"use client";

import React, { useState } from "react";
// Assuming Paragraph components are available as in the previous example
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
// Assuming the logo is available at the same path
// import Logo from "/images/logo1.svg";

// Import step components
import StepOnePersonal from "./StepOnePersonal";
import StepTwoContact from "./StepTwoContact"; // Placeholder for the next step

// Titles for each step (keeps structure consistent with business flow)
const stepTitles = [
  "Personal Information",
  // "Emergency Contact",
  // "Emergency Contact",
  // "Bank Account Details",
];

const MAX_STEPS = stepTitles.length;

const CompleteProfileFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);

  // Function to move to the next step
  const handleNextStep = () => {
    if (currentStep < MAX_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Function to move to the previous step (if needed)
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Calculate progress for the progress bar (e.g., 50% for step 1, 100% for step 2)
  const progressPercentage = (currentStep / MAX_STEPS) * 100;

  // Render the appropriate step component
  const renderStepComponent = () => {
    switch (currentStep) {
      case 1:
        // Pass the function to move to the next step
        return <StepOnePersonal onNext={handleNextStep} />;
      // case 2:
      //   // Pass the function to handle final submission (or a back button)
      //   return <StepTwoContact onBack={handlePrevStep} />;
      default:
        return <div>Error: Invalid Step</div>;
    }
  };

  return (
    <div className="font-sans flex flex-col  min-h-screen ">
      <div className="w-full sm:w-[600px]  bg-white p-2 md:p-10 min-h-screen md:min-h-0 md:mt-10 sm:rounded-3xl text-gray-600 shadow-xl">
        {/* Header Section */}
        <div className="mb-8 text-center flex flex-col items-center">
          {/* Logo (as shown in the image) */}
          <img src="/images/logo1.svg" alt="Logo" className="h-10 w-10 mb-4" />

          {/* Main Title */}
          <Paragraph2 className="text-3xl font-bold text-black mb-1">
            Complete Your Profile
          </Paragraph2>

          {/* Subtext */}
          <Paragraph1 className="text-base text-gray-600 max-w-[400px] leading-relaxed">
            We just need a few details to personalize your experience and secure
            your rentals.
          </Paragraph1>
        </div>

        {/* Step Indicator & Progress Bar */}
        <div className="mb-8">
          {/* <Paragraph3 className="text-xl font-bold text-center text-black mb-2">
            {currentStep}/{MAX_STEPS}
          </Paragraph3> */}

          {/* Titles for each step */}
          {/* <Paragraph3 className="text-2xl font-bold text-center text-black mb-4">
            {stepTitles[currentStep - 1]}
          </Paragraph3> */}

          {/* Progress Bar */}
          {/* <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-black h-2.5 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div> */}
        </div>

        {/* Dynamic Step Component */}
        <div className="mt-8">{renderStepComponent()}</div>
      </div>
    </div>
  );
};

export default CompleteProfileFlow;
