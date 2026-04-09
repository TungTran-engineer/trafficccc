// static/js/traffic.js - Cập nhật dữ liệu giao thông cho HTML và màu đường (ĐÃ TỐI ƯU)

// Danh sách tên camera
const cameraList = [
    "Camera 1 - Nguyễn Văn Linh",
    "Camera 2 - Hoàng Diệu",
    "Camera 3 - Nguyễn Tri Phương",
    "Camera 4 - Lê Duẩn"
];

// Cache DOM elements để tránh query nhiều lần
const domCache = {
    cars: [],
    motos: [],
    traffic: [],
    total: []
};

// Khởi tạo cache DOM
function initDOMCache() {
    for (let i = 0; i < 4; i++) {
        const prefix = `cam${i + 1}`;
        domCache.cars[i] = document.getElementById(`${prefix}-cars`);
        domCache.motos[i] = document.getElementById(`${prefix}-motos`);
        domCache.traffic[i] = document.getElementById(`${prefix}-traffic`);
        domCache.total[i] = document.getElementById(`${prefix}-total`);
    }
}

// Ánh xạ camera sang đường
const cameraToRoad = {
    "Camera 1 - Nguyễn Văn Linh": "nguyen_van_linh",
    "Camera 2 - Hoàng Diệu": "hoang_dieu",
    "Camera 3 - Nguyễn Tri Phương": "nguyen_tri_phuong",
    "Camera 4 - Lê Duẩn": "le_duan",
    
    // Tên cũ từ backend
    "Camera 1 - Giao lộ Nguyễn Văn Linh": "nguyen_van_linh",
    "Camera 2 - Cầu Rồng": "le_duan",
    "Camera 3 - Phạm Văn Đồng": "hoang_dieu",
    "Camera 4 - Bạch Đằng": "nguyen_tri_phuong"
};

// Màu sắc cho trạng thái (dùng Map cho tốc độ cao hơn)
const trafficColorMap = new Map([
    ['THÔNG THOÁNG', '#28a745'],
    ['THONG THOANG', '#28a745'],
    ['ĐÔNG', '#fd7e14'],
    ['DONG', '#fd7e14'],
    ['TẮC NGHẼN', '#dc3545'],
    ['TAC NGHEN', '#dc3545']
]);

function getTrafficColor(state) {
    if (!state) return '#6c757d';
    const s = String(state).toUpperCase().trim();
    return trafficColorMap.get(s) || '#6c757d';
}

// Cập nhật HTML cho từng camera - dùng cache
function updateCameraHTML(data, index) {
    // Cập nhật số lượng ô tô
    if (domCache.cars[index]) {
        domCache.cars[index].textContent = data.cars || 0;
    }
    
    // Cập nhật số lượng xe máy
    if (domCache.motos[index]) {
        domCache.motos[index].textContent = data.motorcycles || 0;
    }
    
    // Cập nhật trạng thái giao thông
    if (domCache.traffic[index]) {
        const trafficText = data.traffic || 'UNKNOWN';
        domCache.traffic[index].textContent = trafficText;
        domCache.traffic[index].style.color = getTrafficColor(trafficText);
    }
    
    // Cập nhật tổng số xe
    if (domCache.total[index]) {
        const total = (data.cars || 0) + (data.motorcycles || 0);
        domCache.total[index].textContent = total;
    }
}

// Cập nhật màu đường - chỉ gọi khi cần
let lastRoadUpdate = 0;
const ROAD_UPDATE_INTERVAL = 2000; // 2 giây

function updateRoadColorsFromTraffic(allData) {
    if (typeof updateRoadColor !== 'function') return;
    
    // Giới hạn tần suất cập nhật đường
    const now = Date.now();
    if (now - lastRoadUpdate < ROAD_UPDATE_INTERVAL) return;
    lastRoadUpdate = now;
    
    for (let cameraName in allData) {
        const roadId = cameraToRoad[cameraName];
        if (!roadId) continue;
        
        const trafficState = allData[cameraName]?.traffic || 'UNKNOWN';
        updateRoadColor(roadId, trafficState);
    }
}

// Cache dữ liệu cũ để so sánh
let previousData = null;

