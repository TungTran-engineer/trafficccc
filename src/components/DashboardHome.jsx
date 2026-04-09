import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// ==================== CẤU HÌNH ====================
const API_BASE = 'http://localhost:5000'; // Backend Flask

// Danh sách camera đồng bộ với backend (giống CamerasPage)
const CAMERAS = [
  { id: 1, name: "Camera 1 - Nguyễn Văn Linh", key: "Camera 1 - Giao lộ Nguyễn Văn Linh", shortTitle: "Nguyễn Văn Linh", location: "Đà Nẵng" },
  { id: 2, name: "Camera 2 - Hoàng Diệu", key: "Camera 2 - Hoàng Diệu", shortTitle: "Hoàng Diệu", location: "Đà Nẵng" },
  { id: 3, name: "Camera 3 - Nguyễn Tri Phương", key: "Camera 3 - Nguyễn Tri Phương", shortTitle: "Nguyễn Tri Phương", location: "Đà Nẵng" },
  { id: 4, name: "Camera 4 - Lê Duẩn", key: "Camera 4 - lê duẫn", shortTitle: "Lê Duẩn", location: "Đà Nẵng" }
];

// Hàm chuyển trạng thái traffic sang màu sắc & text
const getTrafficInfo = (status) => {
  switch(status) {
    case 'TAC NGHEN': return { color: 'text-red-500', text: 'Tắc nghẽn (88%)', severity: 'high' };
    case 'DONG': return { color: 'text-amber-500', text: 'Đông đúc (54%)', severity: 'medium' };
    default: return { color: 'text-green-500', text: 'Thông thoáng (20%)', severity: 'low' };
  }
};

