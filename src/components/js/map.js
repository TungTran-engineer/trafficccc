// static/js/map.js - Khởi tạo bản đồ và vẽ các tuyến đường

// Khởi tạo map với options ổn định
var map = L.map('map', {
    center: [16.063, 108.215],
    zoom: 14,
    zoomControl: true,
    fadeAnimation: true,
    zoomAnimation: true,
    markerZoomAnimation: true,
    inertia: false,
    inertiaDeceleration: 0,
    easeLinearity: 0
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    keepBuffer: 4,
    updateWhenIdle: true,
    updateWhenZooming: false
}).addTo(map);

// Object lưu tất cả các đường polyline
var roadLines = {};

// Định nghĩa màu mặc định cho từng đường
const roadDefaultColors = {
    'nguyen_van_linh': '#3388ff',
    'hoang_dieu': '#33cc33',
    'le_duan': '#ff9900',
    'nguyen_tri_phuong': '#9900cc'
};

// === VẼ CÁC ĐƯỜNG (MẶC ĐỊNH ẨN HẾT) ===

// Vẽ đường Nguyễn Văn Linh
roadLines.nguyen_van_linh = L.polyline(nvlPoints, {
    color: roadDefaultColors.nguyen_van_linh,
    weight: 6,
    opacity: 0,  // Ẩn mặc định
    smoothFactor: 1,
    noClip: true
}).addTo(map);

// Vẽ đường Hoàng Diệu
roadLines.hoang_dieu = L.polyline(hoangDieuPoints, {
    color: roadDefaultColors.hoang_dieu,
    weight: 5,
    opacity: 0,  // Ẩn mặc định
    smoothFactor: 1,
    noClip: true
}).addTo(map);

// Vẽ đường Lê Duẩn
roadLines.le_duan = L.polyline(leDuanPoints, {
    color: roadDefaultColors.le_duan,
    weight: 5,
    opacity: 0,  // Ẩn mặc định
    smoothFactor: 1,
    noClip: true
}).addTo(map);

// Vẽ đường Nguyễn Tri Phương
roadLines.nguyen_tri_phuong = L.polyline(nguyenTriPhuongPoints, {
    color: roadDefaultColors.nguyen_tri_phuong,
    weight: 5,
    opacity: 0,  // Ẩn mặc định
    smoothFactor: 1,
    noClip: true
}).addTo(map);

// Thêm tooltip cho các đường
roadLines.nguyen_van_linh.bindTooltip("Đường Nguyễn Văn Linh", { 
    permanent: false, 
    direction: 'top',
    sticky: true
});

roadLines.hoang_dieu.bindTooltip("Đường Hoàng Diệu", { 
    permanent: false, 
    direction: 'top',
    sticky: true
});

roadLines.le_duan.bindTooltip("Đường Lê Duẩn", { 
    permanent: false, 
    direction: 'top',
    sticky: true
});

roadLines.nguyen_tri_phuong.bindTooltip("Đường Nguyễn Tri Phương", { 
    permanent: false, 
    direction: 'top',
    sticky: true
});

// =============================================
// HÀM QUẢN LÝ HIỂN THỊ ĐƯỜNG
// =============================================

// Ẩn tất cả các đường
function hideAllRoads() {
    for (let id in roadLines) {
        roadLines[id].setStyle({ 
            opacity: 0, 
            weight: 0 
        });
    }
    console.log("🚫 Đã ẩn tất cả đường");
}

// Hiện một đường cụ thể
function showRoad(roadId) {
    if (!roadLines[roadId]) return false;
    
    // Ẩn tất cả trước
    hideAllRoads();
    
    // Hiện đường được chọn
    let weight = 6;
    if (roadId === 'hoang_dieu' || roadId === 'le_duan' || roadId === 'nguyen_tri_phuong') {
        weight = 5;
    }
    
    roadLines[roadId].setStyle({ 
        color: roadDefaultColors[roadId],
        weight: weight, 
        opacity: 0.9 
    });
    
    // Bay đến đường đó
    switch(roadId) {
        case 'nguyen_van_linh':
            map.flyTo(nvlCenter, 15, { duration: 1 });
            break;
        case 'hoang_dieu':
            map.flyTo(hoangDieuCenter, 15, { duration: 1 });
            break;
        case 'le_duan':
            map.flyTo(leDuanCenter, 15, { duration: 1 });
            break;
        case 'nguyen_tri_phuong':
            map.flyTo(nguyenTriPhuongCenter, 15, { duration: 1 });
            break;
    }
    
    console.log(`🛣️ Đã hiện đường: ${roadId}`);
    return true;
}

