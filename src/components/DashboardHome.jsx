import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    trafficFlow: 42840,
    activeIncidents: 7,
    avgSpeed: 38.4,
    systemStatus: 99.9,
    historicalData: {
      today: [32, 35, 38, 42, 45, 48, 52, 58, 62, 65, 68, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92, 89, 85, 82],
      yesterday: [30, 32, 35, 38, 42, 44, 48, 52, 56, 60, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 83, 80]
    }
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      title: 'Accident at Thu Thiem Tunnel',
      location: 'District 2 Entrance',
      time: '2 mins ago',
      type: 'accident',
      severity: 'high',
      read: false
    },
    {
      id: 2,
      title: 'Traffic Jam at Bay Hien Intersection',
      location: 'Heavy Congestion',
      time: '15 mins ago',
      type: 'traffic',
      severity: 'medium',
      read: false
    },
    {
      id: 3,
      title: 'Roadwork: CMT8 Road',
      location: 'Scheduled Maintenance',
      time: '45 mins ago',
      type: 'construction',
      severity: 'low',
      read: true
    }
  ]);

  const [cameras, setCameras] = useState([
    {
      id: "sJvEFrG0wq0",
      title: "Quang Trung - Da Nang",
      shortTitle: "Quang Trung",
      location: "Da Nang",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdBoTr_Sdn6MeagnyrXmeqglDYMA6-nrlCzg&s",
      congestion: "heavy",
      congestionText: "High Traffic (88%)",
      camId: "CAM-084"
    },
    {
      id: "G_G8A6JU_LI",
      title: "Hai Phong - Da Nang",
      shortTitle: "Hai Phong",
      location: "Da Nang",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNjMHe1ZAhZCHtRe8Vqr89t8ZuU7G6mvHyOA&s",
      congestion: "moderate",
      congestionText: "Moderate (54%)",
      camId: "CAM-021"
    }
  ]);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [chartData, setChartData] = useState([]);
  const [trafficPrediction, setTrafficPrediction] = useState({
    peakTime: "17:30",
    peakIntensity: 92,
    confidence: 85,
    recommendations: [
      "Avoid I-95 North between 5-7 PM",
      "Use alternative route via Shore Road",
      "Expect 15-20 min delay"
    ]
  });
  const [weather, setWeather] = useState({
    temp: 25,
    condition: 'clear',
    humidity: 65,
    windSpeed: 12,
    icon: 'wb_sunny'
  });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Chart data
  useEffect(() => {
    const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    const data = hours.map((hour, i) => ({
      hour,
      today: stats.historicalData.today[i] || 40 + Math.random() * 40,
      yesterday: stats.historicalData.yesterday[i] || 35 + Math.random() * 40,
      prediction: 45 + Math.random() * 40
    }));
    setChartData(data);
  }, [stats]);

  // Simulate real-time data update
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        trafficFlow: prev.trafficFlow + Math.floor(Math.random() * 100) - 50,
        avgSpeed: Math.max(20, Math.min(80, prev.avgSpeed + (Math.random() - 0.5) * 2))
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const showMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const formatNumber = (num) => num.toLocaleString();

  const getCongestionColor = (congestion) => {
    switch(congestion) {
      case 'heavy': return 'text-red-500';
      case 'moderate': return 'text-amber-500';
      case 'light': return 'text-green-500';
      default: return 'text-slate-300';
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-amber-500 text-white';
      default: return 'bg-primary text-white';
    }
  };

  const getWeatherIcon = () => {
    switch(weather.condition) {
      case 'clear': return 'wb_sunny';
      case 'cloudy': return 'cloud';
      case 'rain': return 'rainy';
      case 'storm': return 'thunderstorm';
      default: return 'wb_sunny';
    }
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
    showMessage('Marked all as read');
  };

  const dismissAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    showMessage('Alert dismissed', 'info');
  };

  const showFullScreenVideo = (camera) => {
    setSelectedVideo(camera);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setStats(prev => ({
        ...prev,
        trafficFlow: 40000 + Math.floor(Math.random() * 5000),
        activeIncidents: Math.floor(Math.random() * 10),
        avgSpeed: 35 + Math.random() * 10,
        systemStatus: 99.5 + Math.random() * 0.5
      }));
      setIsLoading(false);
      showMessage('Data updated successfully');
    }, 1000);
  };

 

  const COLORS = ['#7b00ff', '#ef4444', '#f59e0b', '#10b981'];

  return (
    <>
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-20 right-6 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-right-5 duration-300">
          {notificationMessage}
        </div>
      )}

      <div className="h-full overflow-y-auto p-6 md:p-8 space-y-8 bg-[#f7f5f8]">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tighter text-slate-900">
              System Overview Dashboard
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              Real-time metropolitan traffic intelligence • {new Date().toLocaleDateString('en-US')}
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
              {isLoading ? 'Updating...' : 'Live Sync'}
            </button>
           
          </div>
        </div>

        {/* Row 1: Quick Stats */}
        
        {/* Row 2: Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Traffic Flow Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900">Traffic Flow Analysis</h4>
                <p className="text-xs text-slate-500 mt-1">Hourly traffic volume comparison</p>
              </div>
              <div className="flex gap-3">
                {['today', 'yesterday', 'prediction'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                      selectedPeriod === period
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {period === 'today' ? 'Today' : period === 'yesterday' ? 'Yesterday' : 'Prediction'}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey={selectedPeriod}
                    stroke="#7b00ff"
                    fill="#7b00ff"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weather & Prediction Widget */}
          <div className="space-y-4">
            {/* Weather Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between mb-3">
                <span className="material-symbols-outlined text-3xl">{getWeatherIcon()}</span>
                <span className="text-xs opacity-80">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold">{weather.temp}°C</span>
                <span className="text-sm opacity-80">Feels like {weather.temp - 2}°C</span>
              </div>
              <p className="text-sm opacity-90 mb-3">Humidity: {weather.humidity}% • Wind: {weather.windSpeed} km/h</p>
              <div className="bg-white/20 rounded-lg p-2 text-center text-xs">
                Forecast: Sunny, temperatures rising slightly in the afternoon
              </div>
            </div>

            {/* AI Forecast Widget */}
            <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl -mr-12 -mt-12"></div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-primary rounded-lg text-white">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/60">AI Traffic Forecast</h4>
              </div>
              <h5 className="text-base font-bold leading-tight mb-1">Peak at {trafficPrediction.peakTime}</h5>
              <p className="text-xs text-white/50 mb-3">
                {trafficPrediction.confidence}% probability of high congestion on main routes
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
                  <span className="text-white/40">Confidence</span>
                  <span className="text-primary">{trafficPrediction.confidence}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Main Grid (Map and Cameras) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mini Map Column */}
          <div className="lg:col-span-2 bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-[400px]">
            <div className="p-4 flex items-center justify-between border-b border-slate-50">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">Live Traffic Map</h4>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Clear
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-500">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Moderate
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> Heavy
                </span>
              </div>
            </div>
            <div className="flex-1 relative bg-slate-200 cursor-pointer" onClick={() => navigate('/map')}>
              <img
                alt="Traffic Density Map"
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaIyVfmTlPiVipzeC4QqF69q2I9tDBOOztAU8a_h7YwrswRzuTDreJiD8HzabRlpOiBgNqTuylL6zwOCC8WJu34QhoTzqWWdhz34WCJfDN1EW5uxjvBXo-O52cqK8O83TiEP9GwgJvZDrQwe51ArFv_fXWKSjJh24GPNabb_lJK2x0pzMaCGAXjFTLoZxvC7uTqHOZiL6kRN1l7OWs2nCcF7r_oYHSdiLwptySyUnsfmVC5jdXkVZYyyhc_58y43QyVEbxm3LNyYo"
              />
              <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                <span className="bg-white/90 text-primary px-4 py-2 rounded-lg text-sm font-semibold">View detailed map →</span>
              </div>
            </div>
          </div>

          {/* Camera Feeds Column */}
          <div className="flex flex-col gap-6 h-[400px]">
            {cameras.map((camera, index) => (
              <div 
                key={camera.id} 
                onClick={() => showFullScreenVideo(camera)}
                className="flex-1 bg-black rounded-2xl overflow-hidden relative group cursor-pointer"
              >
                <img
                  alt={`Camera ${camera.title}`}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  src={camera.image}
                />
                <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-tighter">{camera.camId}</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-xs font-bold truncate">{camera.shortTitle}</p>
                  <p className={`text-[9px] ${getCongestionColor(camera.congestion)}`}>{camera.congestionText}</p>
                </div>
                <div className="absolute bottom-3 right-3 text-[10px] font-mono text-white/70 bg-black/40 px-2 py-1 rounded">LIVE</div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                  <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all">
                    <span className="material-symbols-outlined">play_arrow</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 4: Bottom Grid (Analytics, Alerts, Prediction) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Analytics Chart */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">Traffic Volume Comparison</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Today vs Yesterday</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span className="text-[9px] font-bold text-slate-500">Today</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  <span className="text-[9px] font-bold text-slate-500">Yesterday</span>
                </div>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(0, 12)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Bar dataKey="today" fill="#7b00ff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="yesterday" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">Critical Alerts</h4>
              <button 
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                Mark all as read
              </button>
            </div>
            <div className="space-y-3 flex-1">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                    !alert.read ? 'bg-red-50/30 border border-red-500/10' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => navigate('/notifications')}
                >
                  <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                    <span className="material-symbols-outlined text-sm">
                      {alert.type === 'accident' ? 'minor_crash' : alert.type === 'traffic' ? 'traffic' : 'construction'}
                    </span>
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
            {alerts.length > 3 && (
              <button 
                onClick={() => navigate('/notifications')}
                className="mt-4 text-center text-xs font-medium text-primary hover:underline"
              >
                View all ({alerts.length})
              </button>
            )}
          </div>

          {/* System Health Widget */}
          <div className="lg:col-span-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-5 border border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">health_and_safety</span>
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary">System Health</h4>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">API Response Time</span>
                  <span className="text-primary font-bold">124ms</span>
                </div>
                <div className="w-full h-1.5 bg-primary/10 rounded-full">
                  <div className="h-full w-[65%] rounded-full bg-primary"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Server Load</span>
                  <span className="text-green-500 font-bold">42%</span>
                </div>
                <div className="w-full h-1.5 bg-primary/10 rounded-full">
                  <div className="h-full w-[42%] rounded-full bg-green-500"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Data Sync</span>
                  <span className="text-primary font-bold">Active</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[9px] text-slate-500">Last sync: 2s ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Stats Bento Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 pb-6">
          <div className="md:col-span-2 p-5 rounded-2xl bg-primary text-white relative overflow-hidden cursor-pointer" onClick={() => navigate('/analytics')}>
            <div className="relative z-10">
              <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Network Health</h4>
              <p className="text-lg font-bold mb-2">System functioning at {stats.systemStatus}% peak efficiency</p>
              <div className="flex gap-3">
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                  <p className="text-[8px] uppercase opacity-70">Active Nodes</p>
                  <p className="text-sm font-bold">12,402</p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                  <p className="text-[8px] uppercase opacity-70">Latency</p>
                  <p className="text-sm font-bold">14ms</p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                  <p className="text-[8px] uppercase opacity-70">Uptime</p>
                  <p className="text-sm font-bold">99.98%</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-12 -bottom-12 opacity-10">
              <span className="material-symbols-outlined text-[120px]">hub</span>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="material-symbols-outlined text-primary mb-3 text-2xl">history</span>
              <h4 className="text-sm font-bold text-slate-900">Weekly Summary</h4>
              <p className="text-[11px] text-slate-500 mt-1">452 Traffic incidents resolved automatically</p>
            </div>
            <button className="mt-4 w-full py-2 bg-slate-800 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider hover:bg-slate-700 transition-colors">
              Download Report
            </button>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
          <div className="relative w-[95vw] h-[95vh] max-w-7xl">
            <button onClick={closeVideoModal} className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-primary/80 transition-all z-20 border border-white/20">
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="text-sm font-bold">Back to Dashboard</span>
            </button>
            <button onClick={closeVideoModal} className="absolute top-4 right-4 text-white hover:text-primary transition-colors z-20 bg-black/50 backdrop-blur-md rounded-full p-2 border border-white/20">
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
            <div className="w-full h-full rounded-2xl overflow-hidden border-4 border-primary/20">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&controls=1&modestbranding=1&rel=0`}
                title={selectedVideo.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
              <p className="text-white font-bold">{selectedVideo.title} - {selectedVideo.location}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardHome;