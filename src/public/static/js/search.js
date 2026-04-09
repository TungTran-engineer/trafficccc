// search.js - Toàn bộ logic tìm kiếm, gợi ý, hiển thị địa điểm và route
// DÙNG OPENROUTESERVICE (ORS) - QUAY LẠI PHIÊN BẢN CŨ

var searchTimeout = null;

// Tọa độ trung tâm thành phố
const CITY_CENTER = [16.070, 108.222];
const CITY_BOUNDS = {
    minLat: 16.00, maxLat: 16.15,
    minLon: 108.15, maxLon: 108.30
};

// =============================================
// PHẦN 1: Chọn phương tiện di chuyển
// =============================================
let currentProfile = "cycling-regular";  // Mặc định xe máy

const profileMap = {
    "motorcycle": "cycling-regular",
    "car": "driving-car",
    "walking": "foot-walking"
};

// Lắng nghe thay đổi phương tiện
document.addEventListener('DOMContentLoaded', () => {
    const radios = document.querySelectorAll('input[name="transport"]');
    const btnCar = document.getElementById('btnCar');
    const btnBike = document.getElementById('btnBike');
    const btnFoot = document.getElementById('btnFoot');
    
    function syncActiveButton(value) {
        if (btnCar) btnCar.classList.remove('active');
        if (btnBike) btnBike.classList.remove('active');
        if (btnFoot) btnFoot.classList.remove('active');
        
        if (value === 'car' && btnCar) btnCar.classList.add('active');
        else if (value === 'motorcycle' && btnBike) btnBike.classList.add('active');
        else if (value === 'walking' && btnFoot) btnFoot.classList.add('active');
    }
    
    function handleTransportChange(value) {
        const radioToCheck = document.querySelector(`input[name="transport"][value="${value}"]`);
        if (radioToCheck) radioToCheck.checked = true;
        
        currentProfile = profileMap[value] || "cycling-regular";
        console.log("Chuyển phương tiện:", value, "→", currentProfile);
        
        syncActiveButton(value);
        
        if (destinationMarker && userLocation) {
            const end = destinationMarker.getLatLng();
            calculateAndDrawRoute(userLocation, [end.lat, end.lng]);
        }
    }
    
    const defaultChecked = document.querySelector('input[name="transport"]:checked');
    if (defaultChecked) {
        currentProfile = profileMap[defaultChecked.value] || "cycling-regular";
        syncActiveButton(defaultChecked.value);
    }
    
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => handleTransportChange(e.target.value));
    });
    
    if (btnCar) btnCar.addEventListener('click', () => handleTransportChange('car'));
    if (btnBike) btnBike.addEventListener('click', () => handleTransportChange('motorcycle'));
    if (btnFoot) btnFoot.addEventListener('click', () => handleTransportChange('walking'));
});

// =============================================
// PHẦN 2: Kiểm tra và xử lý tên đường
// =============================================

// Kiểm tra query có phải là tên đường không
function isRoadNameQuery(query) {
    if (!query) return false;
    var q = query.toLowerCase().trim();
    
    // Nếu có số nhà -> là địa chỉ cụ thể
    if (/\d/.test(q)) return false;
    
    // Các từ khóa thường gặp trong tên đường
    const roadKeywords = [
        'đường', 'duong', 'phố', 'pho', 'đại lộ', 'dai lo',
        'nguyễn', 'phan', 'trần', 'lê', 'võ', 'hồ', 'lý',
        'quốc lộ', 'quoc lo', 'tỉnh lộ', 'tinh lo',
        'ngô', 'bạch', 'đằng', 'phú', 'châu', 'trinh',
        'hùng vương', 'điện biên phủ', 'nguyễn hữu thọ',
        'cách mạng tháng 8', '2 tháng 9', '3 tháng 2',
        'bạch đằng', 'phan châu trinh', 'lê duẩn', 'quang trung',
        'lý tự trọng', 'trần phú', 'hải phòng', 'đống đa'
    ];
    
    for (let keyword of roadKeywords) {
        if (q.includes(keyword)) return true;
    }
    
    return false;
}

// Tìm điểm gần nhất trên đường (dùng Nominatim)
async function findClosestPointOnRoad(roadName, userLat, userLon) {
    try {
        const searchQuery = `${roadName}, Đà Nẵng, Việt Nam`;
        console.log(`🔍 Tìm đường: ${searchQuery}`);
        
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
        
        // Tính khoảng cách và chọn điểm gần nhất
        const roadsWithDetails = data.map(road => ({
            ...road,
            lat: parseFloat(road.lat),
            lon: parseFloat(road.lon),
            distToUser: calculateDistance(userLat, userLon, parseFloat(road.lat), parseFloat(road.lon)),
            displayName: road.display_name
        }));
        
        roadsWithDetails.sort((a, b) => a.distToUser - b.distToUser);
        const bestRoad = roadsWithDetails[0];
        
        return {
            lat: bestRoad.lat,
            lon: bestRoad.lon,
            name: bestRoad.display_name.split(',')[0],
            display_name: bestRoad.display_name,
            distToUser: bestRoad.distToUser
        };
        
    } catch (err) {
        console.error('❌ Lỗi tìm điểm trên đường:', err);
        return null;
    }
}

