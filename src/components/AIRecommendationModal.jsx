import React from 'react'

const AIRecommendationModal = ({ onClose, onAccept }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300">
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-t-xl">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            <i className="fas fa-brain text-blue-600 dark:text-blue-400 mr-3"></i>
            AI-Powered Recommendation
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Conflict Alert */}
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-lg mb-6">
            <h4 className="font-bold text-red-800 dark:text-red-400">
              Conflict Detected: Train 12451 vs Train 09876
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              Imminent crossing conflict at Dadri (DER). Without intervention, high-priority Train 12451 
              will be delayed by an estimated 15 minutes.
            </p>
          </div>

          {/* Recommendation Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recommended Action */}
            <div>
              <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Recommended Action
              </h5>
              <div className="p-4 border-2 border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <p className="font-bold text-green-800 dark:text-green-400">
                  Halt Train 09876 (Goods) at Aligarh Jn. for 7 minutes.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  This is the optimal solution to maintain overall network punctuality.
                </p>
              </div>
            </div>

            {/* Projected Impact */}
            <div>
              <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Projected Impact
              </h5>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <i className="fas fa-check text-green-500 mr-2"></i>
                  <b>Train 12451:</b> Remains on schedule.
                </li>
                <li className="flex items-center">
                  <i className="fas fa-minus text-yellow-500 mr-2"></i>
                  <b>Train 09876:</b> Incurs a 7-minute delay (within buffer).
                </li>
                <li className="flex items-center">
                  <i className="fas fa-thumbs-up text-blue-500 mr-2"></i>
                  <b>Overall Punctuality:</b> Maintained at 98%.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-b-xl flex justify-end space-x-4">
          <button 
            onClick={onClose}
            className="py-2 px-6 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500"
          >
            Override (Manual)
          </button>
          <button 
            onClick={onAccept}
            className="py-2 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold flex items-center"
          >
            <i className="fas fa-check mr-2"></i>
            Accept & Execute
          </button>
        </div>
      </div>
    </div>
  )
}

export default AIRecommendationModal
