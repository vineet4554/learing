import React from 'react'

const Spinner = ({ text = "Loading...", fullScreen = false }) => {
   return (
      <div className={`flex items-center justify-center ${fullScreen ? 'min-h-dvh px-4' : ''}`}>
        <div className="text-center">
          <div className="mx-auto mb-3 h-11 w-11 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-600">{text}</p>
        </div>
      </div>
    );
}

export default Spinner