const DashboardHome = () => {
  const navigate = useNavigate();
  
  // State dữ liệu thực từ backend
  const [trafficData, setTrafficData] = useState({});
  const [historicalFlow, setHistoricalFlow] = useState([]); // Lưu lịch sử lưu lượng theo giờ
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // State giao diện
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  // Dữ liệu thời tiết (có thể gọi API thật sau)
  const [weather, setWeather] = useState({
    temp: 28,
    condition: 'clear',
    humidity: 78,
    windSpeed: 8,
    icon: 'wb_sunny'
  });
  
  // Dự báo AI (tạm tính từ dữ liệu traffic)
  const [trafficPrediction, setTrafficPrediction] = useState({
    peakTime: "17:30",
    peakIntensity: 85,
    confidence: 82,
    recommendations: [
      "Tránh đường Nguyễn Văn Linh lúc cao điểm",
      "Dùng đường Võ Văn Kiệt thay thế",
      "Dự kiến chậm 10-15 phút"
    ]
  });

  // ==================== FETCH TRAFFIC DATA ====================
  const fetchTraffic = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/traffic`);
      if (!res.ok) throw new Error('Failed to fetch traffic');
      const data = await res.json();
      setTrafficData(data);
      setLastUpdate(new Date());
      
      // Cập nhật lịch sử lưu lượng (mỗi lần fetch lưu tổng số xe)
      const totalVehicles = Object.values(data).reduce((sum, cam) => 
        sum + (cam.cars || 0) + (cam.motorcycles || 0), 0);
      const currentHour = new Date().getHours();
      setHistoricalFlow(prev => {
        const formattedHour = `${currentHour.toString().padStart(2,'0')}:00`;
        const newPoint = { hour: formattedHour, flow: totalVehicles };
        const filtered = prev.filter(p => p.hour !== formattedHour);
        const merged = [...filtered, newPoint];
        merged.sort((a,b) => parseInt(a.hour) - parseInt(b.hour));
        return merged.slice(-24); // giữ tối đa 24 mốc
      });
    } catch (err) {
      console.error('Lỗi fetch traffic:', err);
    }
  }, []);

  // Tự động cập nhật mỗi 5 giây
  useEffect(() => {
    fetchTraffic();
    const interval = setInterval(fetchTraffic, 5000);
    return () => clearInterval(interval);
  }, [fetchTraffic]);

  // ==================== TÍNH TOÁN STATS THỰC ====================
  const computeStats = () => {
    let totalCars = 0, totalBikes = 0, congestedCameras = 0;
    Object.values(trafficData).forEach(cam => {
      totalCars += cam.cars || 0;
      totalBikes += cam.motorcycles || 0;
      if (cam.traffic === 'TAC NGHEN') congestedCameras++;
    });
    const totalVehicles = totalCars + totalBikes;
    // Ước lượng tốc độ trung bình dựa trên mật độ (giả lập)
    const avgSpeed = totalVehicles > 200 ? 25 : totalVehicles > 100 ? 38 : 52;
    // Hệ thống uptime giả định
    const systemStatus = 99.8;
    
    return { totalVehicles, activeIncidents: congestedCameras, avgSpeed, systemStatus };
  };
  
  const stats = computeStats();
  
  // Dữ liệu cho biểu đồ (từ historicalFlow)
const getDefaultChartData = () => {
  const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  return hours.map(hour => ({ hour, flow: 40 + Math.random() * 60 }));
};
const chartData = historicalFlow.length >= 5 ? historicalFlow : getDefaultChartData();
  // ==================== TẠO ALERTS TỪ DỮ LIỆU THỰC ====================
  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
    const newAlerts = [];
    Object.entries(trafficData).forEach(([camName, data]) => {
      if (data.traffic === 'TAC NGHEN') {
        newAlerts.push({
          id: camName,
          title: `Tắc nghẽn tại ${camName}`,
          location: camName,
          time: 'Vừa xảy ra',
          type: 'traffic',
          severity: 'high',
          read: false
        });
      } else if (data.traffic === 'DONG') {
        newAlerts.push({
          id: camName,
          title: `Mật độ cao tại ${camName}`,
          location: camName,
          time: 'Vài phút trước',
          type: 'traffic',
          severity: 'medium',
          read: false
        });
      }
    });
    setAlerts(newAlerts.slice(0, 5));
  }, [trafficData]);
  
  // ==================== HÀM TIỆN ÍCH ====================
  const showMessage = (msg) => {
    setNotificationMessage(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };
  
  const refreshData = () => {
    setIsLoading(true);
    fetchTraffic().finally(() => {
      setIsLoading(false);
      showMessage('Dữ liệu đã được cập nhật');
    });
  };
  
  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    showMessage('Đã đánh dấu tất cả là đã đọc');
  };
  
  const dismissAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    showMessage('Đã xóa cảnh báo');
  };
  
  // Mở modal xem camera fullscreen
  const openCameraModal = (camera) => {
    setSelectedCamera(camera);
    setShowVideoModal(true);
  };
  
  // ==================== RENDER ====================
  return (
    <>
      {/* Toast thông báo */}
      {showNotification && (
        <div className="fixed top-20 right-6 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-right-5 duration-300">
          {notificationMessage}
        </div>
      )}
      
      <div className="h-full overflow-y-auto p-6 md:p-8 space-y-8 bg-[#f7f5f8]">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tighter text-slate-900">
              🚦 Trung tâm Giám sát Giao thông Đà Nẵng
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              Dữ liệu realtime từ camera AI • {lastUpdate.toLocaleTimeString('vi-VN')}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-sm ${isLoading ? 'animate-spin' : ''}`}>
                {isLoading ? 'progress_activity' : 'refresh'}
              </span>
              {isLoading ? 'Đang cập nhật...' : 'Đồng bộ'}
            </button>
          </div>
        </div>
        
        {/* Row 1: Thống kê nhanh */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-3xl text-primary">traffic</span>
              <span className="text-xs text-slate-400">Tổng phương tiện</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.totalVehicles.toLocaleString()}</p>
            <p className="text-xs text-green-600">+12% so với hôm qua</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-3xl text-amber-500">warning</span>
              <span className="text-xs text-slate-400">Sự cố đang hoạt động</span>
            </div>
            <p className="text-2xl font-bold">{stats.activeIncidents}</p>
            <p className="text-xs text-red-500">{stats.activeIncidents > 0 ? 'Cần xử lý' : 'Bình thường'}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-3xl text-blue-500">speed</span>
              <span className="text-xs text-slate-400">Tốc độ trung bình</span>
            </div>
            <p className="text-2xl font-bold">{stats.avgSpeed} km/h</p>
            <p className="text-xs text-slate-500">-3 km/h so với hôm qua</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
              <span className="text-xs text-slate-400">Độ sẵn sàng hệ thống</span>
            </div>
            <p className="text-2xl font-bold">{stats.systemStatus}%</p>
            <p className="text-xs text-green-600">Uptime 30 ngày</p>
          </div>
        </div>
        
        {/* Row 2: Biểu đồ lưu lượng + Thời tiết & Dự báo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Traffic Flow Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900">Phân tích lưu lượng</h4>
                <p className="text-xs text-slate-500 mt-1">Số xe theo giờ (tổng các camera)</p>
              </div>
              <div className="flex gap-3">
                <button className="px-3 py-1 text-xs font-bold rounded-lg bg-primary text-white">Hôm nay</button>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => `${value} xe`} />
                  <Area type="monotone" dataKey="flow" stroke="#7b00ff" fill="#7b00ff" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Weather & AI Forecast */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between mb-3">
                <span className="material-symbols-outlined text-3xl">{weather.icon}</span>
                <span className="text-xs opacity-80">{lastUpdate.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold">{weather.temp}°C</span>
                <span className="text-sm opacity-80">Cảm giác như {weather.temp-2}°C</span>
              </div>
              <p className="text-sm opacity-90 mb-3">Độ ẩm: {weather.humidity}% • Gió: {weather.windSpeed} km/h</p>
              <div className="bg-white/20 rounded-lg p-2 text-center text-xs">
                Dự báo: Nắng, chiều tối có thể có mưa rải rác
              </div>
            </div>
            
            <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl -mr-12 -mt-12"></div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-primary rounded-lg text-white">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/60">Dự báo AI</h4>
              </div>
              <h5 className="text-base font-bold leading-tight mb-1">Cao điểm lúc {trafficPrediction.peakTime}</h5>
              <p className="text-xs text-white/50 mb-3">
                {trafficPrediction.confidence}% khả năng tắc nghẽn trên các tuyến chính
              </p>
              <div className="bg-white/10 rounded-lg p-3 space-y-1">
                {trafficPrediction.recommendations.map((rec, idx) => (
                  <p key={idx} className="text-[10px] text-white/70">• {rec}</p>
                ))}
              </div>
              <div className="mt-3">
                <div className="w-full bg-white/10 h-1.5 rounded-full mb-1 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${trafficPrediction.confidence}%` }}></div>
                </div>
                <div className="flex justify-between text-[9px] uppercase tracking-wider">
                  <span className="text-white/40">Độ tin cậy</span>
                  <span className="text-primary">{trafficPrediction.confidence}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Row 3: Bản đồ và camera feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mini Map */}
          <div className="lg:col-span-2 bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-[400px]">
            <div className="p-4 flex items-center justify-between border-b border-slate-50">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">Bản đồ giao thông Đà Nẵng</h4>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-500"><span className="w-2 h-2 rounded-full bg-green-500"></span> Thông thoáng</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-500"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Đông đúc</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-red-500"><span className="w-2 h-2 rounded-full bg-red-500"></span> Tắc nghẽn</span>
              </div>
            </div>
            <div className="flex-1 relative bg-slate-200 cursor-pointer" onClick={() => navigate('/map')}>
            <iframe
              title="Bản đồ Đà Nẵng"
              className="w-full h-full"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.426729570674!2d108.21497131484664!3d16.054225588876387!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219c792252a13%3A0xfc14e3a044716b89!2zVGjDoG5oIHBo4buRIEThuqkgTuG6tW5n!5e0!3m2!1svi!2s!4v1610000000000!5m2!1svi!2s"
              allowFullScreen
              loading="lazy"
            ></iframe>
              <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                <span className="bg-white/90 text-primary px-4 py-2 rounded-lg text-sm font-semibold">Xem bản đồ chi tiết →</span>
              </div>
            </div>
          </div>
          
          {/* Camera Feeds Thực Tế */}
          <div className="flex flex-col gap-6 h-[400px]">
            {CAMERAS.slice(0, 2).map((camera) => {
              const camData = trafficData[camera.key] || { cars: 0, motorcycles: 0, traffic: 'THONG' };
              const trafficInfo = getTrafficInfo(camData.traffic);
              return (
                <div 
                  key={camera.id} 
                  onClick={() => openCameraModal(camera)}
                  className="flex-1 bg-black rounded-2xl overflow-hidden relative group cursor-pointer"
                >
                  <img
                    alt={camera.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    src={`${API_BASE}/video/${encodeURIComponent(camera.key)}`}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter">LIVE</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white text-xs font-bold truncate">{camera.shortTitle}</p>
                    <p className={`text-[9px] ${trafficInfo.color}`}>{trafficInfo.text}</p>
                    <p className="text-[8px] text-white/60">🚗 {camData.cars} • 🏍️ {camData.motorcycles}</p>
                  </div>
                  <div className="absolute bottom-3 right-3 text-[10px] font-mono text-white/70 bg-black/40 px-2 py-1 rounded">CAM-{camera.id}</div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                    <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all">
                      <span className="material-symbols-outlined">fullscreen</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Row 4: Biểu đồ so sánh, Alerts, System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Volume Comparison */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">So sánh lưu lượng</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Các camera chính</p>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CAMERAS.map(cam => ({
                  name: cam.shortTitle,
                  cars: trafficData[cam.key]?.cars || 0,
                  bikes: trafficData[cam.key]?.motorcycles || 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Bar dataKey="cars" fill="#7b00ff" radius={[4,4,0,0]} name="Ô tô" />
                  <Bar dataKey="bikes" fill="#f97316" radius={[4,4,0,0]} name="Xe máy" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Alerts */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">Cảnh báo giao thông</h4>
              <button onClick={markAllAsRead} className="text-[10px] font-bold text-primary hover:underline">Đánh dấu đã đọc</button>
            </div>
            <div className="space-y-3 flex-1">
              {alerts.length === 0 && (
                <div className="text-center text-slate-400 text-xs py-4">Không có cảnh báo mới</div>
              )}
              {alerts.map((alert) => (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer ${!alert.read ? 'bg-red-50/30 border border-red-500/10' : 'hover:bg-slate-50'}`} onClick={() => navigate('/notifications')}>
                  <div className={`p-2 rounded-lg ${alert.severity === 'high' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                    <span className="material-symbols-outlined text-sm">traffic</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-slate-900 truncate">{alert.title}</p>
                      {!alert.read && <span className="w-1.5 h-1.5 rounded-full bg-red-500 ml-2"></span>}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{alert.location} • {alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* System Health */}
          <div className="lg:col-span-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-5 border border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">health_and_safety</span>
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Sức khỏe hệ thống</h4>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Thời gian phản hồi API</span>
                  <span className="text-primary font-bold">~120ms</span>
                </div>
                <div className="w-full h-1.5 bg-primary/10 rounded-full"><div className="h-full w-[65%] rounded-full bg-primary"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Tải server</span>
                  <span className="text-green-500 font-bold">38%</span>
                </div>
                <div className="w-full h-1.5 bg-primary/10 rounded-full"><div className="h-full w-[38%] rounded-full bg-green-500"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Đồng bộ dữ liệu</span>
                  <span className="text-primary font-bold">Hoạt động</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[9px] text-slate-500">Cập nhật lúc {lastUpdate.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 pb-6">
          <div className="md:col-span-2 p-5 rounded-2xl bg-primary text-white relative overflow-hidden cursor-pointer" onClick={() => navigate('/analytics')}>
            <div className="relative z-10">
              <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Tình trạng mạng lưới</h4>
              <p className="text-lg font-bold mb-2">Hệ thống vận hành ở mức {stats.systemStatus}% hiệu suất</p>
              <div className="flex gap-3">
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm"><p className="text-[8px] uppercase opacity-70">Camera đang hoạt động</p><p className="text-sm font-bold">{Object.keys(trafficData).length}</p></div>
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm"><p className="text-[8px] uppercase opacity-70">Độ trễ trung bình</p><p className="text-sm font-bold">14ms</p></div>
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm"><p className="text-[8px] uppercase opacity-70">Uptime</p><p className="text-sm font-bold">99.98%</p></div>
              </div>
            </div>
            <div className="absolute -right-12 -bottom-12 opacity-10"><span className="material-symbols-outlined text-[120px]">videocam</span></div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="material-symbols-outlined text-primary mb-3 text-2xl">analytics</span>
              <h4 className="text-sm font-bold text-slate-900">Báo cáo tuần</h4>
              <p className="text-[11px] text-slate-500 mt-1">{stats.activeIncidents} sự cố được phát hiện tự động</p>
            </div>
            <button className="mt-4 w-full py-2 bg-slate-800 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider hover:bg-slate-700 transition-colors">Tải báo cáo</button>
          </div>
        </div>
      </div>
      
      {/* Modal xem camera fullscreen */}
      {showVideoModal && selectedCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
          <div className="relative w-[95vw] h-[95vh] max-w-7xl">
            <button onClick={() => setShowVideoModal(false)} className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-primary/80 transition-all z-20 border border-white/20">
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="text-sm font-bold">Quay lại</span>
            </button>
            <button onClick={() => setShowVideoModal(false)} className="absolute top-4 right-4 text-white hover:text-primary transition-colors z-20 bg-black/50 backdrop-blur-md rounded-full p-2 border border-white/20">
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
            <div className="w-full h-full rounded-2xl overflow-hidden border-4 border-primary/20 bg-black flex items-center justify-center">
              <img 
                src={`${API_BASE}/video/${encodeURIComponent(selectedCamera.key)}`}
                alt={selectedCamera.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
              <p className="text-white font-bold">{selectedCamera.name}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardHome;