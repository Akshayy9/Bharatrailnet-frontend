import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import Chart from 'chart.js/auto';

// Auto-detect API URL based on environment
const API_BASE_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8000'
  : 'https://backend-v3iv.onrender.com';

const WS_BASE_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'ws://localhost:8000'
  : 'wss://backend-v3iv.onrender.com';

// 🔥 COMPLETE DUMMY DATA - FULLY FUNCTIONAL OFFLINE DEMO
const DUMMY_DATA = {
  kpis: {
    punctuality: 98.2,
    average_delay: 3.7,
    section_throughput: 22,
    track_utilization: 78
  },
  liveTrains: [
    { id: "12878", name: "NDLS GZB SPL", status: "On Time", current_km: 12.5, delay_minutes: 0 },
    { id: "04567", name: "GZB-ALJN SPL", status: "Delayed", current_km: 25.3, delay_minutes: 8 },
    { id: "22439", name: "DELHI RAJ SPL", status: "Conflict", current_km: 18.7, delay_minutes: 0 },
    { id: "12055", name: "NEW DELHI JN SPL", status: "On Time", current_km: 8.2, delay_minutes: 0 },
    { id: "14042", name: "MUSSORIE EXP", status: "Delayed", current_km: 32.1, delay_minutes: 12 },
    { id: "14316", name: "JP DLI EXP", status: "On Time", current_km: 41.8, delay_minutes: 0 }
  ],
  stations: [
    { name: "Ghaziabad Jn", code: "GZB", kilometer_marker: 0 },
    { name: "Mundka", code: "MUDKA", kilometer_marker: 10 },
    { name: "Sahibabad", code: "SBD", kilometer_marker: 15 },
    { name: "Mohan Nagar", code: "MNG", kilometer_marker: 20 },
    { name: "Dankaur", code: "DKDE", kilometer_marker: 30 },
    { name: "Aligarh Jn", code: "ALJN", kilometer_marker: 45 }
  ],
  tracks: [
    { name: "GZB-ALJN Main Line", start_km: 0, end_km: 45 }
  ],
  auditLogs: [
    { timestamp: "2026-01-09T15:30:00Z", controller_name: "SK001", action: "Accepted", details: "Halted 04567 at SKQ per AI reco", recommendation_matched: true },
    { timestamp: "2026-01-09T14:45:00Z", controller_name: "SK001", action: "Rejected", details: "Overrode AI - manual priority given to 22439", recommendation_matched: false },
    { timestamp: "2026-01-09T14:20:00Z", controller_name: "SK001", action: "Accepted", details: "Rerouted 12878 via alternate track", recommendation_matched: true }
  ]
};

// --- Reusable Chart Component ---
const ReportChart = ({ chartConfig, theme }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        ...chartConfig,
        options: {
          ...chartConfig.options,
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { 
              beginAtZero: true, 
              grid: { color: theme === 'dark' ? '#374151' : '#e5e7eb' },
              ticks: { color: theme === 'dark' ? '#9ca3af' : '#6b7280' }
            },
            x: { 
              grid: { color: theme === 'dark' ? '#374151' : '#e5e7eb' },
              ticks: { color: theme === 'dark' ? '#9ca3af' : '#6b7280' }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: theme === 'dark' ? '#d1d5db' : '#374151'
              }
            }
          }
        }
      });
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartConfig, theme]);

  return <canvas ref={chartRef}></canvas>;
};

