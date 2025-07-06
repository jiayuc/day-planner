import React from 'react';
import { devUtils, isDevelopment } from '../config/dev';

/**
 * Development tools component - only shows in development mode
 * Provides easy access to debugging and testing utilities
 */
export const DevTools: React.FC = () => {
  if (!isDevelopment) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <h3 className="text-sm font-semibold mb-3 text-yellow-400">🛠 Dev Tools</h3>
      
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={devUtils.clearAllStorage}
            className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded transition-colors"
            title="Clear all localStorage data and reload"
          >
            Clear All
          </button>
          
          <button
            onClick={devUtils.clearTimerStorage}
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-2 py-1 rounded transition-colors"
            title="Clear timer localStorage data and reload"
          >
            Clear Timer
          </button>
          
          <button
            onClick={devUtils.clearTaskStorage}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded transition-colors"
            title="Clear task localStorage data and reload"
          >
            Clear Tasks
          </button>
          
          <button
            onClick={devUtils.logStorage}
            className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded transition-colors"
            title="Log all localStorage data to console"
          >
            Log Storage
          </button>
        </div>
        
        <div className="pt-2 border-t border-gray-600">
          <p className="text-xs text-gray-300 mb-2">Quick Timer Tests:</p>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => devUtils.setTestTimer(3)}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded transition-colors"
              title="Set timer to 3 seconds"
            >
              3s
            </button>
            <button
              onClick={() => devUtils.setTestTimer(10)}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded transition-colors"
              title="Set timer to 10 seconds"
            >
              10s
            </button>
            <button
              onClick={() => devUtils.setTestTimer(30)}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded transition-colors"
              title="Set timer to 30 seconds"
            >
              30s
            </button>
          </div>
        </div>
        
        <div className="pt-2 border-t border-gray-600">
          <p className="text-xs text-gray-300 mb-2">Test Cumulative Time:</p>
          <div className="grid grid-cols-1 gap-1">
            <button
              onClick={() => devUtils.addTestSessions('task', 3)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2 py-1 rounded transition-colors"
              title="Add 3 test sessions to first task (for testing cumulative time)"
            >
              Add Test Sessions
            </button>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-gray-400 mt-3">
        Also available: <code className="bg-gray-700 px-1 rounded">window.devUtils</code>
      </p>
    </div>
  );
};
