import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { decode } from '@here/flexpolyline';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Điểm mặc định (trung tâm Đà Nẵng)
const DEFAULT_CENTER = [16.0544, 108.2022];

const HERE_API_KEY = "3Rj5CVhby5-KTg-1_cPDReRt9bhxStQV7XQOlZFmb3Q";

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
  const [currentLocation, setCurrentLocation] = useState(null);

  const [draggableMarker, setDraggableMarker] = useState(null);
  
  const mapRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const markerRef = useRef(null);

  const [trafficData, setTrafficData] = useState({});

  const [visibleTrafficLines, setVisibleTrafficLines] = useState([]);

  const [smartRouting, setSmartRouting] = useState(false);

  // Profile mapping
  const profileMap = {
    motorcycle: 'scooter',
    car: 'car',
    walking: 'pedestrian'
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

  const roadSegments = {
  "Camera 1 - Giao lộ Nguyễn Văn Linh": [
    [16.058777, 108.206503],
    [16.059488, 108.208627],
    [16.060692, 108.216996],
    [16.060962, 108.223497],
  ],

  "Camera 2 - Hoàng Diệu": [
    [16.056889, 108.217100],
    [16.060590, 108.217049],
    [16.063148, 108.217911],
  ],

  "Camera 3 - Nguyễn Tri Phương": [
    [16.065592, 108.202696],
    [16.062846, 108.203921],
    [16.060829, 108.205152],
    [16.058867, 108.206116],
  ],

  "Camera 4 - lê duẫn": [
  [16.066322, 108.206841],
  [16.069449, 108.209731],
  [16.070944, 108.216930],
  [16.071774, 108.224000],
  ]
};

const getTrafficColor = (traffic) => {

  switch (traffic) {

    case 'TAC NGHEN':
      return '#ff0000';

    case 'DONG':
      return '#ff8800';

    default:
      return '#00cc66';
  }
};


const getTrafficCost = (traffic) => {
  switch (traffic) {
    case 'TAC NGHEN':
      return 50;   // tránh cực mạnh
    case 'DONG':
      return 15;   // hạn chế
    default:
      return 1;    // bình thường
  }
};

const buildAvoidAreas = () => {
  return Object.entries(roadSegments)
    .map(([cameraKey, segment]) => {
      const traffic = trafficData[cameraKey]?.traffic;

      // chỉ né khi tắc nghẽn
      if (traffic === 'TAC NGHEN') {
        const lats = segment.map(p => p[0]);
        const lngs = segment.map(p => p[1]);

        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        const padding = 0.003; // ~300m

        return `bbox:${minLat - padding},${minLng - padding},${maxLat + padding},${maxLng + padding}`;
      }

      return null;
    })
    .filter(Boolean)
    .join('|');
};

const calculateRouteCost = (coords) => {
  let totalCost = 0;
  let hasCongestion = false; // 👈 THÊM

  Object.entries(roadSegments).forEach(([cameraKey, segment]) => {
    const traffic = trafficData[cameraKey]?.traffic;
    const cost = traffic ? getTrafficCost(traffic) : 0;

    coords.forEach((routePoint) => {
      for (let i = 0; i < segment.length - 1; i++) {
        const dist = distanceToSegment(
          routePoint,
          segment[i],
          segment[i + 1]
        );

        if (dist < 0.0005) {

          // 👇 THÊM ĐOẠN NÀY
          if (traffic === 'TAC NGHEN') {
            hasCongestion = true;
          }

          totalCost += cost * 5;
        }
      }
    });
  });

  // 👇 PHẠT CỰC MẠNH nếu có tắc nghẽn
  if (hasCongestion) {
    totalCost += 200;
  }

  return totalCost;
};


const distanceToSegment = (p, v, w) => {
  const l2 =
    Math.pow(v[0] - w[0], 2) +
    Math.pow(v[1] - w[1], 2);

  if (l2 === 0) return Math.sqrt(
    Math.pow(p[0] - v[0], 2) +
    Math.pow(p[1] - v[1], 2)
  );

  let t =
    ((p[0] - v[0]) * (w[0] - v[0]) +
     (p[1] - v[1]) * (w[1] - v[1])) / l2;

  t = Math.max(0, Math.min(1, t));

  const projection = [
    v[0] + t * (w[0] - v[0]),
    v[1] + t * (w[1] - v[1])
  ];

  return Math.sqrt(
    Math.pow(p[0] - projection[0], 2) +
    Math.pow(p[1] - projection[1], 2)
  );
};

// 🔥 DÁN NGAY DƯỚI ĐÂY
const isRoutePassingCongestion = (coords) => {
  for (let [cameraKey, segment] of Object.entries(roadSegments)) {
    const traffic = trafficData[cameraKey]?.traffic;

    if (traffic === 'TAC NGHEN') {
      for (let point of coords) {
        for (let i = 0; i < segment.length - 1; i++) {
          const dist = distanceToSegment(point, segment[i], segment[i + 1]);
          if (dist < 0.0005) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

const detectVisibleTrafficLines = (routeCoords) => {

  const visible = [];

  Object.entries(roadSegments).forEach(([cameraKey, segment]) => {

    let matched = false;

    routeCoords.forEach((routePoint) => {

      for (let i = 0; i < segment.length - 1; i++) {

        const dist = distanceToSegment(
          routePoint,
          segment[i],
          segment[i + 1]
        );

        if (dist < 0.0001) {
          matched = true;
          break;
        }
      }

    });

    if (matched) {
      visible.push(cameraKey);
    }

  });

  setVisibleTrafficLines(visible);
};

  // Tìm kiếm địa điểm
  // Tìm kiếm địa điểm dùng HERE Geocoding (chính xác hơn)
  const searchLocation = async (query) => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const geocodeUrl = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
        query + ', Đà Nẵng, Việt Nam'
      )}&apiKey=${HERE_API_KEY}&limit=5`;
      const response = await fetch(geocodeUrl);
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const suggestionsFormatted = data.items.map(item => ({
          lat: item.position.lat,
          lon: item.position.lng,
          display_name: item.address.label,
          title: item.title
        }));
        setSuggestions(suggestionsFormatted);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('HERE Geocoding error:', error);
      alert('Không thể tìm kiếm địa điểm');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
  if (selectedLocation && currentLocation) {
    calculateRoute(
      currentLocation.lat,
      currentLocation.lng,
      selectedLocation.lat,
      selectedLocation.lng
    );
  }
}, [transport, trafficData, smartRouting]);


useEffect(() => {

  const fetchTraffic = async () => {
    try {
      const response = await fetch('http://localhost:5000/traffic');

      const data = await response.json();

      setTrafficData(data);

    } catch (err) {
      console.error('Traffic fetch error:', err);
    }
  };

  fetchTraffic();

  const interval = setInterval(fetchTraffic, 3000);

  return () => clearInterval(interval);

}, []);

  // Lấy vị trí hiện tại bằng GPS
useEffect(() => {
  if (!navigator.geolocation) {
    alert('Trình duyệt không hỗ trợ GPS');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setCurrentLocation({ lat, lng });

      // Di chuyển map đến vị trí hiện tại
      if (mapRef.current) {
        mapRef.current.flyTo([lat, lng], 15);

        // Icon GPS
        const userIcon = L.divIcon({
          className: 'user-location-icon',
          html: `
            <div class="relative">
              <div class="w-5 h-5 bg-blue-500 rounded-full border-4 border-white shadow-lg"></div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        // Marker vị trí hiện tại
        L.marker([lat, lng], { icon: userIcon })
          .addTo(mapRef.current)
          .bindPopup('📍 Bạn đang ở đây')
          .openPopup();
      }
    },
    (error) => {
      console.error('Lỗi GPS:', error);
      alert('Không thể lấy vị trí hiện tại');
    },
    {
      enableHighAccuracy: true
    }
  );
}, []);

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
  if (!mapRef.current) return;

  clearMarker();

  const customIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="relative">
        <div class="relative flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg border-2 border-white">
          <span class="text-white text-sm">📍</span>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });

  markerRef.current = L.marker([lat, lng], { icon: customIcon });

  markerRef.current
    .addTo(mapRef.current)
    .bindPopup(name)
    .openPopup();
};