// --- LiveSectionMap Component ---
const LiveSectionMap = ({ tracks, stations, liveTrains }) => {
  const scaleKmToX = (km, viewWidth) => {
    if (!tracks.length || tracks[0].end_km === undefined || tracks[0].start_km === undefined) return 0;
    const totalKm = tracks[0].end_km - tracks[0].start_km;
    if (totalKm <= 0) return viewWidth * 0.05;
    return (viewWidth * 0.05) + (((km - tracks[0].start_km) / totalKm) * (viewWidth * 0.9));
  };
  
  const getTrainColor = (status) => {
    switch (status) {
      case 'On Time': return 'fill-green-500';
      case 'Delayed': return 'fill-yellow-500';
      case 'Conflict': return 'fill-red-500';
      default: return 'fill-gray-500';
    }
  };

  if (!tracks.length) return <div className="text-center p-8 text-gray-600 dark:text-gray-400">Loading map data...</div>;
  const SVG_WIDTH = 1200;
  const SVG_HEIGHT = 150;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md h-full flex flex-col p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 px-2">Live Section View: {tracks[0]?.name || 'Loading...'}</h3>
      <div className="flex-grow bg-gray-100 dark:bg-gray-700 rounded-lg relative overflow-hidden">
        <svg width="100%" height="100%" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
          <line x1={scaleKmToX(tracks[0].start_km, SVG_WIDTH)} y1={SVG_HEIGHT / 2} x2={scaleKmToX(tracks[0].end_km, SVG_WIDTH)} y2={SVG_HEIGHT / 2} strokeWidth="4" className="stroke-gray-400 dark:stroke-gray-500"/>
          {stations.map(station => (
            <g key={station.code} transform={`translate(${scaleKmToX(station.kilometer_marker, SVG_WIDTH)}, ${SVG_HEIGHT / 2})`}>
              <circle r="8" className="fill-gray-600 dark:fill-gray-400" />
              <text y="-15" textAnchor="middle" className="text-sm font-bold fill-gray-800 dark:fill-white">{station.code}</text>
            </g>
          ))}
          {liveTrains.map(train => (
            <g key={train.id} style={{ transition: 'transform 4s linear' }} transform={`translate(${scaleKmToX(train.current_km, SVG_WIDTH)}, ${SVG_HEIGHT / 2})`}>
              <title>{`${train.id} - ${train.name}\nStatus: ${train.status}\nKM: ${train.current_km.toFixed(2)}`}</title>
              <path d="M-15 -10 L15 -10 L20 0 L15 10 L-15 10 Z" className={getTrainColor(train.status)} />
              <text y="-15" textAnchor="middle" className="text-xs font-semibold fill-gray-800 dark:fill-white">{train.id}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---
const Dashboard = ({ onLogout }) => {
  const { user, authToken } = useAuth();
  const { theme, setTheme } = useTheme();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeView, setActiveView] = useState('dashboard');
  const [showAIModal, setShowAIModal] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connected'); // Always connected with dummy data
  
  // 🔥 USE DUMMY DATA BY DEFAULT - FULLY FUNCTIONAL OFFLINE
  const [kpis, setKpis] = useState(DUMMY_DATA.kpis);
  const [liveTrains, setLiveTrains] = useState(DUMMY_DATA.liveTrains);
  const [auditLogs, setAuditLogs] = useState(DUMMY_DATA.auditLogs);
  const [stations, setStations] = useState(DUMMY_DATA.stations);
  const [tracks, setTracks] = useState(DUMMY_DATA.tracks);
  
  const sectionId = user?.section || 'GZB';

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔥 SIMULATE LIVE TRAIN MOVEMENT - EVERY 3 SECONDS
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTrains(prevTrains => 
        prevTrains.map(train => ({
          ...train,
          current_km: Math.min(
            train.current_km + (Math.random() * 0.8 + 0.2), // Move 0.2-1.0 km
            tracks[0]?.end_km || 45
          )
        })).map((train, index) => index === 2 ? {...train, status: 'Conflict'} : train) // Keep train 22439 in conflict
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [tracks]);

  // Chart configurations with realistic data
  const punctualityChartConfig = {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Punctuality %',
        data: [98.1, 98.5, 97.2, 98.8, 99.1, 96.5, 97.9],
        backgroundColor: '#3b82f6'
      }]
    },
    options: { animation: false }
  };

  const delayReasonsChartConfig = {
    type: 'pie',
    data: {
      labels: ['Signal Failure', 'Track Maintenance', 'Rolling Stock', 'Congestion', 'Other'],
      datasets: [{
        data: [15, 25, 20, 30, 10],
        backgroundColor: ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#6b7280']
      }]
    },
    options: { animation: false }
  };

  const throughputChartConfig = {
    type: 'line',
    data: {
      labels: Array.from({ length: 12 }, (_, i) => `${(new Date().getHours() - 11 + i + 24) % 24}:00`),
      datasets: [{
        label: 'Trains/Hour',
        data: [15, 18, 22, 19, 21, 25, 23, 18, 20, 22, 24, 21],
        fill: true,
        borderColor: '#3b82f6',
        tension: 0.4,
        backgroundColor: 'rgba(59, 130, 246, 0.1)'
      }]
    },
    options: { animation: false }
  };

  const handleNavigation = (viewId) => setActiveView(viewId);
  
  const handleSimulation = (e) => {
    e.preventDefault();
    setIsSimulating(true);
    setSimulationResults(null);
    setTimeout(() => {
      setSimulationResults({
        manual_avg_delay: '18.5 min', 
        ai_avg_delay: '6.2 min',
        optimized_schedule: [
          'Reroute <b>12878 NDLS GZB SPL</b> via Dankaur (DKDE).',
          'Hold <b>04567 GZB-ALJN SPL</b> at Chola for 15 minutes.',
          'Give precedence to <b>22439 DELHI RAJ SPL</b> on Line 2.'
        ]
      });
      setIsSimulating(false);
    }, 2000);
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: 'fas fa-sun' },
    { value: 'dark', label: 'Dark', icon: 'fas fa-moon' },
    { value: 'system', label: 'System', icon: 'fas fa-desktop' }
  ];
  const getThemeIcon = () => (themeOptions.find(opt => opt.value === theme)?.icon || 'fas fa-sun');

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="sidebar w-64 text-white flex-shrink-0 flex flex-col bg-gradient-to-b from-blue-900 to-blue-800">
        <div className="p-6 flex items-center justify-center space-x-3 border-b border-blue-800">
          <img src="/logo/indian-railways-seeklogo.png" alt="BharatRailNet Logo" className="h-12 w-12 rounded-full" />
          <div>
            <h1 className="text-xl font-bold whitespace-nowrap">BharatRailNet</h1>
            <p className="text-xs text-blue-200">Railway Control System</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {['dashboard', 'live-map', 'simulation', 'reports', 'audit'].map(view => {
            const icons = {dashboard: 'fa-tachometer-alt', 'live-map': 'fa-map-marked-alt', simulation: 'fa-cogs', reports: 'fa-chart-line', audit: 'fa-history'};
            const labels = {dashboard: 'Dashboard', 'live-map': 'Live Section Map', simulation: 'Scenario Analysis', reports: 'Reports & Analytics', audit: 'Audit Trail'};
            return (
              <a key={view} href={`#${view}`} onClick={(e) => { e.preventDefault(); handleNavigation(view); }}
                className={`nav-link flex items-center px-4 py-2.5 text-sm rounded-lg transition-colors duration-200 hover:bg-blue-700 ${activeView === view ? 'bg-blue-700 shadow-lg' : ''}`}>
                <i className={`fas ${icons[view]} mr-3 w-5 text-center`}></i> {labels[view]}
              </a>
            )
          })}
        </nav>
        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center">
            <img className="h-10 w-10 rounded-full object-cover" src="https://placehold.co/100x100/1e3a8a/ffffff?text=SC" alt="User Avatar" />
            <div className="ml-3">
              <p className="text-sm font-semibold">{user?.name || 'S. K. Sharma'}</p>
              <p className="text-xs text-blue-300">Section Controller ({user?.section || 'GZB'})</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full mt-4 flex items-center justify-center py-2 px-4 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200">
            <i className="fas fa-sign-out-alt mr-2"></i> Logout
          </button>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Section Control Dashboard - <span className="text-blue-600 dark:text-blue-400">{user?.sectionName || 'Ghaziabad (GZB)'}</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">DEMO MODE - Live Simulation</span>
            </div>
            {/* Theme toggle remains the same */}
            <div className="relative">
              <button onClick={() => setShowThemeDropdown(!showThemeDropdown)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Change Theme">
                <i className={`${getThemeIcon()} text-gray-600 dark:text-gray-300`}></i>
              </button>
              {showThemeDropdown && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                  {themeOptions.map((option) => (
                    <button key={option.value} onClick={() => { setTheme(option.value); setShowThemeDropdown(false); }}
                      className={`flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 ${theme === option.value ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                      <i className={`${option.icon} mr-2 w-4`}></i> {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeView === 'dashboard' && (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="kpi-card bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md flex items-center space-x-4 hover:shadow-lg transition-shadow">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full"><i className="fas fa-check-circle text-2xl text-green-600 dark:text-green-400"></i></div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Punctuality</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{kpis.punctuality}%</p>
                  </div>
                </div>
                <div className="kpi-card bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md flex items-center space-x-4 hover:shadow-lg transition-shadow">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full"><i className="fas fa-clock text-2xl text-yellow-600 dark:text-yellow-400"></i></div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Average Delay</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{kpis.average_delay.toFixed(1)} min</p>
                  </div>
                </div>
                <div className="kpi-card bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md flex items-center space-x-4 hover:shadow-lg transition-shadow">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full"><i className="fas fa-exchange-alt text-2xl text-blue-600 dark:text-blue-400"></i></div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Section Throughput</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{kpis.section_throughput} t/hr</p>
                  </div>
                </div>
                <div className="kpi-card bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md flex items-center space-x-4 hover:shadow-lg transition-shadow">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full"><i className="fas fa-road text-2xl text-purple-600 dark:text-purple-400"></i></div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Track Utilization</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{kpis.track_utilization}%</p>
                  </div>
                </div>
              </div>
              
              {/* Live Trains Table */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Live Train Status & AI Recommendations</h3>
                <div className="overflow-y-auto h-96">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700 sticky top-0">
                      <tr>
                        <th scope="col" className="px-4 py-3">Train No.</th>
                        <th scope="col" className="px-4 py-3">Name</th>
                        <th scope="col" className="px-4 py-3">Status</th>
                        <th scope="col" className="px-4 py-3">Current Location (KM)</th>
                        <th scope="col" className="px-4 py-3">Delay</th>
                        <th scope="col" className="px-4 py-3">AI Reco.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveTrains.map(train => (
                        <tr key={train.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{train.id}</td>
                          <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{train.name}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              train.status === 'Conflict' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                              train.status === 'Delayed' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {train.status} {train.delay_minutes > 0 && `${train.delay_minutes}m`}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-sm">{train.current_km.toFixed(2)} km</td>
                          <td className="px-4 py-3">{train.delay_minutes > 0 ? `${train.delay_minutes}m` : '0m'}</td>
                          <td className="px-4 py-3">
                            {train.status === 'Conflict' ? 
                              <button onClick={() => setShowAIModal(true)} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">View AI Action</button> : '-'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Throughput Chart */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md h-96">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Hourly Throughput - Last 24h (GZB Section)</h3>
                <ReportChart chartConfig={throughputChartConfig} theme={theme} />
              </div>
            </div>
          )}

          {/* Other views remain the same but now fully functional with dummy data */}
          {activeView === 'live-map' && <LiveSectionMap tracks={tracks} stations={stations} liveTrains={liveTrains} />}
          
          {/* Simulation, Reports, Audit views use the dummy data above */}
          {activeView === 'simulation' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Simulation form and results - fully functional */}
              <div className="md:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">What-If Scenario Builder</h3>
                <form onSubmit={handleSimulation} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Scenario Type</label>
                    <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-50 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>Track Maintenance Block</option>
                      <option>Signal Failure</option>
                      <option>Unscheduled VIP Movement</option>
                      <option>Rolling Stock Delay</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <i className="fas fa-play mr-2"></i> Run Simulation
                  </button>
                </form>
              </div>
              {(isSimulating || simulationResults) && (
                <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                  {isSimulating ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="loader border-4 border-gray-200 dark:border-gray-600 border-t-blue-500 rounded-full w-12 h-12 animate-spin"></div>
                      <p className="mt-4 text-gray-600 dark:text-gray-400">Running simulation with 12878, 04567, 22439...</p>
                    </div>
                  ) : (
                    simulationResults && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">AI Optimization Results</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manual Handling</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{simulationResults.manual_avg_delay}</p>
                          </div>
                          <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">AI Optimized</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{simulationResults.ai_avg_delay}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {simulationResults.optimized_schedule.map((item, index) => (
                            <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-r-lg" 
                                 dangerouslySetInnerHTML={{ __html: item }} />
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {activeView === 'reports' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md h-96">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Weekly Punctuality - GZB Section</h3>
                  <ReportChart chartConfig={punctualityChartConfig} theme={theme} />
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md h-96">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Delay Reasons (Last 7 Days)</h3>
                  <ReportChart chartConfig={delayReasonsChartConfig} theme={theme} />
                </div>
              </div>
            </div>
          )}

          {activeView === 'audit' && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Controller Action Audit Trail (Last 50)</h3>
              <div className="overflow-y-auto h-[70vh]">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700 sticky top-0">
                    <tr>
                      <th scope="col" className="px-4 py-3">Timestamp</th>
                      <th scope="col" className="px-4 py-3">Controller</th>
                      <th scope="col" className="px-4 py-3">Action</th>
                      <th scope="col" className="px-4 py-3">Details</th>
                      <th scope="col" className="px-4 py-3">System Reco.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, index) => (
                      <tr key={index} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-3 font-medium">{log.controller_name}</td>
                        <td className={`px-4 py-3 font-semibold ${
                          log.action === 'Accepted' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                        }`}>{log.action}</td>
                        <td className="px-4 py-3">{log.details}</td>
                        <td className="px-4 py-3">
                          {log.recommendation_matched ? 
                            <span className="flex items-center text-green-500 font-medium"><i className="fas fa-check-circle mr-2"></i>Matched</span> : 
                            <span className="flex items-center text-orange-500 font-medium"><i className="fas fa-exclamation-triangle mr-2"></i>Mismatched</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* AI Modal */}
        {showAIModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-600">
                {/* Header */}
                <div className="px-8 pt-8 pb-6 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">AI-Powered Conflict Resolution</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Automated decision support system</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowAIModal(false)} 
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  {/* Conflict Alert */}
                  <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-xl mb-8 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center border-2 border-red-200 dark:border-red-700 mt-0.5">
                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2 leading-tight">
                          Track Conflict Detected
                        </h4>
                        <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">
                          <span className="font-mono font-semibold text-red-900 dark:text-red-50 px-1.5 py-0.5 bg-red-200 dark:bg-red-800/50 rounded">
                            12878 NDLS GZB SPL
                          </span>{' '}
                          (KM 18.7, Priority 1) vs{' '}
                          <span className="font-mono font-semibold text-red-900 dark:text-red-50 px-1.5 py-0.5 bg-red-200 dark:bg-red-800/50 rounded">
                            22439 DELHI RAJ SPL
                          </span>{' '}
                          (KM 18.7). Projected 18-minute delay to high-priority train without intervention.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Primary Recommendation */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Primary Recommendation
                      </h5>
                      <div className="p-6 border-2 border-green-200 dark:border-green-600 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-xl shadow-sm">
                        <div className="font-mono text-2xl font-bold text-green-900 dark:text-green-100 mb-3 leading-tight">
                          Hold 22439 DELHI RAJ SPL
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm font-medium text-green-800 dark:text-green-200">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            Location: Sahibabad Junction (SBD, KM 15.0)
                          </div>
                          <div className="flex items-center text-sm font-medium text-green-800 dark:text-green-200">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Duration: 9 minutes (09:52 - 10:01 IST)
                          </div>
                          <div className="flex items-start pt-2 text-sm text-green-700 dark:text-green-300">
                            <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>Priority hierarchy maintained: 12878 (P1)  22439 (P2)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Projected Impact */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4 flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        Projected Network Impact
                      </h5>
                      <div className="space-y-4">
                        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              12878 NDLS GZB SPL
                            </span>
                            <span className="font-semibold text-lg text-green-600 dark:text-green-400">On Schedule</span>
                          </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                              <svg className="w-4 h-4 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              22439 DELHI RAJ SPL
                            </span>
                            <span className="font-semibold text-lg text-yellow-600 dark:text-yellow-400">+9 min</span>
                          </div>
                        </div>
                        <div className="p-5 pt-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center">
                              <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              GZB Section Punctuality
                            </span>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">98.4%</span>
                          </div>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Maintained above threshold</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-8 pb-8 pt-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-600 rounded-b-xl">
                  <div className="flex justify-end space-x-3">
                    <button 
                      onClick={() => setShowAIModal(false)} 
                      className="px-6 py-2.5 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Manual Override
                    </button>
                    <button 
                      onClick={() => setShowAIModal(false)} 
                      className="px-8 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg text-sm font-bold flex items-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Accept & Execute
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

      </main>
    </div>
  );
};

export default Dashboard;
