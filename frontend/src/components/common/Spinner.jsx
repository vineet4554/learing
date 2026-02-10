import React from 'react'

const Spinner = ({ text = "Loading...", fullScreen = false }) => {
   return (
      <div className={`flex items-center justify-center ${fullScreen ? 'min-h-screen' : ''}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{text}</p>
        </div>
      </div>
    );
}

export default Spinner