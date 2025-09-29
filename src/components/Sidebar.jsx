import React from 'react'

const Sidebar = ({ user, activeView, onViewChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'live-map', label: 'Live Section Map', icon: 'fas fa-map-marked-alt' },
    { id: 'simulation', label: 'Scenario Analysis', icon: 'fas fa-cogs' },
    { id: 'reports', label: 'Reports & Analytics', icon: 'fas fa-chart-line' },
    { id: 'audit', label: 'Audit Trail', icon: 'fas fa-history' }
  ]

  return (
    <aside className="sidebar w-64 text-white flex-shrink-0 flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center justify-center space-x-3 border-b border-blue-800 dark:border-slate-700">
        <img 
          src="https://placehold.co/48x48/1e3a8a/ffffff?text=IR" 
          alt="Indian Railways Logo" 
          className="h-12 w-12 rounded-full" 
        />
        <div>
          <h1 className="text-xl font-bold whitespace-nowrap">BharatRailNet</h1>
          <p className="text-xs text-blue-200 dark:text-slate-300">Indian Railways</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex items-center w-full px-4 py-3 text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-slate-700 transition-colors duration-200 text-left ${
              activeView === item.id ? 'bg-blue-700 dark:bg-slate-700' : ''
            }`}
          >
            <i className={`${item.icon} mr-3 w-5 text-center`}></i>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-blue-800 dark:border-slate-700">
        <div className="flex items-center mb-4">
          <img 
            className="h-10 w-10 rounded-full" 
            src="https://placehold.co/40x40/1e3a8a/ffffff?text=SC" 
            alt="User Avatar" 
          />
          <div className="ml-3">
            <p className="text-sm font-semibold">{user?.name || 'Controller'}</p>
            <p className="text-xs text-blue-300 dark:text-slate-300">
              Section {user?.section || 'GZB'}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center py-2 px-4 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
        >
          <i className="fas fa-sign-out-alt mr-2"></i>
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
