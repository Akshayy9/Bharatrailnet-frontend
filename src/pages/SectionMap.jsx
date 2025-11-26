// SectionMap.jsx - Railway-focused version (Fixed)

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Auto-detect API URL based on environment
const API_BASE_URL =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : 'https://backend-v3iv.onrender.com';

// Custom station/train icons
const stationIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`<svg width="32" height="32">ircle cx="16" cy="16" r="8" fill="#4078c0"/></svg>`),
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const trainIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`<svg width="40" height="40"><rect x="6" y="18" width="28" height="12" fill="#e53935"/></svg>`),
  iconSize: [40, 40],
  iconAnchor: [20, 30]
});

const SectionMap = ({ sectionId, wsData }) => {
  const [mapData, setMapData] = useState({ stations: [], routes: [], live_trains: [] });
  const [center, setCenter] = useState([28.6675, 77.4199]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSectionMapData();
    // eslint-disable-next-line
  }, [sectionId]);

  const fetchSectionMapData = async () => {
    try {
      setLoading(true);
      // FIX: Try both "brn_token" and "token" for compatibility
      const storedToken =
        localStorage.getItem('brn_token') ||
        localStorage.getItem('token');

      const response = await fetch(
        `${API_BASE_URL}/api/section_map/${sectionId}/geo`,
        {
          headers: {
            Authorization: `Bearer ${storedToken}`
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMapData(data);
        // Set map center and zoom to focus on railway section if stations exist
        if (data.stations.length > 0) {
          const lats = data.stations.map((s) => s.latitude);
          const lngs = data.stations.map((s) => s.longitude);
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
      <div className="flex justify-center items-center h-96">
        <span>Loading map...</span>
      </div>
    );
  }

  // Render nothing if no stations
  if (mapData.stations.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <span>No station or map data available</span>
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <MapContainer
        center={center}
        zoom={11}
        style={{ width: "100%", height: "100%", minHeight: "340px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render stations */}
        {mapData.stations.map((station, i) => (
          <Marker
            key={station.code || station.name || i}
            position={[station.latitude, station.longitude]}
            icon={stationIcon}
          >
            <Popup>
              <strong>{station.name}</strong>
              <br />
              Code: {station.code}<br />
              KM: {station.kilometer_marker}
            </Popup>
          </Marker>
        ))}

        {/* Polyline for routes */}
        {mapData.routes.map((route, i) => (
          <Polyline
            positions={route.points.map((pt) => [pt.lat, pt.lng])}
            color="#4078c0"
            weight={4}
            key={i}
          />
        ))}

        {/* Live train markers */}
        {mapData.live_trains.map((train, i) => (
          <Marker
            key={train.train_id || train.name || i}
            position={[train.latitude, train.longitude]}
            icon={trainIcon}
          >
            <Popup>
              <strong>{train.name}</strong>
              <br />
              Status: {train.status}<br />
              Delay: {train.delay_minutes} min
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default SectionMap;
