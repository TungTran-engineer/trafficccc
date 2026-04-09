// static/js/utils.js - Các hàm tiện ích dùng chung

// Tính khoảng cách giữa 2 tọa độ (km)
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

// Kiểm tra query có phải tên đường không
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

// Tìm điểm gần nhất trên đường (dùng Nominatim)
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

// Export ra window để các script khác dùng
window.calculateDistance = calculateDistance;
window.isRoadNameQuery = isRoadNameQuery;
window.findClosestPointOnRoad = findClosestPointOnRoad;