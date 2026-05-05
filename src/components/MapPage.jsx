import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Điểm mặc định (trung tâm Đà Nẵng)
const DEFAULT_CENTER = [16.0544, 108.2022];

// ORS API Key
const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImJhZmMzZTc1ZWM2YjRiZjA4ZDRkMDA3YTM5ZTNlYzg1IiwiaCI6Im11cm11cjY0In0=";

export default function SimpleMap() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [transport, setTransport] = useState('motorcycle');
  
  const mapRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const markerRef = useRef(null);

  // Profile mapping
  const profileMap = {
    motorcycle: 'cycling-regular',
    car: 'driving-car',
    walking: 'foot-walking'
  };

  // Route colors
  const routeColors = {
    motorcycle: '#ff6b6b',
    car: '#3388ff',
    walking: '#4ecdc4'
  };

  // Format tên hiển thị
  const formatPlaceName = (displayName) => {
    const parts = displayName.split(',');
    return parts.slice(0, 2).join(',');
  };

  // Tìm kiếm địa điểm
  const searchLocation = async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    try {
      const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query + ', Đà Nẵng, Việt Nam'
      )}&format=json&limit=5&addressdetails=1&countrycodes=vn`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TrafficMapApp/1.0'
        }
      });
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        alert('Không tìm thấy địa điểm!');
      }
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
      alert('Lỗi kết nối!');
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(searchQuery);
    }, 500);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Xóa marker cũ
  const clearMarker = () => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  };

  // Thêm marker mới
  const addMarker = (lat, lng, name) => {
    clearMarker();
    
    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="relative">
               <div class="relative flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg border-2 border-white">
                 <span class="text-white text-sm">📍</span>
               </div>
             </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
    
    markerRef.current = L.marker([lat, lng], { icon: customIcon })
      .addTo(mapRef.current)
      .bindPopup(name)
      .openPopup();
  };

  // Tính route
  const calculateRoute = async (startLat, startLng, endLat, endLng) => {
    const profile = profileMap[transport];
    
    try {
      const response = await fetch(`https://api.openrouteservice.org/v2/directions/${profile}/geojson`, {
        method: 'POST',
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coordinates: [[startLng, startLat], [endLng, endLat]],
          preference: 'recommended'
        })
      });
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
        const summary = data.features[0].properties.summary;
        
        setRoutePoints(coords);
        setRouteInfo({
          distance: (summary.distance / 1000).toFixed(2),
          duration: Math.round(summary.duration / 60)
        });
        
        // Zoom để thấy toàn bộ route
        if (mapRef.current && coords.length > 0) {
          const bounds = L.latLngBounds(coords);
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      } else {
        setRoutePoints([]);
        setRouteInfo(null);
        alert('Không thể tính đường đi!');
      }
    } catch (error) {
      console.error('Lỗi route:', error);
      alert('Lỗi tính đường đi!');
      setRoutePoints([]);
      setRouteInfo(null);
    }
  };

  // Chọn địa điểm
  const selectPlace = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    const name = formatPlaceName(place.display_name);
    
    setSearchQuery(name);
    setSelectedLocation({ lat, lng, name });
    setSuggestions([]);
    setShowSuggestions(false);
    
    addMarker(lat, lng, name);
    
    // Fly to location
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 16);
    }
    
    // Nếu có vị trí bắt đầu mặc định, tính route
    // Dùng điểm mặc định ở Đà Nẵng làm điểm bắt đầu
    const startLat = DEFAULT_CENTER[0];
    const startLng = DEFAULT_CENTER[1];
    calculateRoute(startLat, startLng, lat, lng);
  };

  // Clear all
  const clearAll = () => {
    setSearchQuery('');
    setSelectedLocation(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setRoutePoints([]);
    setRouteInfo(null);
    clearMarker();
    
    if (mapRef.current) {
      mapRef.current.setView(DEFAULT_CENTER, 14);
    }
  };

  // Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchLocation(searchQuery);
    }
  };

  return (
    <div className="relative h-screen w-full">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap contributors'
        />
        <ZoomControl position="bottomright" />
        
        {routePoints.length > 0 && (
          <Polyline
            positions={routePoints}
            color={routeColors[transport]}
            weight={6}
            opacity={0.8}
          />
        )}
      </MapContainer>

      {/* Search Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex h-12 rounded-full bg-white shadow-lg border border-gray-200 overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Tìm địa chỉ, đường phố tại Đà Nẵng..."
              className="flex-1 px-5 outline-none text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearAll}
                className="px-3 text-gray-400 hover:text-red-500"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              className="px-5 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              disabled={isSearching}
            >
              {isSearching ? '...' : '🔍'}
            </button>
          </div>
          
          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl max-h-80 overflow-auto z-50">
              {suggestions.map((place, index) => (
                <div
                  key={index}
                  onClick={() => selectPlace(place)}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-none"
                >
                  <div className="font-medium text-sm">
                    {formatPlaceName(place.display_name)}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {place.display_name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Transport Selector */}
      <div className="absolute bottom-6 right-4 z-[1000] bg-white rounded-2xl shadow-lg p-2 border border-gray-200">
        <div className="flex gap-2">
          {[
            { key: 'motorcycle', label: '🏍️ Xe máy' },
            { key: 'car', label: '🚗 Ô tô' },
            { key: 'walking', label: '🚶 Đi bộ' }
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setTransport(item.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                transport === item.key
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Route Info */}
      {routeInfo && selectedLocation && (
        <div className="absolute bottom-6 left-4 right-4 z-[1000] max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">📍 {selectedLocation.name}</h3>
              <button onClick={clearAll} className="text-gray-400 hover:text-red-500">
                ✕
              </button>
            </div>
            <div className="flex gap-6">
              <div>
                <div className="text-xs text-gray-500">Khoảng cách</div>
                <div className="text-xl font-bold text-blue-600">{routeInfo.distance} km</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Thời gian</div>
                <div className="text-xl font-bold text-blue-600">{routeInfo.duration} phút</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Phương tiện</div>
                <div className="text-sm font-medium text-gray-700">
                  {transport === 'motorcycle' ? '🏍️ Xe máy' : transport === 'car' ? '🚗 Ô tô' : '🚶 Đi bộ'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instruction */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
        <div className="bg-black/50 text-white text-xs px-3 py-1 rounded-full">
          🔍 Tìm kiếm địa chỉ để xem đường đi
        </div>
      </div>
    </div>
  );
}