// Kiểm tra dữ liệu có thay đổi không
function hasDataChanged(newData) {
    if (!previousData) return true;
    
    for (let i = 0; i < cameraList.length; i++) {
        const camName = cameraList[i];
        const oldCam = previousData[camName];
        const newCam = newData[camName];
        
        if (!oldCam || !newCam) return true;
        
        if (oldCam.cars !== newCam.cars || 
            oldCam.motorcycles !== newCam.motorcycles || 
            oldCam.traffic !== newCam.traffic) {
            return true;
        }
    }
    return false;
}

// Cập nhật traffic chính
async function updateTraffic() {
    try {
        const res = await fetch('/traffic');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const allData = await res.json();
        
        // Chỉ cập nhật nếu dữ liệu thay đổi
        if (!hasDataChanged(allData)) {
            return; // Không thay đổi thì bỏ qua
        }
        
        // Cập nhật HTML cho từng camera
        for (let i = 0; i < cameraList.length; i++) {
            const camName = cameraList[i];
            let data = allData[camName];
            
            // Thử với tên cũ nếu không có
            if (!data) {
                const oldNames = [
                    "Camera 1 - Giao lộ Nguyễn Văn Linh",
                    "Camera 2 - Cầu Rồng", 
                    "Camera 3 - Phạm Văn Đồng",
                    "Camera 4 - Bạch Đằng"
                ];
                data = allData[oldNames[i]];
            }
            
            updateCameraHTML(data || { cars: 0, motorcycles: 0, traffic: 'UNKNOWN' }, i);
        }
        
        // Cập nhật màu đường
        updateRoadColorsFromTraffic(allData);
        
        // Lưu cache
        previousData = allData;
        
    } catch (err) {
        console.error('❌ Lỗi traffic:', err);
        
        // Fallback - chỉ chạy 1 lần nếu không có dữ liệu
        if (!previousData) {
            fallbackRandomData();
        }
    }
}

// Fallback dữ liệu random - chỉ chạy 1 lần
let fallbackRan = false;

function fallbackRandomData() {
    if (fallbackRan) return;
    fallbackRan = true;
    
    console.log('🎲 Dùng dữ liệu random');
    
    const mockData = {};
    
    for (let i = 0; i < cameraList.length; i++) {
        const camName = cameraList[i];
        
        const cars = Math.floor(Math.random() * 30) + 5;
        const motorcycles = Math.floor(Math.random() * 80) + 20;
        const states = ['THÔNG THOÁNG', 'ĐÔNG', 'TẮC NGHẼN'];
        const randomState = states[Math.floor(Math.random() * 3)];
        
        updateCameraHTML({ cars, motorcycles, traffic: randomState }, i);
        mockData[camName] = { traffic: randomState };
    }
    
    updateRoadColorsFromTraffic(mockData);
}

// Gửi dữ liệu test - debounce để tránh spam
let testDataTimeout;
function sendTestData() {
    if (testDataTimeout) clearTimeout(testDataTimeout);
    
    testDataTimeout = setTimeout(() => {
        const testData = {
            camera: "Camera 1 - Nguyễn Văn Linh",
            cars: Math.floor(Math.random() * 30) + 5,
            motorcycles: Math.floor(Math.random() * 80) + 20,
            traffic: ['THÔNG THOÁNG', 'ĐÔNG', 'TẮC NGHẼN'][Math.floor(Math.random() * 3)]
        };
        
        fetch('/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        }).catch(err => console.error('Lỗi gửi test:', err));
    }, 500);
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    initDOMCache();
    
    console.log('🚀 Traffic monitoring đã sẵn sàng');
    
    // Cập nhật lần đầu sau 2 giây
    setTimeout(updateTraffic, 2000);
    
    // Cập nhật mỗi 3 giây
    setInterval(updateTraffic, 3000);
    
    // Optional: Dùng requestAnimationFrame cho mượt mà hơn
    let rafId;
    function smoothUpdate() {
        updateTraffic();
        rafId = requestAnimationFrame(smoothUpdate);
    }
    // Bỏ comment dòng dưới nếu muốn dùng RAF thay vì setInterval
    // rafId = requestAnimationFrame(smoothUpdate);
});

// Export functions
window.sendTestData = sendTestData;