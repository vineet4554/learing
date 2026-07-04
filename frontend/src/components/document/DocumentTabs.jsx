import React from "react";

function DocumentTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="mx-4 sm:mx-6 mt-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`py-4 font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-slate-450 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DocumentTabs;
