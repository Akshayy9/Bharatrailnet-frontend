// SectionMap.jsx - Railway-focused version (Fixed)
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom railway station icon (simplified)
const stationIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" fill="#1e40af" stroke="white" stroke-width="3"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
      <rect x="13" y="13" width="6" height="6" fill="#1e40af"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Custom train icon (simplified)
const trainIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
      <rect x="5" y="10" width="30" height="15" rx="3" fill="#dc2626" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="30" r="3" fill="#374151"/>
      <circle cx="28" cy="30" r="3" fill="#374151"/>
      <rect x="8" y="13" width="6" height="4" fill="white"/>
      <rect x="16" y="13" width="6" height="4" fill="white"/>
      <rect x="24" y="13" width="6" height="4" fill="white"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 30]
});

const SectionMap = ({ sectionId, wsData }) => {
  const [mapData, setMapData] = useState({
    stations: [],
    routes: [],
    live_trains: []
  });
  const [center, setCenter] = useState([28.6675, 77.4199]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSectionMapData();
  }, [sectionId]);

  const fetchSectionMapData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/section_map/${sectionId}/geo`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMapData(data);
        
        // Set map center and zoom to focus on railway section
        if (data.stations.length > 0) {
          const lats = data.stations.map(s => s.latitude);
          const lngs = data.stations.map(s => s.longitude);
          const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
          const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
          setCenter([centerLat, centerLng]);
        }
      } else {
        console.error('Failed to fetch map data:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch section map data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] w-full border rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-300">Loading railway network...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[70vh] w-full border rounded-lg overflow-hidden shadow-lg relative">
      <MapContainer
        center={center}
        zoom={11}
        className="h-full w-full"
        zoomControl={true}
      >
        {/* Base map tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {/* Railway overlay tiles - shows railway infrastructure */}
        <TileLayer
          url="https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openrailwaymap.org/">OpenRailwayMap</a>'
          opacity={0.7}
        />
        
        {/* Custom railway routes from your database */}
        {mapData.routes.map((route, index) => (
          <Polyline
            key={index}
            positions={route.points.map(p => [p.lat, p.lng])}
            color="#dc2626"
            weight={4}
            opacity={0.9}
            dashArray="10, 5"
          />
        ))}
        
        {/* Railway stations */}
        {mapData.stations.map((station, index) => (
          <Marker
            key={index}
            position={[station.latitude, station.longitude]}
            icon={stationIcon}
          >
            <Popup>
              <div className="p-2">
                <div className="font-bold text-lg text-blue-600">{station.name}</div>
                <div className="text-sm text-gray-600">
                  <strong>Station Code:</strong> {station.code}<br/>
                  <strong>Kilometer:</strong> {station.kilometer_marker} KM<br/>
                  <strong>Section:</strong> {sectionId}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Live trains */}
        {mapData.live_trains.map((train, index) => (
          <Marker
            key={index}
            position={[train.latitude, train.longitude]}
            icon={trainIcon}
          >
            <Popup>
              <div className="p-2">
                <div className="font-bold text-lg text-red-600">{train.name}</div>
                <div className="text-sm">
                  <strong>Train ID:</strong> {train.train_id}<br/>
                  <strong>Status:</strong> <span className={`font-medium ${train.status === 'On Time' ? 'text-green-600' : 'text-red-600'}`}>{train.status}</span><br/>
                  <strong>Location:</strong> {train.current_km.toFixed(2)} KM<br/>
                  {train.delay_minutes > 0 && (
                    <div className="text-red-600 font-medium">
                      <strong>Delay:</strong> {train.delay_minutes} minutes
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border text-xs z-[1000]">
        <div className="font-semibold mb-2 text-gray-800 dark:text-white">Railway Network Legend</div>
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 rounded-full mr-2"></div>
            <span className="text-gray-700 dark:text-gray-300">Railway Stations</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-2 bg-red-600 mr-2"></div>
            <span className="text-gray-700 dark:text-gray-300">Section Route</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-600 mr-2"></div>
            <span className="text-gray-700 dark:text-gray-300">Active Trains</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-2 bg-gray-400 mr-2"></div>
            <span className="text-gray-700 dark:text-gray-300">Railway Infrastructure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionMap;
