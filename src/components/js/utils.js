// MapPage.jsx - React component hoàn chỉnh với routing ORS
import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
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

// ========== UTILS ==========
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function isRoadNameQuery(query) {
  if (!query) return false;
  const q = query.toLowerCase().trim();
  if (/\d/.test(q)) return false;
  const roadKeywords = [
    'đường', 'duong', 'phố', 'pho', 'đại lộ', 'dai lo',
    'nguyễn', 'phan', 'trần', 'lê', 'võ', 'hồ', 'lý',
    'quốc lộ', 'quoc lo', 'tỉnh lộ', 'tinh lo',
    'hùng vương', 'điện biên phủ', 'nguyễn hữu thọ',
    'cách mạng tháng 8', '2 tháng 9', '3 tháng 2',
    'bạch đằng', 'phan châu trinh', 'lê duẩn', 'quang trung'
  ];
  return roadKeywords.some(kw => q.includes(kw));
}

async function findClosestPointOnRoad(roadName, userLat, userLon) {
  try {
    const searchQuery = `${roadName}, Đà Nẵng, Việt Nam`;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=30&addressdetails=1&countrycodes=vn&dedupe=1`,
      { headers: { 'Accept': 'application/json', 'User-Agent': 'AI-Traffic-Monitoring-App' } }
    );
    let data = await res.json();
    if (!data || data.length === 0) {
      const fallbackRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(roadName)}&limit=30&addressdetails=1&countrycodes=vn`,
        { headers: { 'Accept': 'application/json', 'User-Agent': 'AI-Traffic-Monitoring-App' } }
      );
      data = await fallbackRes.json();
    }
    if (!data || data.length === 0) return null;
    const withDist = data.map(p => ({
      ...p,
      lat: parseFloat(p.lat),
      lon: parseFloat(p.lon),
      dist: calculateDistance(userLat, userLon, parseFloat(p.lat), parseFloat(p.lon))
    }));
    withDist.sort((a,b) => a.dist - b.dist);
    const best = withDist[0];
    return {
      lat: best.lat,
      lon: best.lon,
      name: best.display_name.split(',')[0],
      display_name: best.display_name
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}

