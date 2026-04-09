// static/js/data.js - Dữ liệu các tuyến đường

// =============================================
// 1. ĐƯỜNG NGUYỄN VĂN LINH
// =============================================
var nvlPoints = [
    [16.058838, 108.206404],
    [16.059531, 108.208623],
    [16.060780, 108.216995],
    [16.060959, 108.221215],
    [16.061061, 108.223855]
];

var nvlCenter = [
    nvlPoints.reduce((s, p) => s + p[0], 0) / nvlPoints.length,
    nvlPoints.reduce((s, p) => s + p[1], 0) / nvlPoints.length
];

// =============================================
// 2. ĐƯỜNG HOÀNG DIỆU
// =============================================
var hoangDieuPoints = [
    [16.056950, 108.217133],
    [16.060507, 108.217027],
    [16.063190, 108.217922],
    [16.066223, 108.220046]
];

var hoangDieuCenter = [
    hoangDieuPoints.reduce((s, p) => s + p[0], 0) / hoangDieuPoints.length,
    hoangDieuPoints.reduce((s, p) => s + p[1], 0) / hoangDieuPoints.length
];

// =============================================
// 3. ĐƯỜNG LÊ DUẨN
// =============================================
var leDuanPoints = [
    [16.069516, 108.209777],
    [16.070960, 108.217014],
    [16.071733, 108.223918]
];

var leDuanCenter = [
    leDuanPoints.reduce((s, p) => s + p[0], 0) / leDuanPoints.length,
    leDuanPoints.reduce((s, p) => s + p[1], 0) / leDuanPoints.length
];

// =============================================
// 4. ĐƯỜNG NGUYỄN TRI PHƯƠNG
// =============================================
var nguyenTriPhuongPoints = [
    [16.065622, 108.202511],
    [16.062085, 108.204406],
    [16.056987, 108.206806]
];

var nguyenTriPhuongCenter = [
    nguyenTriPhuongPoints.reduce((s, p) => s + p[0], 0) / nguyenTriPhuongPoints.length,
    nguyenTriPhuongPoints.reduce((s, p) => s + p[1], 0) / nguyenTriPhuongPoints.length
];

// =============================================
// OBJECT MAP - ÁNH XẠ TÊN ĐƯỜNG SANG ID
// =============================================
const roadNameToId = {
    // Nguyễn Văn Linh
    "nguyễn văn linh": "nguyen_van_linh",
    "nguyen van linh": "nguyen_van_linh",
    "nvl": "nguyen_van_linh",
    
    // Hoàng Diệu
    "hoàng diệu": "hoang_dieu",
    "hoang dieu": "hoang_dieu",
    "hd": "hoang_dieu",
    
    // Lê Duẩn
    "lê duẩn": "le_duan",
    "le duan": "le_duan",
    "ld": "le_duan",
    
    // Nguyễn Tri Phương
    "nguyễn tri phương": "nguyen_tri_phuong",
    "nguyen tri phuong": "nguyen_tri_phuong",
    "ntp": "nguyen_tri_phuong"
};

// =============================================
// OBJECT TỔNG HỢP TẤT CẢ CÁC ĐƯỜNG
// =============================================
var roads = {
    "nguyen_van_linh": {
        id: "nguyen_van_linh",
        name: "Đường Nguyễn Văn Linh",
        nameEn: "Nguyen Van Linh Street",
        keywords: ["nguyễn văn linh", "nguyen van linh", "nvl"],
        points: nvlPoints,
        center: nvlCenter,
        color: "#3388ff",
        weight: 6,
        camera: "Camera 1 - Giao lộ Nguyễn Văn Linh"
    },
    "hoang_dieu": {
        id: "hoang_dieu",
        name: "Đường Hoàng Diệu",
        nameEn: "Hoang Dieu Street",
        keywords: ["hoàng diệu", "hoang dieu", "hd"],
        points: hoangDieuPoints,
        center: hoangDieuCenter,
        color: "#33cc33",
        weight: 5,
        camera: null
    },
    "le_duan": {
        id: "le_duan",
        name: "Đường Lê Duẩn",
        nameEn: "Le Duan Street",
        keywords: ["lê duẩn", "le duan", "ld"],
        points: leDuanPoints,
        center: leDuanCenter,
        color: "#ff9900",
        weight: 5,
        camera: null
    },
    "nguyen_tri_phuong": {
        id: "nguyen_tri_phuong",
        name: "Đường Nguyễn Tri Phương",
        nameEn: "Nguyen Tri Phuong Street",
        keywords: ["nguyễn tri phương", "nguyen tri phuong", "ntp"],
        points: nguyenTriPhuongPoints,
        center: nguyenTriPhuongCenter,
        color: "#9900cc",
        weight: 5,
        camera: null
    }
};

// =============================================
// DANH SÁCH TẤT CẢ CÁC ĐƯỜNG
// =============================================
var allRoads = [
    {
        id: "nguyen_van_linh",
        name: "Nguyễn Văn Linh",
        keywords: ["nguyễn văn linh", "nguyen van linh", "nvl"],
        points: nvlPoints,
        center: nvlCenter,
        color: "#3388ff"
    },
    {
        id: "hoang_dieu",
        name: "Hoàng Diệu",
        keywords: ["hoàng diệu", "hoang dieu", "hd"],
        points: hoangDieuPoints,
        center: hoangDieuCenter,
        color: "#33cc33"
    },
    {
        id: "le_duan",
        name: "Lê Duẩn",
        keywords: ["lê duẩn", "le duan", "ld"],
        points: leDuanPoints,
        center: leDuanCenter,
        color: "#ff9900"
    },
    {
        id: "nguyen_tri_phuong",
        name: "Nguyễn Tri Phương",
        keywords: ["nguyễn tri phương", "nguyen tri phuong", "ntp"],
        points: nguyenTriPhuongPoints,
        center: nguyenTriPhuongCenter,
        color: "#9900cc"
    }
];

// =============================================
// HÀM TIỆN ÍCH: LẤY ID ĐƯỜNG TỪ QUERY
// =============================================
function getRoadIdFromQuery(query) {
    if (!query) return null;
    
    const q = query.toLowerCase().trim();
    
    // Kiểm tra trong roadNameToId trước
    if (roadNameToId[q]) {
        return roadNameToId[q];
    }
    
    // Nếu không, kiểm tra từng đường
    for (let road of allRoads) {
        for (let keyword of road.keywords) {
            if (q.includes(keyword)) {
                return road.id;
            }
        }
    }
    
    return null;
}

// =============================================
// HÀM TIỆN ÍCH: LẤY THÔNG TIN ĐƯỜNG THEO ID
// =============================================
function getRoadById(roadId) {
    return roads[roadId] || null;
}

// =============================================
// HÀM TIỆN ÍCH: LẤY TẤT CẢ TÊN ĐƯỜNG
// =============================================
function getAllRoadNames() {
    return allRoads.map(road => road.name);
}

// Export ra global
window.roadNameToId = roadNameToId;
window.roads = roads;
window.allRoads = allRoads;
window.getRoadIdFromQuery = getRoadIdFromQuery;
window.getRoadById = getRoadById;
window.getAllRoadNames = getAllRoadNames;