// =============================================
// PHẦN 3: Hiển thị địa điểm
// =============================================

async function showApiPlace(place, query) {
    let targetLat = parseFloat(place.lat);
    let targetLon = parseFloat(place.lon);
    let displayName = place.display_name || query;
    
    console.log(`📍 Hiển thị: ${displayName} tại [${targetLat}, ${targetLon}]`);
    
    var pt = [targetLat, targetLon];
    if (destinationMarker) map.removeLayer(destinationMarker);
    
    destinationMarker = L.marker(pt, {
        icon: L.icon({
            iconUrl: 'https://maps.google.com/mapfiles/ms/micons/red-dot.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        })
    }).addTo(map);
    
    if (userLocation) {
        await calculateAndDrawRoute(userLocation, pt);
    } else {
        map.flyTo(pt, 16);
    }
    
    var shortName = displayName.split(',')[0];
    document.getElementById('infoTitle').textContent = shortName;
    document.getElementById('placeName').textContent = shortName;
    document.getElementById('placeAddress').textContent = displayName;
    
    var dist = userLocation ? calculateDistance(userLocation[0], userLocation[1], targetLat, targetLon).toFixed(2) : null;
    document.getElementById('placeCoords').textContent = `Tọa độ: ${targetLat.toFixed(6)}, ${targetLon.toFixed(6)}` + (dist ? ` (cách bạn ${dist} km)` : '');
    
    document.getElementById('placeDetails').style.display = 'none';
    document.getElementById('infoPanel').style.display = 'block';
}

// =============================================
// PHẦN 4: TÍNH ROUTE VỚI OPENROUTESERVICE
// =============================================

async function calculateAndDrawRoute(start, end) {
    const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImJhZmMzZTc1ZWM2YjRiZjA4ZDRkMDA3YTM5ZTNlYzg1IiwiaCI6Im11cm11cjY0In0=";
    const profile = currentProfile;
    
    console.log("🚗 Tính route với ORS - Profile:", profile);
    
    // Style cho từng loại xe
    const routeStyles = {
        "cycling-regular": { color: "#ff6b6b", weight: 8, opacity: 0.92 },
        "driving-car": { color: "#3388ff", weight: 8, opacity: 0.90 },
        "foot-walking": { color: "#4ecdc4", weight: 6, opacity: 0.85, dashArray: "5,10" }
    };
    
    const style = routeStyles[profile] || { color: "#3388ff", weight: 8, opacity: 0.9 };
    
    try {
        const res = await fetch(
            `https://api.openrouteservice.org/v2/directions/${profile}/geojson`,
            {
                method: "POST",
                headers: {
                    "Authorization": apiKey,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    coordinates: [
                        [start[1], start[0]],
                        [end[1], end[0]]
                    ],
                    instructions: true,
                    preference: "recommended" // recommended, shortest, fastest
                })
            }
        );
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error("ORS Error:", errorText);
            throw new Error(`ORS lỗi ${res.status}`);
        }
        
        const data = await res.json();
        
        if (!data.features || data.features.length === 0) {
            alert("Không tìm thấy đường đi phù hợp!");
            return;
        }
        
        let coords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
        
        const summary = data.features[0].properties.summary;
        console.log("✅ Tìm thấy route:", {
            distance: (summary.distance / 1000).toFixed(2) + "km",
            duration: Math.round(summary.duration / 60) + "phút"
        });
        
        if (routeLine) map.removeLayer(routeLine);
        routeLine = L.polyline(coords, style).addTo(map);
        map.fitBounds(routeLine.getBounds(), { padding: [60, 60] });
        
        const distKm = (summary.distance / 1000).toFixed(2);
        const timeMin = Math.round(summary.duration / 60);
        
        document.getElementById("routeDistance").textContent = `Khoảng cách: ${distKm} km`;
        document.getElementById("routeDuration").textContent = `Thời gian: ${timeMin} phút`;
        
        const methodText = {
            "cycling-regular": "Xe máy",
            "driving-car": "Ô tô",
            "foot-walking": "Đi bộ"
        };
        document.getElementById("routeMethod").textContent = methodText[profile] || profile;
        document.getElementById("routeInfo").style.display = "block";
        
    } catch (err) {
        console.error("❌ Lỗi routing:", err);
        alert(`Không tính được đường đi! Lỗi: ${err.message}`);
    }
}

