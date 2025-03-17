import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      <p className="mt-4 text-gray-700">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;