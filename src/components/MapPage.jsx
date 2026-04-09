import { useState, useEffect, useRef, useCallback } from 'react';
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

// Custom Icons
const userIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="relative">
           <div class="absolute -inset-4 rounded-full bg-blue-500/30 animate-ping"></div>
           <div class="relative flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg border-2 border-white">
             <span class="material-symbols-outlined text-[16px] text-white">person</span>
           </div>
         </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const destinationIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="relative">
           <div class="absolute -inset-4 rounded-full bg-red-500/20 animate-pulse"></div>
           <div class="relative flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg border-2 border-white">
             <span class="material-symbols-outlined text-[16px] text-white">location_on</span>
           </div>
         </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

// Roads Data
const roadsData = {
  nguyen_van_linh: { name: "Nguyễn Văn Linh", points: [[16.058838,108.206404],[16.059531,108.208623],[16.060780,108.216995],[16.060959,108.221215]], center: [16.0603,108.214], defaultColor: "#3388ff" },
  hoang_dieu: { name: "Hoàng Diệu", points: [[16.056950,108.217133],[16.060507,108.217027],[16.063190,108.217922],[16.066223,108.220046]], center: [16.0617,108.218], defaultColor: "#33cc33" },
  le_duan: { name: "Lê Duẩn", points: [[16.069516,108.209777],[16.070960,108.217014],[16.071733,108.223918]], center: [16.0707,108.2169], defaultColor: "#ff9900" },
  nguyen_tri_phuong: { name: "Nguyễn Tri Phương", points: [[16.065622,108.202511],[16.062085,108.204406],[16.056987,108.206806]], center: [16.0616,108.2046], defaultColor: "#9900cc" }
};

export default function MapPage() {
  const [userLocation, setUserLocation] = useState([16.0544, 108.2022]);
  const [destination, setDestination] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [transport, setTransport] = useState('motorcycle'); // Mặc định là Xe máy

  const mapRef = useRef(null);
  const roadPolylinesRef = useRef({});

  const profileMap = {
    motorcycle: 'cycling-regular',   // ← Xe máy Việt Nam (tốt nhất hiện tại)
    car: 'driving-car',
    walking: 'foot-walking'
  };

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => console.warn("Không lấy được vị trí")
    );
  }, []);

  // Initialize roads
  const initializeRoads = useCallback((map) => {
    Object.keys(roadsData).forEach(id => {
      const road = roadsData[id];
      const poly = L.polyline(road.points, {
        color: road.defaultColor,
        weight: id === 'nguyen_van_linh' ? 6 : 5,
        opacity: 0
      }).addTo(map).bindTooltip(road.name, { sticky: true });
      roadPolylinesRef.current[id] = poly;
    });
  }, []);

  const showRoad = (roadId) => {
    Object.values(roadPolylinesRef.current).forEach(p => p.setStyle({ opacity: 0 }));
    roadPolylinesRef.current[roadId]?.setStyle({ opacity: 0.9 });
    mapRef.current?.flyTo(roadsData[roadId].center, 15);
  };

  // ORS Route