// =============================================
// PHẦN 5: Xử lý tìm kiếm đường
// =============================================

// =============================================
// PHẦN 5: Xử lý tìm kiếm đường
// =============================================

async function handleRoadSearch(query) {
    if (!userLocation) {
        alert('Vui lòng bật định vị để tìm điểm gần nhất trên đường!');
        return;
    }
    
    var searchBtn = document.getElementById('searchBtn');
    var originalText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<span class="loading"></span> Đang tìm điểm gần nhất...';
    searchBtn.disabled = true;
    
    try {
        // THÊM 2 DÒNG NÀY - HIỆN ĐƯỜNG NẾU CÓ TRONG DANH SÁCH
        const roadId = typeof getRoadIdFromQuery === 'function' ? getRoadIdFromQuery(query) : null;
        if (roadId && typeof showRoad === 'function') {
            showRoad(roadId);
        }
        
        const closestPoint = await findClosestPointOnRoad(query, userLocation[0], userLocation[1]);
        
        if (closestPoint) {
            const place = {
                lat: closestPoint.lat,
                lon: closestPoint.lon,
                display_name: closestPoint.display_name || `${query}, Đà Nẵng`
            };
            
            await showApiPlace(place, query);
        } else {
            alert(`Không tìm thấy đường "${query}" trong khu vực Đà Nẵng!`);
        }
    } catch (err) {
        console.error('❌ Lỗi xử lý tìm đường:', err);
        alert('Lỗi khi tìm điểm trên đường: ' + err.message);
    } finally {
        searchBtn.innerHTML = originalText;
        searchBtn.disabled = false;
    }
}

// =============================================
// PHẦN 6: Tìm kiếm chính
// =============================================

function performSearch() {
    var input = document.getElementById('searchInput');
    var query = input.value.trim();
    if (!query) return;
    
    console.log(`🔍 Tìm kiếm: "${query}"`);
    
    // Kiểm tra vị trí user
    if (!userLocation) {
        if (confirm('Bạn chưa bật định vị. Có muốn bật định vị để tìm đường gần nhất không?')) {
            getUserLocation();
        }
    }
    
    // Nếu là tên đường, xử lý đặc biệt
    if (isRoadNameQuery(query)) {
        handleRoadSearch(query);
        return;
    }
    
    // Tìm kiếm địa điểm bình thường
    var searchBtn = document.getElementById('searchBtn');
    var originalText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<span class="loading"></span> Đang tìm...';
    searchBtn.disabled = true;
    
    var searchQuery = query;
    if (!query.toLowerCase().includes('đà nẵng') && !query.toLowerCase().includes('da nang')) {
        searchQuery = query + ', Đà Nẵng, Việt Nam';
    }
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=15&addressdetails=1`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'AI-Traffic-Monitoring-App' }
    })
        .then(res => res.json())
        .then(async data => {
            if (!data || data.length === 0) {
                alert('Không tìm thấy địa điểm nào!');
                return;
            }
            
            var results = data.map(item => ({
                ...item,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                distance: userLocation ? calculateDistance(userLocation[0], userLocation[1], parseFloat(item.lat), parseFloat(item.lon)) : Infinity
            }));
            
            var danang = results.filter(r => 
                r.display_name.toLowerCase().includes('đà nẵng') || 
                r.display_name.toLowerCase().includes('da nang')
            );
            
            var candidates = danang.length > 0 ? danang : results;
            candidates.sort((a, b) => a.distance - b.distance);
            
            await showApiPlace(candidates[0], query);
        })
        .catch(err => {
            console.error('❌ Lỗi tìm kiếm:', err);
            alert('Lỗi kết nối, vui lòng thử lại!');
        })
        .finally(() => {
            searchBtn.innerHTML = originalText;
            searchBtn.disabled = false;
        });
}

// =============================================
// PHẦN 7: Gợi ý khi gõ
// =============================================

function handleSearchInput() {
    var input = document.getElementById('searchInput');
    var query = input.value.trim().toLowerCase();
    var sb = document.getElementById('suggestions');
    var clearBtn = document.getElementById('clearBtn');
    
    if (clearBtn) clearBtn.style.display = query ? 'inline-block' : 'none';
    
    if (searchTimeout) clearTimeout(searchTimeout);
    if (query.length < 2) { 
        if (sb) sb.style.display = 'none'; 
        return; 
    }
    
    if (sb) {
        sb.innerHTML = '<div class="suggestion-item" style="color:#666;">Đang tìm...</div>';
        sb.style.display = 'block';
    }
    
    searchTimeout = setTimeout(() => {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Đà Nẵng')}&limit=8&addressdetails=1`, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'AI-Traffic-Monitoring-App' }
        })
            .then(res => res.json())
            .then(apiData => {
                if (!sb) return;
                sb.innerHTML = '';
                
                if (apiData.length === 0) {
                    sb.innerHTML = '<div class="suggestion-item" style="color:#666;">Không tìm thấy</div>';
                    return;
                }
                
                const apiWithDistance = apiData.map(place => {
                    const lat = parseFloat(place.lat);
                    const lon = parseFloat(place.lon);
                    return {
                        ...place,
                        lat,
                        lon,
                        distance: userLocation ? calculateDistance(userLocation[0], userLocation[1], lat, lon) : Infinity
                    };
                });
                
                apiWithDistance.sort((a, b) => a.distance - b.distance);
                
                apiWithDistance.forEach(place => {
                    var dist = place.distance !== Infinity ? place.distance.toFixed(1) : null;
                    var distHtml = dist ? `<span class="distance-badge">${dist}km</span>` : '';
                    var shortName = place.display_name.split(',')[0];
                    
                    var item = document.createElement('div');
                    item.className = 'suggestion-item';
                    item.innerHTML = `<div class="suggestion-title">${shortName} ${distHtml}</div>
                                   <div class="suggestion-address">${place.display_name.substring(0, 80)}...</div>`;
                    
                    item.onclick = () => {
                        input.value = place.display_name;
                        sb.style.display = 'none';
                        
                        if (isRoadNameQuery(shortName)) {
                            handleRoadSearch(shortName);
                        } else {
                            showApiPlace({ 
                                lat: place.lat, 
                                lon: place.lon, 
                                display_name: place.display_name 
                            }, place.display_name);
                        }
                    };
                    
                    sb.appendChild(item);
                });
            })
            .catch(err => {
                console.error('❌ Lỗi gợi ý:', err);
                if (sb) {
                    sb.innerHTML = '<div class="suggestion-item" style="color:#666;">Lỗi kết nối API</div>';
                }
            });
    }, 400);
}

