"use client";

import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-500 border-r-transparent">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;