const calculateAndDrawRoute = useCallback(async (start, end) => {
    if (!start || !end) return;

    const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImJhZmMzZTc1ZWM2YjRiZjA4ZDRkMDA3YTM5ZTNlYzg1IiwiaCI6Im11cm11cjY0In0=";
    const profile = profileMap[transport];

    const style = {
      motorcycle: { color: "#ff6b6b", weight: 8, opacity: 0.93 },
      car: { color: "#3388ff", weight: 8, opacity: 0.90 },
      walking: { color: "#4ecdc4", weight: 6, opacity: 0.85, dashArray: "5,10" }
    }[transport];

    try {
      const res = await fetch(`https://api.openrouteservice.org/v2/directions/${profile}/geojson`, {
        method: "POST",
        headers: { "Authorization": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          coordinates: [[start[1], start[0]], [end[1], end[0]]],
          preference: "recommended",           // ← Quan trọng: Ưu tiên đường nhanh + đường to
          instructions: true,
          // Options nâng cao để ưu tiên đường lớn hơn
          options: {
            avoid_features: ["steps"],     // Tránh bậc thang
            profile_params: {
              weightings: {
                steepness_difficulty: 1,   // Giảm ưu tiên đường dốc nhỏ
              }
            }
          }
        })
      });

      const data = await res.json();
      if (!data.features?.length) return;

      const coords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
      const summary = data.features[0].properties.summary;

      setRoutePoints(coords);
      setRouteInfo({
        distance: (summary.distance / 1000).toFixed(2),
        duration: Math.round(summary.duration / 60),
        mode: transport === 'motorcycle' ? 'Xe máy' : transport === 'car' ? 'Ô tô' : 'Đi bộ'
      });

      mapRef.current?.fitBounds(coords, { padding: [60, 60] });
    } catch (err) {
      console.error(err);
    }
  }, [transport]);

  useEffect(() => {
    if (destination && userLocation) calculateAndDrawRoute(userLocation, destination);
  }, [transport, destination, userLocation]);

  // ... (phần isRoadNameQuery, findClosestPointOnRoad, handleSearch, suggestions giữ nguyên như lần trước)

  const isRoadNameQuery = (query) => {
    if (!query) return false;
    const q = query.toLowerCase().trim();
    if (/\d/.test(q)) return false;
    const keywords = ['đường','duong','phố','nguyễn văn linh','hoàng diệu','lê duẩn','nguyễn tri phương'];
    return keywords.some(kw => q.includes(kw));
  };

  const findClosestPointOnRoad = async (roadName) => {
    try {
      let res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(roadName + ', Đà Nẵng')}&format=json&limit=30&countrycodes=vn`);
      let data = await res.json();
      if (!data.length) {
        res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(roadName)}&format=json&limit=30&countrycodes=vn`);
        data = await res.json();
      }
      const withDist = data.map(p => ({
        ...p,
        lat: parseFloat(p.lat),
        lon: parseFloat(p.lon),
        dist: L.latLng(userLocation).distanceTo([parseFloat(p.lat), parseFloat(p.lon)])
      }));
      withDist.sort((a, b) => a.dist - b.dist);
      return withDist[0];
    } catch (e) { return null; }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (isRoadNameQuery(searchQuery)) {
      const roadId = Object.keys(roadsData).find(id => roadsData[id].name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (roadId) showRoad(roadId);

      const point = await findClosestPointOnRoad(searchQuery);
      if (point) {
        setDestination([point.lat, point.lon]);
        calculateAndDrawRoute(userLocation, [point.lat, point.lon]);
      }
      return;
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery + ', Đà Nẵng')}&format=json&limit=1&countrycodes=vn`);
      const data = await res.json();
      if (data[0]) {
        const { lat, lon } = data[0];
        setDestination([parseFloat(lat), parseFloat(lon)]);
        calculateAndDrawRoute(userLocation, [parseFloat(lat), parseFloat(lon)]);
      }
    } catch (err) { console.error(err); }
  };

  // Gợi ý
  useEffect(() => {
    if (searchQuery.length < 2) { setSuggestions([]); return; }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery + ', Đà Nẵng')}&format=json&limit=8&countrycodes=vn`);
        const data = await res.json();
        setSuggestions(data.map(p => ({
          ...p,
          lat: parseFloat(p.lat),
          lon: parseFloat(p.lon),
          shortName: p.display_name.split(',')[0]
        })));
      } catch (e) {}
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const selectSuggestion = (place) => {
    setSearchQuery(place.shortName);
    setShowSuggestions(false);
    setDestination([place.lat, place.lon]);

    if (isRoadNameQuery(place.shortName)) {
      const roadId = Object.keys(roadsData).find(id => roadsData[id].name.toLowerCase().includes(place.shortName.toLowerCase()));
      if (roadId) showRoad(roadId);
    }
    calculateAndDrawRoute(userLocation, [place.lat, place.lon]);
  };

  const clearAll = () => {
    setSearchQuery('');
    setDestination(null);
    setRoutePoints([]);
    setRouteInfo(null);
    setShowSuggestions(false);
    Object.values(roadPolylinesRef.current).forEach(p => p.setStyle({ opacity: 0 }));
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <MapContainer center={userLocation} zoom={14} style={{ height: '100%', width: '100%' }} ref={mapRef} whenReady={(e) => initializeRoads(e.target)}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ZoomControl position="bottomright" />

        {routePoints.length > 0 && <Polyline positions={routePoints} color={transport === 'motorcycle' ? "#ff6b6b" : "#3388ff"} weight={7} opacity={0.85} />}

        <Marker position={userLocation} icon={userIcon} />
        {destination && <Marker position={destination} icon={destinationIcon} />}
      </MapContainer>

      {/* Search Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-xl px-4">
        <form onSubmit={handleSearch}>
          <div className="flex h-14 rounded-2xl bg-white shadow-2xl px-5 items-center border border-slate-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Tìm đường hoặc địa điểm tại Đà Nẵng..."
              className="flex-1 bg-transparent outline-none text-base placeholder-slate-400"
            />
            {searchQuery && <button type="button" onClick={clearAll} className="mr-3 text-slate-400 hover:text-red-500">✕</button>}
            <button type="submit" className="text-blue-600 hover:text-blue-700">🔍</button>
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-16 w-full bg-white rounded-2xl shadow-2xl max-h-96 overflow-auto z-50 border">
              {suggestions.map((place, i) => (
                <div key={i} onClick={() => selectSuggestion(place)} className="px-5 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-none">
                  <div className="font-medium">{place.shortName}</div>
                  <div className="text-sm text-slate-500 truncate">{place.display_name}</div>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>

            {/* Nút chọn phương tiện - Đặt nổi bật */}
      <div className="absolute top-24 right-6 z-[1000] bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-2 border border-slate-200">
        <div className="flex flex-col gap-1.5">
          {[
            { key: 'motorcycle', label: 'Xe máy', icon: 'two_wheeler', color: 'text-orange-500' },
            { key: 'car', label: 'Ô tô', icon: 'directions_car', color: 'text-blue-600' },
            { key: 'walking', label: 'Đi bộ', icon: 'directions_walk', color: 'text-emerald-600' }
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setTransport(item.key)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-medium transition-all ${
                transport === item.key 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span className={`material-symbols-outlined text-2xl ${item.color}`}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Route Info */}
      {routeInfo && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl px-8 py-4 z-50 text-center border">
          <div className="flex gap-8">
            <div>
              <div className="text-xs text-slate-500">Khoảng cách</div>
              <div className="text-2xl font-bold text-blue-600">{routeInfo.distance} km</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Thời gian</div>
              <div className="text-2xl font-bold text-blue-600">{routeInfo.duration} phút</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Phương tiện</div>
              <div className="text-xl font-medium">{routeInfo.mode}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}