<<<<<<< HEAD
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl } from 'react-leaflet';
=======
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline, ZoomControl } from 'react-leaflet';
>>>>>>> 71f345371db09f53e579c67f8a739646285499a0
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

<<<<<<< HEAD
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
=======
// Custom icons with animations
const userIcon = L.divIcon({
  className: 'custom-div-icon',
  html: '<div class="relative"><div class="absolute -inset-4 rounded-full bg-blue-500/30 animate-ping"></div><div class="relative flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg border-2 border-white animate-pulse"><span class="material-symbols-outlined text-[16px] text-white">person</span></div></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const destinationIcon = L.divIcon({
  className: 'custom-div-icon',
  html: '<div class="relative"><div class="absolute -inset-4 rounded-full bg-red-500/20 animate-pulse"></div><div class="relative flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg border-2 border-white"><span class="material-symbols-outlined text-[16px] text-white">location_on</span></div></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

// Traffic incident icon
const incidentIcon = (severity) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="relative"><div class="flex size-6 items-center justify-center rounded-full ${severity === 'high' ? 'bg-red-500' : severity === 'medium' ? 'bg-amber-500' : 'bg-yellow-500'} shadow-lg border-2 border-white"><span class="material-symbols-outlined text-[12px] text-white">warning</span></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Map Controller Component
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

// Traffic Layer Component
function TrafficLayer({ showTraffic, incidents }) {
  const map = useMap();
  
  useEffect(() => {
    if (!showTraffic) return;
    
    const trafficLayer = L.layerGroup();
    
    incidents.forEach(incident => {
      const marker = L.marker([incident.lat, incident.lon], {
        icon: incidentIcon(incident.severity)
      }).bindPopup(`
        <div class="text-sm">
          <strong class="text-red-600">${incident.title}</strong>
          <br/>
          <span class="text-xs text-gray-600">${incident.description}</span>
          <br/>
          <span class="text-xs text-gray-500">Reported: ${incident.time}</span>
        </div>
      `);
      trafficLayer.addLayer(marker);
    });
    
    trafficLayer.addTo(map);
    
    return () => {
      trafficLayer.remove();
    };
  }, [showTraffic, incidents, map]);
  
  return null;
}

function MapPage() {
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [zoom, setZoom] = useState(13);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapType, setMapType] = useState('street');
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routePoints, setRoutePoints] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [trafficIncidents] = useState([
    { id: 1, lat: 13.095, lon: 109.321, title: 'Accident at Main Intersection', description: '2 vehicles involved, lane blocked', severity: 'high', time: '5 mins ago' },
    { id: 2, lat: 13.088, lon: 109.315, title: 'Road Construction', description: 'Right lane closed', severity: 'medium', time: '20 mins ago' },
    { id: 3, lat: 13.102, lon: 109.328, title: 'Heavy Congestion', description: 'Slow moving traffic', severity: 'medium', time: '10 mins ago' },
  ]);
  const [routeAlternatives, setRouteAlternatives] = useState([]);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [recentPlaces, setRecentPlaces] = useState([]);
  const [mapStyle, setMapStyle] = useState('default');
  const [searchLoading, setSearchLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Weather state
  const [weather, setWeather] = useState({
    temp: null,
    condition: '',
    location: '',
    loading: true,
    humidity: null,
    windSpeed: null,
    icon: ''
  });

  // Categories
  const categories = [
    { id: 'restaurant', name: 'Restaurant', icon: 'restaurant', color: '#ef4444', bgColor: '#fee2e2' },
    { id: 'fuel', name: 'Gas Station', icon: 'local_gas_station', color: '#f59e0b', bgColor: '#fef3c7' },
    { id: 'hospital', name: 'Hospital', icon: 'local_hospital', color: '#3b82f6', bgColor: '#dbeafe' },
    { id: 'school', name: 'School', icon: 'school', color: '#8b5cf6', bgColor: '#ede9fe' },
    { id: 'parking', name: 'Parking', icon: 'local_parking', color: '#10b981', bgColor: '#d1fae5' },
    { id: 'cafe', name: 'Cafe', icon: 'local_cafe', color: '#a16207', bgColor: '#fef9c3' },
    { id: 'atm', name: 'ATM', icon: 'account_balance', color: '#6b7280', bgColor: '#f3f4f6' },
    { id: 'police', name: 'Police', icon: 'local_police', color: '#1e3a8a', bgColor: '#dbeafe' },
    { id: 'pharmacy', name: 'Pharmacy', icon: 'medication', color: '#059669', bgColor: '#d1fae5' },
    { id: 'supermarket', name: 'Supermarket', icon: 'shopping_cart', color: '#dc2626', bgColor: '#fee2e2' },
  ];

  // Load data from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('mapFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }
    
    const savedRecents = localStorage.getItem('recentPlaces');
    if (savedRecents) {
      try {
        setRecentPlaces(JSON.parse(savedRecents));
      } catch (e) {
        console.error('Error loading recent places:', e);
      }
    }
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setLocationLoading(false);
          
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 13);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setUserLocation([13.095, 109.321]);
          setLocationLoading(false);
          setError('Unable to get your location. Showing Tuy Hòa, Phú Yên');
          setTimeout(() => setError(null), 3000);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setUserLocation([13.095, 109.321]);
      setLocationLoading(false);
      setError('Geolocation not supported. Showing Tuy Hòa, Phú Yên');
      setTimeout(() => setError(null), 3000);
    }
  }, []);

  // Fetch weather
  const fetchWeather = useCallback(async (lat, lon) => {
    try {
      const apiKey = 'bd5e378503939ddaee76f12ad7a97608';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );
      const data = await response.json();

      if (response.ok) {
        const cityResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const cityData = await cityResponse.json();
        const cityName = cityData.address?.city || 
                        cityData.address?.town || 
                        cityData.address?.village || 
                        cityData.address?.province ||
                        'Tuy Hòa';

        setWeather({
          temp: Math.round(data.main.temp),
          condition: data.weather[0].description,
          location: cityName,
          loading: false,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed),
          icon: data.weather[0].icon
        });
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
      setWeather({
        temp: 28,
        condition: 'clear sky',
        location: 'Tuy Hòa',
        loading: false,
        humidity: 65,
        windSpeed: 12,
        icon: '01d'
      });
    }
  }, []);