// =============================================
// PHẦN 8: Xóa tìm kiếm
// =============================================

function clearSearch() {
    var input = document.getElementById('searchInput');
    if (input) input.value = '';
    
    var clearBtn = document.getElementById('clearBtn');
    if (clearBtn) clearBtn.style.display = 'none';
    
    var sb = document.getElementById('suggestions');
    if (sb) sb.style.display = 'none';
    
    if (destinationMarker) {
        map.removeLayer(destinationMarker);
        destinationMarker = null;
    }
    
    if (routeLine) {
        map.removeLayer(routeLine);
        routeLine = null;
    }
    
    var routeInfo = document.getElementById('routeInfo');
    if (routeInfo) routeInfo.style.display = 'none';
    
    var infoPanel = document.getElementById('infoPanel');
    if (infoPanel) infoPanel.style.display = 'none';
}

// =============================================
// PHẦN 9: Khởi tạo sự kiện
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 search.js đã sẵn sàng với OpenRouteService");
    
    var inp = document.getElementById('searchInput');
    if (inp) inp.addEventListener('input', handleSearchInput);
    
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearSearch);
    
    const infoClose = document.getElementById('infoClose');
    if (infoClose) {
        infoClose.addEventListener('click', () => {
            const infoPanel = document.getElementById('infoPanel');
            if (infoPanel) infoPanel.style.display = 'none';
        });
    }
    
    if (inp) {
        inp.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }
    
    document.addEventListener('click', e => {
        const searchBox = document.getElementById('searchBox');
        const suggestions = document.getElementById('suggestions');
        if (searchBox && suggestions && !searchBox.contains(e.target)) {
            suggestions.style.display = 'none';
        }
    });
});

// =============================================
// PHẦN 8: Xóa tìm kiếm
// =============================================

function clearSearch() {
    var input = document.getElementById('searchInput');
    if (input) input.value = '';
    
    var clearBtn = document.getElementById('clearBtn');
    if (clearBtn) clearBtn.style.display = 'none';
    
    var sb = document.getElementById('suggestions');
    if (sb) sb.style.display = 'none';
    
    // === THÊM DÒNG NÀY ĐỂ ẨN ĐƯỜNG ===
    if (typeof hideAllRoads === 'function') {
        hideAllRoads();
    }
    
    if (destinationMarker) {
        map.removeLayer(destinationMarker);
        destinationMarker = null;
    }
    
    if (routeLine) {
        map.removeLayer(routeLine);
        routeLine = null;
    }
    
    var routeInfo = document.getElementById('routeInfo');
    if (routeInfo) routeInfo.style.display = 'none';
    
    var infoPanel = document.getElementById('infoPanel');
    if (infoPanel) infoPanel.style.display = 'none';
}