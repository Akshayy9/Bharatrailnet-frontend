import React, { useEffect, useRef } from 'react'

const DashboardView = ({ data = {}, onShowAIModal }) => {
  const kpis = data.kpis || {
    punctuality: 98.2,
    averageDelay: 3.5,
    sectionThroughput: 18,
    trackUtilization: 85
  }

  const trains = data.trains || [
    {
      id: '12004',
      name: 'Shatabdi Exp',
      status: 'On Time',
      location: 'Approaching GZB',
      recommendation: '-'
    },
    {
      id: '12451',
      name: 'Shram Shakti',
      status: 'Conflict',
      location: 'Aligarh Jn.',
      recommendation: 'View'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'On Time': return 'green'
      case 'Delayed': return 'yellow'
      case 'Conflict': return 'red'
      default: return 'gray'
    }
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="kpi-card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <i className="fas fa-check-circle text-2xl text-green-600 dark:text-green-400"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Punctuality</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{kpis.punctuality}%</p>
            </div>
          </div>
        </div>

        <div className="kpi-card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <i className="fas fa-clock text-2xl text-yellow-600 dark:text-yellow-400"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Delay</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{kpis.averageDelay} min</p>
            </div>
          </div>
        </div>

        <div className="kpi-card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <i className="fas fa-exchange-alt text-2xl text-blue-600 dark:text-blue-400"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Throughput</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{kpis.sectionThroughput}/hr</p>
            </div>
          </div>
        </div>

        <div className="kpi-card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <i className="fas fa-road text-2xl text-purple-600 dark:text-purple-400"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Track Utilization</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{kpis.trackUtilization}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Train Status Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Live Train Status & AI Recommendations
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3">Train No.</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">AI Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {trains.map((train, index) => (
                <tr key={train.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {train.id} - {train.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full 
                      ${train.status === 'On Time' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        train.status === 'Delayed' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        train.status === 'Conflict' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                      {train.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{train.location}</td>
                  <td className="px-4 py-3">
                    {train.recommendation === 'View' ? (
                      <button 
                        onClick={onShowAIModal}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View
                      </button>
                    ) : (
                      train.recommendation
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DashboardView
