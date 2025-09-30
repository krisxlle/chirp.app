import React from 'react';

// Completely isolated Profile component with no external dependencies
const SimpleProfile = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Page</h1>
        <p className="text-gray-600">Profile page is working!</p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">This is a simple profile component to avoid circular dependencies.</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleProfile;