// =============================================
// HÀM CẬP NHẬT MÀU ĐƯỜNG THEO GIAO THÔNG
// =============================================

function updateRoadColor(roadId, trafficState) {
    if (!roadLines[roadId]) {
        console.warn(`Không tìm thấy đường: ${roadId}`);
        return;
    }
    
    // Chỉ cập nhật nếu đường đang hiện
    if (roadLines[roadId].options.opacity === 0) return;
    
    let color;
    let weight;
    
    const state = String(trafficState).toUpperCase().trim();
    
    switch(state) {
        case 'THÔNG THOÁNG':
        case 'THONG THOANG':
            color = '#28a745'; // Xanh lá
            weight = 5;
            break;
        case 'ĐÔNG':
        case 'DONG':
            color = '#fd7e14'; // Cam
            weight = 7;
            break;
        case 'TẮC NGHẼN':
        case 'TAC NGHEN':
            color = '#dc3545'; // Đỏ
            weight = 8;
            break;
        default:
            color = roadDefaultColors[roadId];
            weight = roadId === 'nguyen_van_linh' ? 6 : 5;
    }
    
    roadLines[roadId].setStyle({
        color: color,
        weight: weight,
        opacity: 0.9
    });
    
    console.log(`🛣️ Đã cập nhật màu ${roadId} → ${state}`);
}

// =============================================
// XỬ LÝ VỊ TRÍ NGƯỜI DÙNG
// =============================================

var userLocation = null;
var userMarker = null;
var destinationMarker = null;
var routeLine = null;

var locationInitialized = false;

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                userLocation = [position.coords.latitude, position.coords.longitude];
                
                if (userMarker) {
                    map.removeLayer(userMarker);
                }
                
                userMarker = L.marker(userLocation, {
                    icon: L.icon({
                        iconUrl: 'https://maps.google.com/mapfiles/ms/micons/blue-dot.png',
                        iconSize: [32, 32],
                        iconAnchor: [16, 32]
                    }),
                    keyboard: false,
                    title: 'Vị trí của bạn'
                }).addTo(map).bindPopup('Vị trí của bạn');
                
                if (!locationInitialized) {
                    map.setView(userLocation, 15, {
                        animate: false,
                        duration: 0
                    });
                    locationInitialized = true;
                }
                
                console.log("📍 Đã lấy vị trí:", userLocation);
            },
            error => {
                console.error('Lỗi lấy vị trí:', error);
                locationInitialized = true;
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    } else {
        console.warn('Trình duyệt không hỗ trợ định vị!');
        locationInitialized = true;
    }
}

function flyToUserLocation() {
    if (userLocation) {
        map.flyTo(userLocation, 16, {
            duration: 1,
            easeLinearity: 0.25
        });
    } else {
        alert('Chưa có vị trí của bạn!');
    }
}

// =============================================
// KHỞI TẠO
// =============================================

// Đảm bảo ẩn hết đường sau khi vẽ
setTimeout(() => {
    hideAllRoads();
    console.log("✅ Map đã sẵn sàng, các đường đã ẩn");
}, 100);

// Lấy vị trí người dùng
setTimeout(() => {
    getUserLocation();
}, 500);

// Lưu view cuối cùng
var lastView = {
    center: [16.063, 108.215],
    zoom: 14
};

map.on('moveend', function() {
    lastView.center = map.getCenter();
    lastView.zoom = map.getZoom();
});

// =============================================
// EXPORT FUNCTIONS
// =============================================

window.roadLines = roadLines;
window.roadDefaultColors = roadDefaultColors;
window.hideAllRoads = hideAllRoads;
window.showRoad = showRoad;
window.updateRoadColor = updateRoadColor;
window.flyToUserLocation = flyToUserLocation;
window.userLocation = userLocation;
window.destinationMarker = destinationMarker;
window.routeLine = routeLine;