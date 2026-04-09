// static/js/camera-markers.js - Cập nhật màu đường theo camera

// Ánh xạ camera sang đường
const cameraToRoad = {
    "Camera 1 - Giao lộ Nguyễn Văn Linh": "nguyen_van_linh",
    "Camera 2 - Cầu Rồng": "le_duan",
    "Camera 3 - Phạm Văn Đồng": "hoang_dieu",
    "Camera 4 - Bạch Đằng": "nguyen_tri_phuong"
};

// Cập nhật màu đường từ dữ liệu traffic
function updateRoadColorsFromTraffic(allData) {
    for (let cameraName in allData) {
        const roadId = cameraToRoad[cameraName];
        if (!roadId) continue;
        
        const trafficState = allData[cameraName]?.traffic || 'UNKNOWN';
        
        if (typeof updateRoadColor === 'function') {
            updateRoadColor(roadId, trafficState);
        }
    }
}

// Lấy dữ liệu traffic và cập nhật
function fetchTrafficAndUpdate() {
    fetch('/traffic')
        .then(res => res.json())
        .then(data => {
            updateRoadColorsFromTraffic(data);
        })
        .catch(err => console.error('Lỗi lấy traffic:', err));
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        fetchTrafficAndUpdate();
        setInterval(fetchTrafficAndUpdate, 3000);
    }, 2000);
});