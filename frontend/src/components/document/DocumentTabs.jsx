import React from "react";

function DocumentTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="mx-4 sm:mx-6 mt-3 bg-white border border-gray-200 rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`py-4 font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-emerald-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DocumentTabs;