>>>>>>> 71f345371db09f53e579c67f8a739646285499a0

  // Debounce search
  useEffect(() => {
<<<<<<< HEAD
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
=======
    if (userLocation) {
      fetchWeather(userLocation[0], userLocation[1]);
    }
  }, [userLocation, fetchWeather]);

  // Get user location
  const getUserLocation = useCallback(() => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          mapRef.current?.setView([latitude, longitude], 15);
          setLocationLoading(false);
          fetchWeather(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location');
          setLocationLoading(false);
          setTimeout(() => setError(null), 3000);
        }
      );
    } else {
      setError('Geolocation not supported');
      setLocationLoading(false);
      setTimeout(() => setError(null), 3000);
    }
  }, [fetchWeather]);

  // Save to recent places
  const saveToRecent = useCallback((location) => {
    const newRecent = [
      { 
        id: Date.now(),
        name: location.name, 
        lat: location.lat, 
        lon: location.lon, 
        address: location.address || location.name,
        timestamp: Date.now() 
      }, 
      ...recentPlaces.filter(p => p.name !== location.name)
    ].slice(0, 10);
    
    setRecentPlaces(newRecent);
    localStorage.setItem('recentPlaces', JSON.stringify(newRecent));
  }, [recentPlaces]);

  // Search with enhanced features
  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery
        )}&format=json&limit=5&countrycodes=vn&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const location = data[0];
        const lat = parseFloat(location.lat);
        const lon = parseFloat(location.lon);
        
        setDestination([lat, lon]);
        setSearchQuery(location.display_name.split(',')[0]);
        setShowResults(false);
        setRouteInfo(null);
        setRoutePoints([]);
        
        saveToRecent({
          name: location.display_name.split(',')[0],
          lat,
          lon,
          address: location.display_name
        });
        
        const map = mapRef.current;
        if (map) {
          map.setView([lat, lon], 16);
        }
      } else {
        setError('Location not found');
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery, saveToRecent]);

  // Fetch search suggestions
  const fetchSuggestions = useCallback(async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=5&countrycodes=vn&addressdetails=1`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Suggestions error:', error);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value === '') {
      // If input is empty, show recent places
      setSearchResults([]);
      setShowResults(true);
    } else {
      // If typing, fetch suggestions
      fetchSuggestions(value);
    }
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    if (searchQuery === '') {
      // Show recent places when focused and input is empty
      setShowResults(true);
    }
  };

  // Handle blur
  const handleBlur = () => {
    // Delay to allow click on results
    setTimeout(() => {
      setIsFocused(false);
      if (!searchQuery) {
        setShowResults(false);
      }
    }, 200);
  };

  // Clear search and all route data
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDestination(null);
    setRouteInfo(null);
    setRoutePoints([]);
    setSearchResults([]);
    setShowResults(false);
    // After clearing, if focused, show recent places
    if (isFocused) {
      setShowResults(true);
    }
  }, [isFocused]);

  const selectSuggestion = useCallback((location) => {
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);
    setDestination([lat, lon]);
    setSearchQuery(location.display_name.split(',')[0]);
    setShowResults(false);
    setRouteInfo(null);
    setRoutePoints([]);
    
    saveToRecent({
      name: location.display_name.split(',')[0],
      lat,
      lon,
      address: location.display_name
    });
    
    const map = mapRef.current;
    if (map) {
      map.setView([lat, lon], 16);
    }
  }, [saveToRecent]);

  // Get directions with alternatives
  const getDirections = useCallback(async () => {
    if (!userLocation || !destination) {
      setError('Please select a destination first');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsRouting(true);
    try {
      const start = `${userLocation[1]},${userLocation[0]}`;
      const end = `${destination[1]},${destination[0]}`;
      
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson&alternatives=true`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const mainRoute = data.routes[0];
        const distance = (mainRoute.distance / 1000).toFixed(1);
        const duration = Math.round(mainRoute.duration / 60);
        
        const points = mainRoute.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRoutePoints(points);
        
        setRouteInfo({
          distance,
          duration,
          routeIndex: 0
        });

        const alternatives = data.routes.slice(1, 4).map((route, idx) => ({
          id: idx,
          distance: (route.distance / 1000).toFixed(1),
          duration: Math.round(route.duration / 60),
          points: route.geometry.coordinates.map(coord => [coord[1], coord[0]])
        }));
        setRouteAlternatives(alternatives);

        const bounds = L.latLngBounds(points);
        const map = mapRef.current;
        if (map) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } else {
        setError('No route found');
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error('Routing error:', error);
      setError('Routing failed');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsRouting(false);
    }
  }, [userLocation, destination]);

  // Find nearby places
  const findNearbyPlaces = useCallback(async (category) => {
    if (!userLocation) return;

    setSelectedCategory(category);
    setShowCategoryMenu(false);
    setNearbyPlaces([]);

    try {
      const overpassQuery = `
        [out:json];
        (
          node["amenity"="${category}"](around:3000,${userLocation[0]},${userLocation[1]});
          way["amenity"="${category}"](around:3000,${userLocation[0]},${userLocation[1]});
        );
        out center;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery
      });

      const data = await response.json();
      const places = data.elements.map(el => ({
        id: el.id,
        name: el.tags?.name || categories.find(c => c.id === category)?.name || category,
        lat: el.lat || el.center?.lat,
        lon: el.lon || el.center?.lon,
        category: category,
        address: el.tags?.addr_full || el.tags?.street || ''
      })).filter(p => p.lat && p.lon).slice(0, 15);

      setNearbyPlaces(places);

      if (places.length > 0) {
        const bounds = L.latLngBounds(
          places.map(p => [p.lat, p.lon]).concat([userLocation])
        );
        const map = mapRef.current;
        if (map) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } else {
        setError(`No ${categories.find(c => c.id === category)?.name} found nearby`);
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error('Nearby places error:', error);
      setError('Failed to find nearby places');
      setTimeout(() => setError(null), 3000);
    }
  }, [userLocation, categories]);

  // Add to favorites
  const addToFavorites = useCallback(() => {
    if (!destination) return;
    
    const newFavorite = {
      id: Date.now(),
      name: searchQuery,
      lat: destination[0],
      lon: destination[1],
      timestamp: Date.now()
    };
    
    const updatedFavorites = [...favorites, newFavorite];
    setFavorites(updatedFavorites);
    localStorage.setItem('mapFavorites', JSON.stringify(updatedFavorites));
    setError('Added to favorites');
    setTimeout(() => setError(null), 2000);
  }, [destination, searchQuery, favorites]);

  // Remove from favorites
  const removeFavorite = useCallback((id) => {
    const updatedFavorites = favorites.filter(f => f.id !== id);
    setFavorites(updatedFavorites);
    localStorage.setItem('mapFavorites', JSON.stringify(updatedFavorites));
    setError('Removed from favorites');
    setTimeout(() => setError(null), 2000);
  }, [favorites]);

  // Switch route alternative
  const switchRoute = useCallback((alternative) => {
    setRoutePoints(alternative.points);
    setRouteInfo({
      distance: alternative.distance,
      duration: alternative.duration,
      routeIndex: alternative.id
    });
    setShowAlternatives(false);
    
    const bounds = L.latLngBounds(alternative.points);
    const map = mapRef.current;
    if (map) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, []);

  const mapRef = useRef(null);

  // Get tile URL based on map style
  const getTileUrl = useCallback(() => {
    if (mapType === 'satellite') {
      return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    }
    if (mapStyle === 'dark') {
      return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    }
    if (mapStyle === 'light') {
      return "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    }
    return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  }, [mapType, mapStyle]);

  // Clear all
  const clearAll = useCallback(() => {
    setDestination(null);
    setRouteInfo(null);
    setRoutePoints([]);
    setNearbyPlaces([]);
    setSelectedCategory(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    const map = mapRef.current;
    if (map && userLocation) {
      map.setView(userLocation, 13);
    }
  }, [userLocation]);

  // Format time
  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  if (locationLoading || !userLocation) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Getting your location...</p>
          <p className="text-xs text-gray-400 mt-2">Please allow location access</p>
>>>>>>> 71f345371db09f53e579c67f8a739646285499a0
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Map Container */}
      <MapContainer
        center={userLocation}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          url={getTileUrl()}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        <MapController center={userLocation} zoom={zoom} />
        
        <ZoomControl position="bottomright" />
        
        {/* Traffic Layer */}
        <TrafficLayer showTraffic={showTraffic} incidents={trafficIncidents} />
        
        {/* Route Line */}
        {routePoints.length > 0 && (
          <Polyline
            positions={routePoints}
            color="#7b00ff"
            weight={5}
            opacity={0.8}
            dashArray={routeInfo?.routeIndex === 0 ? null : "5, 10"}
          />
        )}

        {/* User Location Marker */}
        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <div className="text-sm">
              <strong>Your Location</strong>
              <br />
              <span className="text-xs text-gray-500">You are here</span>
            </div>
          </Popup>
        </Marker>

        {/* Destination Marker */}
        {destination && (
          <Marker position={destination} icon={destinationIcon}>
            <Popup>
              <div className="text-sm">
                <strong>Destination</strong>
                <br />
                <span className="text-xs text-gray-500">{searchQuery}</span>
                <br />
                <button
                  onClick={addToFavorites}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Add to favorites
                </button>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Nearby Places Markers */}
        {nearbyPlaces.map((place) => {
          const category = categories.find(c => c.id === place.category);
          const icon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="relative"><div class="flex size-7 items-center justify-center rounded-full shadow-lg border-2 border-white" style="background-color: ${category?.color || '#7b00ff'}"><span class="material-symbols-outlined text-[14px] text-white">${category?.icon || 'place'}</span></div><div class="absolute -bottom-1 -right-1 size-3 bg-white rounded-full border border-gray-300"></div></div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });
          
          return (
            <Marker
              key={place.id}
              position={[place.lat, place.lon]}
              icon={icon}
            >
              <Popup>
                <div className="text-sm min-w-[150px]">
                  <strong className="text-gray-900">{place.name}</strong>
                  <br />
                  <span className="text-xs text-gray-500">
                    {categories.find(c => c.id === place.category)?.name}
                  </span>
                  {place.address && (
                    <>
                      <br />
                      <span className="text-xs text-gray-400">{place.address}</span>
                    </>
                  )}
                  <br />
                  <button
                    onClick={() => {
                      setDestination([place.lat, place.lon]);
                      setSearchQuery(place.name);
                      setRouteInfo(null);
                      setRoutePoints([]);
                    }}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    Navigate here
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Error Message */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {/* Route Info */}
<<<<<<< HEAD
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
=======
      {routeInfo && (
        <div className="absolute top-20 left-6 z-20 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 min-w-[200px] animate-in slide-in-from-left-2">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Route Information
            </div>
            {routeAlternatives.length > 0 && (
              <button
                onClick={() => setShowAlternatives(!showAlternatives)}
                className="text-xs text-primary hover:underline"
              >
                Alternatives
              </button>
            )}
          </div>
          <div className="flex gap-4">
            <div>
              <span className="text-xs text-slate-500">Distance</span>
              <p className="text-lg font-bold text-primary">{routeInfo.distance} km</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Duration</span>
              <p className="text-lg font-bold text-primary">{routeInfo.duration} min</p>
            </div>
          </div>
          
          {showAlternatives && routeAlternatives.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-600 mb-2">Alternative Routes</p>
              {routeAlternatives.map((alt, idx) => (
                <button
                  key={idx}
                  onClick={() => switchRoute(alt)}
                  className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors mb-1"
                >
                  <div className="flex justify-between text-xs">
                    <span>Route {idx + 1}</span>
                    <span className="text-primary">{alt.distance} km • {alt.duration} min</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Top Bar */}
      <div className="absolute top-6 left-6 right-6 z-10 flex gap-3">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <div className="flex h-12 w-full items-center rounded-xl bg-white dark:bg-slate-900 px-4 shadow-2xl border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-primary">search</span>
              <input
                className="flex-1 border-none bg-transparent px-3 text-sm focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                placeholder="Search places, streets, addresses..."
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                autoComplete="off"
              />
              {searchLoading && (
                <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              )}
              {searchQuery && !searchLoading && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="material-symbols-outlined text-slate-400 hover:text-red-500 transition-colors"
                  title="Clear search"
                >
                  close
                </button>
              )}
              <button
                type="submit"
                className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors ml-2"
              >
                arrow_forward
              </button>
            </div>

            {/* Search Results / Recent Places */}
            {showResults && isFocused && (
              <div className="absolute top-14 left-0 w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-96 overflow-auto z-20">
                {searchQuery === '' ? (
                  // Show Recent Places when input is empty
                  <>
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">history</span>
                        Recent Places
                      </span>
                      {recentPlaces.length > 0 && (
                        <button
                          onClick={() => {
                            localStorage.removeItem('recentPlaces');
                            setRecentPlaces([]);
                            setError('Recent places cleared');
                            setTimeout(() => setError(null), 2000);
                          }}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    {recentPlaces.length === 0 ? (
                      <div className="p-8 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300">history</span>
                        <p className="text-sm text-slate-500 mt-2">No recent places</p>
                        <p className="text-xs text-slate-400">Search for places to see them here</p>
                      </div>
                    ) : (
                      recentPlaces.map((place) => (
                        <button
                          key={place.id}
                          className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
                          onClick={() => {
                            setDestination([place.lat, place.lon]);
                            setSearchQuery(place.name);
                            setShowResults(false);
                            setRouteInfo(null);
                            setRoutePoints([]);
                            mapRef.current?.setView([place.lat, place.lon], 15);
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-sm mt-0.5">history</span>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-900 dark:text-white">{place.name}</div>
                              <div className="text-xs text-slate-500 truncate">{place.address}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{formatTime(place.timestamp)}</div>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </>
                ) : (
                  // Show Search Suggestions when typing
                  <>
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">search</span>
                        Suggestions for "{searchQuery}"
                      </span>
                    </div>
                    {searchResults.length === 0 && !searchLoading ? (
                      <div className="p-8 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                        <p className="text-sm text-slate-500 mt-2">No results found</p>
                        <p className="text-xs text-slate-400">Try a different search term</p>
                      </div>
                    ) : (
                      searchResults.map((result, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
                          onClick={() => selectSuggestion(result)}
                        >
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-primary text-sm mt-0.5">location_on</span>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {result.display_name.split(',')[0]}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {result.display_name}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Favorites Button */}
          <div className="relative">
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className="h-12 px-4 rounded-xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white transition-all flex items-center gap-2"
              title="Favorites"
            >
              <span className="material-symbols-outlined">star</span>
              <span className="text-sm font-semibold hidden sm:inline">Favorites</span>
            </button>

            {showFavorites && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowFavorites(false)}></div>
                <div className="absolute top-14 right-0 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-40 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Favorite Places</h3>
                      <p className="text-xs text-slate-500 mt-1">Quick access to saved locations</p>
                    </div>
                    {favorites.length > 0 && (
                      <button
                        onClick={() => {
                          localStorage.removeItem('mapFavorites');
                          setFavorites([]);
                          setError('All favorites cleared');
                          setTimeout(() => setError(null), 2000);
                        }}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-auto">
                    {favorites.length === 0 ? (
                      <div className="p-8 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300">star_outline</span>
                        <p className="text-sm text-slate-500 mt-2">No favorites yet</p>
                        <p className="text-xs text-slate-400">Search and save your favorite places</p>
                      </div>
                    ) : (
                      favorites.map((fav) => (
                        <div key={fav.id} className="flex items-center border-b border-slate-100 dark:border-slate-700 last:border-0">
                          <button
                            onClick={() => {
                              setDestination([fav.lat, fav.lon]);
                              setSearchQuery(fav.name);
                              setShowFavorites(false);
                              setRouteInfo(null);
                              setRoutePoints([]);
                              mapRef.current?.setView([fav.lat, fav.lon], 15);
                            }}
                            className="flex-1 text-left px-4 py-3 hover:bg-primary/10 transition-colors"
                          >
                            <div className="text-sm font-medium text-slate-900 dark:text-white">{fav.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {formatTime(fav.timestamp)}
                            </div>
                          </button>
                          <button
                            onClick={() => removeFavorite(fav.id)}
                            className="px-3 py-3 text-slate-400 hover:text-red-500 transition-colors"
                            title="Remove from favorites"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Categories Button */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="h-12 px-4 rounded-xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white transition-all flex items-center gap-2"
              title="Categories"
            >
              <span className="material-symbols-outlined">apps</span>
              <span className="text-sm font-semibold hidden sm:inline">Categories</span>
            </button>

            {showCategoryMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowCategoryMenu(false)}></div>
                <div className="absolute top-14 right-0 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-40 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Categories</h3>
                    <p className="text-xs text-slate-500 mt-1">Find places near you</p>
                  </div>
                  <div className="p-4 grid grid-cols-4 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => findNearbyPlaces(category.id)}
                        className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
                      >
                        <div 
                          className="size-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ backgroundColor: category.bgColor }}
                        >
                          <span 
                            className="material-symbols-outlined text-2xl"
                            style={{ color: category.color }}
                          >
                            {category.icon}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">
                          {category.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Weather Display */}
          <div className="h-12 px-4 rounded-xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">wb_sunny</span>
            <div>
              {weather.loading ? (
                <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {weather.temp}°C
                  </span>
                  <span className="text-xs text-slate-500 ml-2 hidden sm:inline">
                    {weather.location}
                  </span>
                  <div className="text-[10px] text-slate-400 hidden md:block">
                    {weather.humidity}% • {weather.windSpeed} km/h
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Control Panel */}
      <div className="absolute right-6 top-24 z-10 flex flex-col gap-3">
        <div className="flex flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setZoom(z => Math.min(z + 1, 18))}
            className="flex size-11 items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all"
            title="Zoom in"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
          <div className="h-px w-full bg-slate-200 dark:bg-slate-700"></div>
          <button
            onClick={() => setZoom(z => Math.max(z - 1, 3))}
            className="flex size-11 items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all"
            title="Zoom out"
          >
            <span className="material-symbols-outlined">remove</span>
          </button>
        </div>
        
        <button
          onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}
          className="flex size-11 items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-2xl border border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white transition-all"
          title={mapType === 'street' ? 'Switch to satellite' : 'Switch to street'}
        >
          <span className="material-symbols-outlined">
            {mapType === 'street' ? 'satellite' : 'map'}
          </span>
        </button>

        <button
          onClick={() => setMapStyle(prev => prev === 'default' ? 'dark' : prev === 'dark' ? 'light' : 'default')}
          className="flex size-11 items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-2xl border border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white transition-all"
          title="Change map style"
        >
          <span className="material-symbols-outlined">palette</span>
        </button>

        <button
          onClick={() => setShowTraffic(!showTraffic)}
          className={`flex size-11 items-center justify-center rounded-xl shadow-2xl border transition-all ${
            showTraffic 
              ? 'bg-primary text-white border-primary' 
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white'
          }`}
          title="Toggle traffic layer"
        >
          <span className="material-symbols-outlined">traffic</span>
        </button>

        <button
          onClick={getUserLocation}
          className="flex size-11 items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-2xl border border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white transition-all"
          title="My location"
        >
          <span className="material-symbols-outlined">my_location</span>
        </button>

        <button
          onClick={getDirections}
          disabled={isRouting || !destination}
          className={`flex size-11 items-center justify-center rounded-xl shadow-2xl border transition-all ${
            destination 
              ? 'bg-primary text-white border-primary hover:bg-primary/90' 
              : 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed'
          }`}
          title="Get directions"
        >
          {isRouting ? (
            <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined">directions</span>
          )}
        </button>
        
        <button
          onClick={clearAll}
          className="flex size-11 items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-2xl border border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white transition-all"
          title="Clear all"
        >
          <span className="material-symbols-outlined">cleaning_services</span>
        </button>
      </div>

      {/* Bottom Info Bar - Nearby Places */}
      {nearbyPlaces.length > 0 && (
        <div className="absolute bottom-6 left-6 right-6 z-10">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {categories.find(c => c.id === selectedCategory)?.name} Nearby
                </h4>
                <p className="text-xs text-slate-500">{nearbyPlaces.length} places found</p>
              </div>
              <button
                onClick={() => setNearbyPlaces([])}
                className="text-xs text-primary hover:underline"
              >
                Close
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {nearbyPlaces.slice(0, 8).map((place) => {
                const distance = Math.sqrt(
                  Math.pow(place.lat - userLocation[0], 2) + 
                  Math.pow(place.lon - userLocation[1], 2)
                ) * 111;
                return (
                  <button
                    key={place.id}
                    onClick={() => {
                      setDestination([place.lat, place.lon]);
                      setSearchQuery(place.name);
                      setNearbyPlaces([]);
                    }}
                    className="flex-shrink-0 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-primary hover:text-white transition-all text-left"
                  >
                    <div className="text-sm font-medium">{place.name}</div>
                    <div className="text-[10px] text-slate-500 group-hover:text-white/80">
                      {distance.toFixed(1)} km away
                    </div>
                  </button>
                );
              })}
>>>>>>> 71f345371db09f53e579c67f8a739646285499a0
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

export default MapPage;