// ========== Map Controller ==========
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// ========== Main Component ==========
export default function MapPage() {
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
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [recentPlaces, setRecentPlaces] = useState([]);
  const [mapStyle, setMapStyle] = useState('default');
  const [searchLoading, setSearchLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Transport profile
  const [transport, setTransport] = useState('motorcycle');
  const profileMap = {
    motorcycle: 'cycling-regular',
    car: 'driving-car',
    walking: 'foot-walking'
  };
  const currentProfile = profileMap[transport];
  
  // Weather state
  const [weather, setWeather] = useState({ temp: null, condition: '', location: '', loading: true, humidity: null, windSpeed: null });
  
  const mapRef = useRef(null);
  
  // Categories
  const categories = [
    { id: 'restaurant', name: 'Nhà hàng', icon: 'restaurant', color: '#ef4444', bgColor: '#fee2e2' },
    { id: 'fuel', name: 'Cây xăng', icon: 'local_gas_station', color: '#f59e0b', bgColor: '#fef3c7' },
    { id: 'hospital', name: 'Bệnh viện', icon: 'local_hospital', color: '#3b82f6', bgColor: '#dbeafe' },
    { id: 'cafe', name: 'Cà phê', icon: 'local_cafe', color: '#a16207', bgColor: '#fef9c3' },
    { id: 'parking', name: 'Bãi xe', icon: 'local_parking', color: '#10b981', bgColor: '#d1fae5' },
    { id: 'atm', name: 'ATM', icon: 'account_balance', color: '#6b7280', bgColor: '#f3f4f6' },
    { id: 'police', name: 'Công an', icon: 'local_police', color: '#1e3a8a', bgColor: '#dbeafe' },
    { id: 'pharmacy', name: 'Nhà thuốc', icon: 'medication', color: '#059669', bgColor: '#d1fae5' },
    { id: 'supermarket', name: 'Siêu thị', icon: 'shopping_cart', color: '#dc2626', bgColor: '#fee2e2' },
  ];
  
  // Load favorites & recents
  useEffect(() => {
    const savedFav = localStorage.getItem('mapFavorites');
    if (savedFav) try { setFavorites(JSON.parse(savedFav)); } catch(e) {}
    const savedRec = localStorage.getItem('recentPlaces');
    if (savedRec) try { setRecentPlaces(JSON.parse(savedRec)); } catch(e) {}
  }, []);
  
  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(loc);
          setLocationLoading(false);
          if (mapRef.current) mapRef.current.setView(loc, 13);
          fetchWeather(loc[0], loc[1]);
        },
        (err) => {
          console.error(err);
          setUserLocation([16.0544, 108.2022]); // Đà Nẵng
          setLocationLoading(false);
          setError('Không lấy được vị trí, hiển thị Đà Nẵng');
          setTimeout(() => setError(null), 3000);
          fetchWeather(16.0544, 108.2022);
        }
      );
    } else {
      setUserLocation([16.0544, 108.2022]);
      setLocationLoading(false);
      fetchWeather(16.0544, 108.2022);
    }
  }, []);
  
  const fetchWeather = useCallback(async (lat, lon) => {
    try {
      const apiKey = 'bd5e378503939ddaee76f12ad7a97608';
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
      const data = await res.json();
      if (res.ok) {
        const cityRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
        const cityData = await cityRes.json();
        const city = cityData.address?.city || cityData.address?.town || 'Đà Nẵng';
        setWeather({
          temp: Math.round(data.main.temp),
          condition: data.weather[0].description,
          location: city,
          loading: false,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed)
        });
      }
    } catch (err) {
      console.error(err);
      setWeather({ temp: 28, condition: 'clear', location: 'Đà Nẵng', loading: false, humidity: 65, windSpeed: 12 });
    }
  }, []);
  
  // ORS Routing
  const calculateRoute = useCallback(async (start, end) => {
    const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImJhZmMzZTc1ZWM2YjRiZjA4ZDRkMDA3YTM5ZTNlYzg1IiwiaCI6Im11cm11cjY0In0=";
    const profile = currentProfile;
    try {
      const res = await fetch(`https://api.openrouteservice.org/v2/directions/${profile}/geojson`, {
        method: 'POST',
        headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinates: [[start[1], start[0]], [end[1], end[0]]],
          instructions: false,
          preference: 'recommended'
        })
      });
      if (!res.ok) throw new Error(`ORS ${res.status}`);
      const data = await res.json();
      if (!data.features || data.features.length === 0) throw new Error('No route');
      const coords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
      const summary = data.features[0].properties.summary;
      const distance = (summary.distance / 1000).toFixed(1);
      const duration = Math.round(summary.duration / 60);
      setRoutePoints(coords);
      setRouteInfo({ distance, duration });
      if (mapRef.current) {
        const bounds = L.latLngBounds(coords);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    } catch (err) {
      console.error(err);
      setError('Không thể tìm đường: ' + err.message);
      setTimeout(() => setError(null), 4000);
    }
  }, [currentProfile]);
  
  // Show destination and route
  const showDestination = useCallback(async (lat, lon, name, fullAddress) => {
    setDestination([lat, lon]);
    setSearchQuery(name);
    setRouteInfo(null);
    setRoutePoints([]);
    // Save to recent
    const newRecent = [{ id: Date.now(), name, lat, lon, address: fullAddress || name, timestamp: Date.now() }, ...recentPlaces.filter(p => p.name !== name)].slice(0, 10);
    setRecentPlaces(newRecent);
    localStorage.setItem('recentPlaces', JSON.stringify(newRecent));
    if (mapRef.current) mapRef.current.setView([lat, lon], 16);
    if (userLocation) {
      setIsRouting(true);
      await calculateRoute(userLocation, [lat, lon]);
      setIsRouting(false);
    }
  }, [userLocation, recentPlaces, calculateRoute]);
  
  // Handle search
  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    
    // Road name handling
    if (isRoadNameQuery(searchQuery)) {
      if (!userLocation) {
        setError('Vui lòng bật định vị để tìm điểm trên đường');
        setSearchLoading(false);
        setTimeout(() => setError(null), 3000);
        return;
      }
      const point = await findClosestPointOnRoad(searchQuery, userLocation[0], userLocation[1]);
      if (point) {
        await showDestination(point.lat, point.lon, point.name, point.display_name);
      } else {
        setError(`Không tìm thấy đường "${searchQuery}" tại Đà Nẵng`);
        setTimeout(() => setError(null), 3000);
      }
      setSearchLoading(false);
      return;
    }
    
    // Normal place search
    const searchTerm = searchQuery.includes('Đà Nẵng') ? searchQuery : `${searchQuery}, Đà Nẵng, Việt Nam`;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=1&addressdetails=1&countrycodes=vn`);
      const data = await res.json();
      if (data && data.length > 0) {
        const place = data[0];
        const lat = parseFloat(place.lat);
        const lon = parseFloat(place.lon);
        const name = place.display_name.split(',')[0];
        await showDestination(lat, lon, name, place.display_name);
      } else {
        setError('Không tìm thấy địa điểm');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi tìm kiếm');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery, userLocation, showDestination]);
  
  // Fetch suggestions
  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Đà Nẵng')}&limit=5&addressdetails=1&countrycodes=vn`);
      const data = await res.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  }, []);
  
  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val === '') {
      setSearchResults([]);
      setShowResults(true);
    } else {
      fetchSuggestions(val);
    }
  };
  
  const handleFocus = () => {
    setIsFocused(true);
    if (searchQuery === '') setShowResults(true);
  };
  
  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      if (!searchQuery) setShowResults(false);
    }, 200);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setDestination(null);
    setRouteInfo(null);
    setRoutePoints([]);
    setSearchResults([]);
    setShowResults(false);
    if (isFocused) setShowResults(true);
  };
  
  const selectSuggestion = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    const name = place.display_name.split(',')[0];
    showDestination(lat, lon, name, place.display_name);
  };
  
  const clearAll = () => {
    setDestination(null);
    setRouteInfo(null);
    setRoutePoints([]);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    if (userLocation && mapRef.current) mapRef.current.setView(userLocation, 13);
  };
  
  const addToFavorites = () => {
    if (!destination) return;
    const newFav = { id: Date.now(), name: searchQuery, lat: destination[0], lon: destination[1], timestamp: Date.now() };
    const updated = [...favorites, newFav];
    setFavorites(updated);
    localStorage.setItem('mapFavorites', JSON.stringify(updated));
    setError('Đã thêm vào yêu thích');
    setTimeout(() => setError(null), 2000);
  };
  
  const removeFavorite = (id) => {
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    localStorage.setItem('mapFavorites', JSON.stringify(updated));
    setError('Đã xóa khỏi yêu thích');
    setTimeout(() => setError(null), 2000);
  };
  
  const findNearbyPlaces = useCallback(async (category) => {
    if (!userLocation) return;
    setSelectedCategory(category);
    setShowCategoryMenu(false);
    setNearbyPlaces([]);
    try {
      const query = `[out:json];(node["amenity"="${category}"](around:3000,${userLocation[0]},${userLocation[1]});way["amenity"="${category}"](around:3000,${userLocation[0]},${userLocation[1]}););out center;`;
      const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query });
      const data = await res.json();
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
        const bounds = L.latLngBounds(places.map(p => [p.lat, p.lon]).concat([userLocation]));
        if (mapRef.current) mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      } else {
        setError(`Không tìm thấy ${categories.find(c => c.id === category)?.name} gần đây`);
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi tìm địa điểm');
      setTimeout(() => setError(null), 3000);
    }
  }, [userLocation, categories]);
  
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(loc);
          if (mapRef.current) mapRef.current.setView(loc, 15);
          fetchWeather(loc[0], loc[1]);
        },
        (err) => {
          setError('Không thể lấy vị trí');
          setTimeout(() => setError(null), 3000);
        }
      );
    }
  };
  
  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };
  
  const getTileUrl = () => {
    if (mapType === 'satellite') return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    if (mapStyle === 'dark') return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    if (mapStyle === 'light') return 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  };
  
  if (locationLoading || !userLocation) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="text-center">
          <div className="size-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang lấy vị trí của bạn...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapContainer center={userLocation} zoom={zoom} style={{ height: '100%', width: '100%' }} zoomControl={false} ref={mapRef}>
        <TileLayer url={getTileUrl()} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' />
        <MapController center={userLocation} zoom={zoom} />
        <ZoomControl position="bottomright" />
        {routePoints.length > 0 && (
          <Polyline positions={routePoints} color={transport === 'motorcycle' ? '#ff6b6b' : transport === 'car' ? '#3388ff' : '#4ecdc4'} weight={6} opacity={0.8} />
        )}
        <Marker position={userLocation} icon={userIcon}>
          <Popup>Vị trí của bạn</Popup>
        </Marker>
        {destination && (
          <Marker position={destination} icon={destinationIcon}>
            <Popup>
              <div className="text-sm">
                <strong>{searchQuery}</strong><br />
                <button onClick={addToFavorites} className="text-xs text-blue-500 hover:underline">Thêm vào yêu thích</button>
              </div>
            </Popup>
          </Marker>
        )}
        {nearbyPlaces.map(place => {
          const cat = categories.find(c => c.id === place.category);
          const icon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="flex size-7 items-center justify-center rounded-full shadow-lg border-2 border-white" style="background-color: ${cat?.color || '#7b00ff'}"><span class="material-symbols-outlined text-[14px] text-white">${cat?.icon || 'place'}</span></div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });
          return (
            <Marker key={place.id} position={[place.lat, place.lon]} icon={icon}>
              <Popup>
                <div className="text-sm">
                  <strong>{place.name}</strong><br />
                  <button onClick={() => showDestination(place.lat, place.lon, place.name, place.address)} className="text-xs text-blue-500">Đi đến</button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Error Toast */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
      
      {/* Route Info */}
      {routeInfo && (
        <div className="absolute top-20 left-6 z-20 bg-white rounded-2xl shadow-2xl p-4 min-w-[200px]">
          <div className="text-sm font-bold mb-2">Thông tin lộ trình</div>
          <div className="flex gap-4">
            <div><span className="text-xs text-gray-500">Khoảng cách</span><p className="text-lg font-bold text-blue-600">{routeInfo.distance} km</p></div>
            <div><span className="text-xs text-gray-500">Thời gian</span><p className="text-lg font-bold text-blue-600">{routeInfo.duration} phút</p></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">Phương tiện: {transport === 'motorcycle' ? 'Xe máy' : transport === 'car' ? 'Ô tô' : 'Đi bộ'}</div>
        </div>
      )}
      
      {/* Top Bar */}
      <div className="absolute top-6 left-6 right-6 z-10 flex gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <div className="flex h-12 w-full items-center rounded-xl bg-white px-4 shadow-2xl border">
              <span className="material-symbols-outlined text-gray-400">search</span>
              <input
                className="flex-1 border-none bg-transparent px-3 text-sm focus:outline-none"
                placeholder="Tìm địa điểm hoặc đường phố..."
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                autoComplete="off"
              />
              {searchLoading && <div className="size-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
              {searchQuery && !searchLoading && (
                <button type="button" onClick={clearSearch} className="material-symbols-outlined text-gray-400 hover:text-red-500">close</button>
              )}
              <button type="submit" className="material-symbols-outlined text-gray-400 hover:text-blue-500 ml-2">arrow_forward</button>
            </div>
            {showResults && isFocused && (
              <div className="absolute top-14 left-0 w-full bg-white rounded-xl shadow-2xl border max-h-96 overflow-auto z-20">
                {searchQuery === '' ? (
                  <>
                    <div className="px-4 py-2 bg-gray-50 border-b flex justify-between">
                      <span className="text-xs font-semibold text-gray-500">Đã tìm gần đây</span>
                      {recentPlaces.length > 0 && (
                        <button onClick={() => { localStorage.removeItem('recentPlaces'); setRecentPlaces([]); }} className="text-xs text-red-500">Xóa tất cả</button>
                      )}
                    </div>
                    {recentPlaces.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">Chưa có địa điểm nào</div>
                    ) : (
                      recentPlaces.map(place => (
                        <button key={place.id} className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b" onClick={() => showDestination(place.lat, place.lon, place.name, place.address)}>
                          <div className="text-sm font-medium">{place.name}</div>
                          <div className="text-xs text-gray-500 truncate">{place.address}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{formatTime(place.timestamp)}</div>
                        </button>
                      ))
                    )}
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2 bg-gray-50 border-b">
                      <span className="text-xs font-semibold text-gray-500">Gợi ý cho "{searchQuery}"</span>
                    </div>
                    {searchResults.length === 0 && !searchLoading ? (
                      <div className="p-8 text-center text-gray-500">Không tìm thấy</div>
                    ) : (
                      searchResults.map((result, idx) => (
                        <button key={idx} className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b" onClick={() => selectSuggestion(result)}>
                          <div className="text-sm font-medium">{result.display_name.split(',')[0]}</div>
                          <div className="text-xs text-gray-500 truncate">{result.display_name}</div>
                        </button>
                      ))
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </form>
        
        <div className="flex gap-2">
          {/* Transport Selector */}
          <div className="flex h-12 rounded-xl bg-white shadow-2xl border overflow-hidden">
            <button onClick={() => setTransport('motorcycle')} className={`px-4 flex items-center gap-1 ${transport === 'motorcycle' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>
              <span className="material-symbols-outlined text-lg">two_wheeler</span>
              <span className="text-sm hidden sm:inline">Xe máy</span>
            </button>
            <button onClick={() => setTransport('car')} className={`px-4 flex items-center gap-1 ${transport === 'car' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>
              <span className="material-symbols-outlined text-lg">directions_car</span>
              <span className="text-sm hidden sm:inline">Ô tô</span>
            </button>
            <button onClick={() => setTransport('walking')} className={`px-4 flex items-center gap-1 ${transport === 'walking' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>
              <span className="material-symbols-outlined text-lg">directions_walk</span>
              <span className="text-sm hidden sm:inline">Đi bộ</span>
            </button>
          </div>
          
          {/* Favorites */}
          <div className="relative">
            <button onClick={() => setShowFavorites(!showFavorites)} className="h-12 px-4 rounded-xl bg-white shadow-2xl border flex items-center gap-2 hover:bg-gray-50">
              <span className="material-symbols-outlined">star</span>
              <span className="text-sm hidden sm:inline">Yêu thích</span>
            </button>
            {showFavorites && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowFavorites(false)}></div>
                <div className="absolute top-14 right-0 w-80 bg-white rounded-2xl shadow-2xl border z-40 overflow-hidden">
                  <div className="p-4 border-b flex justify-between">
                    <div><h3 className="font-bold">Địa điểm yêu thích</h3></div>
                    {favorites.length > 0 && <button onClick={() => { localStorage.removeItem('mapFavorites'); setFavorites([]); }} className="text-xs text-red-500">Xóa tất cả</button>}
                  </div>
                  <div className="max-h-96 overflow-auto">
                    {favorites.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">Chưa có yêu thích</div>
                    ) : (
                      favorites.map(fav => (
                        <div key={fav.id} className="flex items-center border-b">
                          <button onClick={() => showDestination(fav.lat, fav.lon, fav.name, fav.name)} className="flex-1 text-left px-4 py-3 hover:bg-blue-50">
                            <div className="text-sm font-medium">{fav.name}</div>
                            <div className="text-xs text-gray-500">{formatTime(fav.timestamp)}</div>
                          </button>
                          <button onClick={() => removeFavorite(fav.id)} className="px-3 py-3 text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-sm">delete</span></button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Categories */}
          <div className="relative">
            <button onClick={() => setShowCategoryMenu(!showCategoryMenu)} className="h-12 px-4 rounded-xl bg-white shadow-2xl border flex items-center gap-2 hover:bg-gray-50">
              <span className="material-symbols-outlined">apps</span>
              <span className="text-sm hidden sm:inline">Danh mục</span>
            </button>
            {showCategoryMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowCategoryMenu(false)}></div>
                <div className="absolute top-14 right-0 w-96 bg-white rounded-2xl shadow-2xl border z-40 overflow-hidden">
                  <div className="p-4 border-b"><h3 className="font-bold">Tìm kiếm gần đây</h3></div>
                  <div className="p-4 grid grid-cols-4 gap-3">
                    {categories.map(cat => (
                      <button key={cat.id} onClick={() => findNearbyPlaces(cat.id)} className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-gray-50">
                        <div className="size-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.bgColor }}>
                          <span className="material-symbols-outlined text-2xl" style={{ color: cat.color }}>{cat.icon}</span>
                        </div>
                        <span className="text-xs text-center">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Weather */}
          <div className="h-12 px-4 rounded-xl bg-white shadow-2xl border flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">wb_sunny</span>
            {weather.loading ? (
              <div className="size-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="text-sm font-bold">{weather.temp}°C</span>
                <span className="text-xs text-gray-500 hidden sm:inline">{weather.location}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Right Controls */}
      <div className="absolute right-6 top-24 z-10 flex flex-col gap-3">
        <div className="flex flex-col rounded-xl bg-white shadow-2xl border overflow-hidden">
          <button onClick={() => setZoom(z => Math.min(z+1, 18))} className="size-11 flex items-center justify-center hover:bg-gray-100"><span className="material-symbols-outlined">add</span></button>
          <div className="h-px bg-gray-200"></div>
          <button onClick={() => setZoom(z => Math.max(z-1, 3))} className="size-11 flex items-center justify-center hover:bg-gray-100"><span className="material-symbols-outlined">remove</span></button>
        </div>
        <button onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')} className="size-11 rounded-xl bg-white shadow-2xl border flex items-center justify-center hover:bg-gray-100">
          <span className="material-symbols-outlined">{mapType === 'street' ? 'satellite' : 'map'}</span>
        </button>
        <button onClick={() => setMapStyle(prev => prev === 'default' ? 'dark' : prev === 'dark' ? 'light' : 'default')} className="size-11 rounded-xl bg-white shadow-2xl border flex items-center justify-center hover:bg-gray-100">
          <span className="material-symbols-outlined">palette</span>
        </button>
        <button onClick={getUserLocation} className="size-11 rounded-xl bg-white shadow-2xl border flex items-center justify-center hover:bg-gray-100">
          <span className="material-symbols-outlined">my_location</span>
        </button>
        <button onClick={clearAll} className="size-11 rounded-xl bg-white shadow-2xl border flex items-center justify-center hover:bg-gray-100">
          <span className="material-symbols-outlined">cleaning_services</span>
        </button>
      </div>
      
      {/* Nearby Places Bottom Bar */}
      {nearbyPlaces.length > 0 && (
        <div className="absolute bottom-6 left-6 right-6 z-10">
          <div className="bg-white rounded-xl shadow-2xl border p-4">
            <div className="flex justify-between mb-3">
              <div><h4 className="text-sm font-bold">{categories.find(c => c.id === selectedCategory)?.name} gần đây</h4><p className="text-xs text-gray-500">{nearbyPlaces.length} địa điểm</p></div>
              <button onClick={() => setNearbyPlaces([])} className="text-xs text-blue-500">Đóng</button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {nearbyPlaces.slice(0,8).map(place => {
                const dist = calculateDistance(userLocation[0], userLocation[1], place.lat, place.lon);
                return (
                  <button key={place.id} onClick={() => showDestination(place.lat, place.lon, place.name, place.address)} className="flex-shrink-0 px-4 py-2 bg-gray-100 rounded-xl hover:bg-blue-500 hover:text-white transition-all">
                    <div className="text-sm font-medium">{place.name}</div>
                    <div className="text-[10px] text-gray-500">{dist.toFixed(1)} km</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}