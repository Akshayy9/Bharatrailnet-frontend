import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import Chart from 'chart.js/auto';

// Smart API URL detection - works both locally and in production
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If running on localhost, use local backend
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    // If deployed on Netlify, use production backend
    return 'https://backend-v3iv.onrender.com';
  }
  return 'https://backend-v3iv.onrender.com';
};

const getWsUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If running on localhost, use local WebSocket
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'ws://localhost:8000';
    }
    // If deployed, use secure WebSocket
    return 'wss://backend-v3iv.onrender.com';
  }
  return 'wss://backend-v3iv.onrender.com';
};

const API_BASE_URL = getApiUrl();
const WS_BASE_URL = getWsUrl();

console.log('🔧 Environment:', window.location.hostname);
console.log('🔧 API URL:', API_BASE_URL);
console.log('🔧 WebSocket URL:', WS_BASE_URL);

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
              labels: { color: theme === 'dark' ? '#d1d5db' : '#374151' }
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
const LiveSectionMap = ({ trains, stations, tracks, theme }) => {
  return (
    <div className="w-full h-96 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto relative">
      <svg viewBox="0 0 1000 400" className="w-full h-full">
        {/* Track segments */}
        {tracks.map((track, idx) => (
          <line
            key={idx}
            x1={track.start_km * 10}
            y1={200}
            x2={track.end_km * 10}
            y2={200}
            stroke={theme === 'dark' ? '#4b5563' : '#9ca3af'}
            strokeWidth="4"
          />
        ))}
        
        {/* Stations */}
        {stations.map((station, idx) => (
          <g key={idx}>
            <circle
              cx={station.kilometer_marker * 10}
              cy={200}
              r="8"
              fill={theme === 'dark' ? '#3b82f6' : '#2563eb'}
            />
            <text
              x={station.kilometer_marker * 10}
              y={185}
              textAnchor="middle"
              fill={theme === 'dark' ? '#d1d5db' : '#374151'}
              fontSize="12"
            >
              {station.code}
            </text>
          </g>
        ))}
        
        {/* Trains */}
        {trains.map((train, idx) => (
          <g key={idx}>
            <rect
              x={train.location_km * 10 - 10}
              y={190}
              width="20"
              height="20"
              fill={train.status === 'Delayed' ? '#ef4444' : '#10b981'}
              rx="3"
            />
            <text
              x={train.location_km * 10}
              y={235}
              textAnchor="middle"
              fill={theme === 'dark' ? '#d1d5db' : '#374151'}
              fontSize="10"
            >
              {train.id}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// --- Main Dashboard Component ---
const Dashboard = () => {
  const { user, authToken, logout } = useAuth();
  const { theme } = useTheme();
  
  const [kpis, setKpis] = useState(null);
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedScenario, setSelectedScenario] = useState('');
  const [simulationResults, setSimulationResults] = useState(null);
  const [runningSimulation, setRunningSimulation] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${authToken}`
        };

        console.log('🚀 Fetching dashboard data from:', API_BASE_URL);

        const [kpisRes, trainsRes, mapRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/dashboard/kpis`, { headers }),
          fetch(`${API_BASE_URL}/api/dashboard/trains`, { headers }),
          fetch(`${API_BASE_URL}/api/section_map/${user.section}`, { headers })
        ]);

        if (kpisRes.ok) {
          const kpisData = await kpisRes.json();
          setKpis(kpisData);
          console.log('✅ KPIs loaded:', kpisData);
        }

        if (trainsRes.ok) {
          const trainsData = await trainsRes.json();
          setTrains(trainsData);
          console.log('✅ Trains loaded:', trainsData.length);
        }

        if (mapRes.ok) {
          const mapData = await mapRes.json();
          setStations(mapData.stations || []);
          setTracks(mapData.tracks || []);
          console.log('✅ Map data loaded');
        }

        setLoading(false);
      } catch (error) {
        console.error('❌ Dashboard fetch error:', error);
        setLoading(false);
      }
    };

    if (user && authToken) {
      fetchData();
    }
  }, [user, authToken]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!user || !authToken) return;

    const wsUrl = `${WS_BASE_URL}/ws/${user.section}?token=${authToken}`;
    console.log('🔌 Connecting to WebSocket:', wsUrl);
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 WebSocket message:', data);
        
        if (data.type === 'train_position_update') {
          setTrains(prevTrains => {
            const updatedTrains = [...prevTrains];
            data.data.forEach(update => {
              const trainIndex = updatedTrains.findIndex(t => t.id === update.id);
              if (trainIndex !== -1) {
                updatedTrains[trainIndex] = {
                  ...updatedTrains[trainIndex],
                  location_km: update.location_km
                };
              }
            });
            return updatedTrains;
          });
        }
      } catch (error) {
        console.error('❌ WebSocket message error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, [user, authToken]);

  // Fetch audit logs
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/audit_trail`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
          const logs = await response.json();
          setAuditLogs(logs);
          console.log('✅ Audit logs loaded:', logs.length);
        }
      } catch (error) {
        console.error('❌ Audit logs fetch error:', error);
      }
    };

    if (authToken) {
      fetchAuditLogs();
    }
  }, [authToken]);

  // Simulation logic
  const runSimulation = () => {
    if (!selectedScenario) return;
    
    setRunningSimulation(true);
    setTimeout(() => {
      setSimulationResults({
        manual_avg_delay: '15.2 min',
        ai_avg_delay: '8.4 min',
        optimized_schedule: [
          'Train 12234 delayed by 3m',
          'Train 18478 priority route assigned',
          'Expected savings: 6.8 min avg delay'
        ]
      });
      setRunningSimulation(false);
    }, 2000);
  };

  // Chart configurations
  const punctualityChartConfig = {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Punctuality %',
        data: [96, 97, 95, 98, 96, 97, 98],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    },
    options: {}
  };

  const delayReasonsChartConfig = {
    type: 'doughnut',
    data: {
      labels: ['Technical', 'Weather', 'Traffic', 'Other'],
      datasets: [{
        data: [35, 20, 30, 15],
        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#6b7280']
      }]
    },
    options: {}
  };

  const throughputChartConfig = {
    type: 'bar',
    data: {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [{
        label: 'Trains/Hour',
        data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 20) + 10),
        backgroundColor: '#10b981'
      }]
    },
    options: {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">BharatRailNet</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Section: {user.sectionName} | Controller: {user.name}
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Punctuality</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">{kpis ? `${kpis.punctuality}%` : '...'}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Delay</h3>
            <p className="text-3xl font-bold mt-2 text-orange-600">
              {kpis ? `${kpis.average_delay.toFixed(1)} min` : '...'}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Section Throughput</h3>
            <p className="text-3xl font-bold mt-2 text-blue-600">
              {kpis ? `${kpis.section_throughput} t/hr` : '...'}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Track Utilization</h3>
            <p className="text-3xl font-bold mt-2 text-purple-600">
              {kpis ? `${kpis.track_utilization}%` : '...'}
            </p>
          </div>
        </div>

        {/* Live Section Map */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4">Live Section Map - {user.sectionName}</h2>
          <LiveSectionMap trains={trains} stations={stations} tracks={tracks} theme={theme} />
        </div>

        {/* Train Status Table */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4">Live Train Status & AI Recommendations</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4">Train No.</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Current Location (KM)</th>
                  <th className="text-left py-3 px-4">AI Reco.</th>
                </tr>
              </thead>
              <tbody>
                {trains.length > 0 ? trains.map(train => (
                  <tr key={train.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4">{train.id}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        train.status === 'On Time' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      }`}>
                        {train.status} {train.delay_minutes > 0 ? `+${train.delay_minutes}m` : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4">{train.location_km?.toFixed(2) || 'N/A'}</td>
                    <td className="py-3 px-4">
                      {train.status === 'Delayed' ? '🔄 Reroute via Track 2' : '✅ Continue'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-500">No trains currently in this section</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-4">Hourly Throughput - Last 24h</h3>
            <div className="h-64">
              <ReportChart chartConfig={throughputChartConfig} theme={theme} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-4">Weekly Punctuality</h3>
            <div className="h-64">
              <ReportChart chartConfig={punctualityChartConfig} theme={theme} />
            </div>
          </div>
        </div>

        {/* Simulation */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4">What-If Scenario Builder</h2>
          <div className="space-y-4">
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option value="">Select scenario...</option>
              <option value="delay">Train 12234 delayed by 15 min</option>
              <option value="maintenance">Track 2 maintenance for 2 hours</option>
              <option value="rush">Rush hour peak load</option>
            </select>
            
            <button
              onClick={runSimulation}
              disabled={!selectedScenario || runningSimulation}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {runningSimulation ? 'Running simulation...' : 'Run Simulation'}
            </button>

            {simulationResults && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-bold mb-2">Simulation Results</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Projected Avg. Delay (Manual)</p>
                    <p className="text-2xl font-bold text-orange-600">{simulationResults.manual_avg_delay}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Projected Avg. Delay (AI Optimized)</p>
                    <p className="text-2xl font-bold text-green-600">{simulationResults.ai_avg_delay}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="font-medium mb-2">Optimized Schedule:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {simulationResults.optimized_schedule.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Audit Trail */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4">Controller Action Audit Trail</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4">Timestamp</th>
                  <th className="text-left py-3 px-4">Controller</th>
                  <th className="text-left py-3 px-4">Action</th>
                  <th className="text-left py-3 px-4">Details</th>
                  <th className="text-left py-3 px-4">System Reco.</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length > 0 ? auditLogs.map((log, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-4">{log.controller_name}</td>
                    <td className="py-3 px-4">{log.action}</td>
                    <td className="py-3 px-4">{log.details}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        log.recommendation_matched ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.recommendation_matched ? '✅ Matched' : '⚠️ Mismatched'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">Loading audit logs...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
