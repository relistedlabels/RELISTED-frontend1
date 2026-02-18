import React from "react";

export const AuthCheckSkeleton = () => (
  <div className="space-y-2 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

export const LoginModalSkeleton = () => (
  <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full animate-pulse">
    {/* Header */}
    <div className="mb-6">
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
    </div>

    {/* Form Fields */}
    <div className="space-y-4">
      {/* Email Field */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>

      {/* Password Field */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>

      {/* Forgot Password Link */}
      <div className="text-right">
        <div className="h-4 bg-gray-200 rounded w-1/3 ml-auto"></div>
      </div>

      {/* Submit Button */}
      <div className="h-10 bg-gray-300 rounded"></div>

      {/* Divider */}
      <div className="h-4 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export const RentalCheckSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-2/3"></div>
    <div className="h-4 bg-gray-200 rounded"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  </div>
);