const TIME_WEIGHT = 1;
const TRAFFIC_WEIGHT = 2;

const score = (duration, trafficCost) => {
  return duration * TIME_WEIGHT + trafficCost * TRAFFIC_WEIGHT;
};

  // Tính route
const calculateRoute = async (startLat, startLng, endLat, endLng) => {
  const profile = profileMap[transport];

  try {
    const avoidAreas = buildAvoidAreas();

    const baseUrl = `https://router.hereapi.com/v8/routes
?transportMode=${profile}
&origin=${startLat},${startLng}
&destination=${endLat},${endLng}
&return=polyline,summary
&traffic=enabled
${avoidAreas ? `&avoid[areas]=${avoidAreas}` : ''}
&apikey=${HERE_API_KEY}`;

    const baseRes = await fetch(baseUrl);
    const baseData = await baseRes.json();

    if (!baseData.routes || baseData.routes.length === 0) {
      throw new Error('No route found');
    }

    const baseSection = baseData.routes[0].sections[0];
    const baseCoords = decode(baseSection.polyline).polyline.map(p => [p[0], p[1]]);
    const baseDistance = baseSection.summary.length / 1000;
    const baseDuration = baseSection.summary.duration / 60;

    let bestCoords = baseCoords;
    let bestDistance = baseDistance;
    let bestDuration = baseDuration;

    // 🔥 THÊM ĐOẠN NÀY
    if (isRoutePassingCongestion(baseCoords)) {
      console.log("❌ BASE route bị tắc → bỏ");
      bestDuration = Infinity; // ép chọn route khác
    }

    // 🔥 Smart routing vẫn giữ
    if (smartRouting) {
      const altUrl = `https://router.hereapi.com/v8/routes
?transportMode=${profile}
&origin=${startLat},${startLng}
&destination=${endLat},${endLng}
&return=polyline,summary
&alternatives=5
&traffic=enabled
${avoidAreas ? `&avoid[areas]=${avoidAreas}` : ''}
&apikey=${HERE_API_KEY}`;

      const altRes = await fetch(altUrl);
      const altData = await altRes.json();

      if (altData.routes && altData.routes.length > 1) {
        for (let i = 1; i < altData.routes.length; i++) {
        const altSection = altData.routes[i].sections[0];
        const altCoords = decode(altSection.polyline).polyline.map(p => [p[0], p[1]]);
        const altDistance = altSection.summary.length / 1000;
        const altDuration = altSection.summary.duration / 60;

        // 🔥 BỎ route nếu đi qua tắc
        if (isRoutePassingCongestion(altCoords)) {
          console.log("❌ bỏ route tắc");
          continue;
        }

        const isBetter =
          altDistance <= baseDistance + 7 &&
          altDuration <= baseDuration + 3;

        if (isBetter && altDuration < bestDuration) {
          console.log("✅ chọn route này");
          bestCoords = altCoords;
          bestDistance = altDistance;
          bestDuration = altDuration;
        }
      }
      }
    }

    setRoutePoints(bestCoords);
    detectVisibleTrafficLines(bestCoords);

    setRouteInfo({
      distance: bestDistance.toFixed(2),
      duration: Math.round(bestDuration)
    });

    if (mapRef.current && bestCoords.length > 0) {
      const bounds = L.latLngBounds(bestCoords);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

  } catch (error) {
    console.error('HERE Route Error:', error);
    alert('Không thể tính đường đi');
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
    // Dùng GPS hiện tại làm điểm bắt đầu
    if (currentLocation) {
      calculateRoute(
        currentLocation.lat,
        currentLocation.lng,
        lat,
        lng
      );
    } else {
      alert('Chưa lấy được vị trí hiện tại!');
    }
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
    setVisibleTrafficLines([]);

    if (draggableMarker) {
    draggableMarker.remove();
    setDraggableMarker(null);
    }
    
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
    <div className="relative h-full w-full overflow-hidden">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={14}
        style={{ height: '100vh', width: '100%' }}
        whenCreated={(map) => (mapRef.current = map)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap contributors'
        />
        <ZoomControl position="bottomright" />
        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lng]}>
            <Popup>📍 Bạn đang ở đây</Popup>
          </Marker>
        )}
        
        {routePoints.length > 0 && (
          <Polyline
            positions={routePoints}
            color={routeColors[transport]}
            weight={6}
            opacity={0.8}
          />
        )}


  {Object.entries(roadSegments)
  .filter(([cameraKey]) =>
    visibleTrafficLines.includes(cameraKey)
  )
  .map(([cameraKey, positions]) => {

    const traffic = trafficData[cameraKey]?.traffic;

    return (
      <Polyline
        key={cameraKey}
        positions={positions}
        pathOptions={{
          color: getTrafficColor(traffic),
          weight: 10,
          opacity: 0.8
        }}
      />
    );
  })}

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


        <div className="absolute top-20 right-4 z-[1000]">
    <button
      onClick={() => setSmartRouting(!smartRouting)}
      className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-lg ${
        smartRouting
          ? 'bg-green-500 text-white'
          : 'bg-gray-200 text-gray-700'
      }`}
    >
      🧠 Smart Route {smartRouting ? 'ON' : 'OFF'}
    </button>
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