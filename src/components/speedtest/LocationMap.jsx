import React, { useEffect, useRef } from 'react';
import L from 'leaflet'; // npm install leaflet react-leaflet
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

// Fix for default icon issues with Webpack/CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function LocationMap({ userLocation, serverLocation }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null); // Store the map instance
  const userMarkerRef = useRef(null);
  const serverMarkerRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Initialize map only once
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: false, // Hide default zoom control
        attributionControl: false // Hide default attribution
      }).setView([0, 0], 2); // Initial view, zoomed out global

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous layers
    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
    if (serverMarkerRef.current) map.removeLayer(serverMarkerRef.current);
    if (lineRef.current) map.removeLayer(lineRef.current);

    const markers = [];

    // Add user marker
    if (userLocation) {
      userMarkerRef.current = L.marker(userLocation, {
        icon: L.icon({
          iconUrl: 'data:image/svg+xml;base64,' + btoa('<svg fill="#00f5ff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>'),
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(map)
        .bindPopup("Your Location")
        .openPopup();
      markers.push(userMarkerRef.current.getLatLng());
    }

    // Add server marker
    if (serverLocation && serverLocation.coords) {
      serverMarkerRef.current = L.marker(serverLocation.coords, {
        icon: L.icon({
          iconUrl: 'data:image/svg+xml;base64,' + btoa('<svg fill="#00ff88" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>'),
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(map)
        .bindPopup(serverLocation.name)
        .openPopup();
      markers.push(serverMarkerRef.current.getLatLng());
    }

    // Draw line between points
    if (userLocation && serverLocation && serverLocation.coords) {
      lineRef.current = L.polyline([userLocation, serverLocation.coords], { color: '#8888ff', weight: 3, opacity: 0.7 }).addTo(map);
      markers.push(userMarkerRef.current.getLatLng(), serverMarkerRef.current.getLatLng());
    }

    // Fit map to bounds if markers exist
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    } else {
      map.setView([0, 0], 2); // Default view if no markers
    }

  }, [userLocation, serverLocation]); // Re-run effect if locations change

  return <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: '8px' }}></div>;
}