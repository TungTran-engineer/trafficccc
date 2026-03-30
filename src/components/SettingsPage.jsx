import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [adaptiveAggression, setAdaptiveAggression] = useState(85);
  const [emsPreemption, setEmsPreemption] = useState(true);
  const [greenWaveSync, setGreenWaveSync] = useState(true);
  const [incidentSensitivity, setIncidentSensitivity] = useState(75);
  const [prioritizeMassTransit, setPrioritizeMassTransit] = useState(true);
  const [residentialAvoidance, setResidentialAvoidance] = useState(false);
  const [ecoRouting, setEcoRouting] = useState(true);
  const [forecastHorizon, setForecastHorizon] = useState(45);
  const [detectionLag, setDetectionLag] = useState(1.5);
  
  // Danh sách thiết bị đang đăng nhập
  const [activeDevices, setActiveDevices] = useState([
    {
      id: 1,
      name: 'MacBook Pro 16"',
      browser: 'Chrome 122',
      location: 'San Francisco, USA',
      ip: '192.168.1.100',
      lastActive: 'Now',
      isCurrent: true,
      icon: 'computer'
    },
    {
      id: 2,
      name: 'iPhone 15 Pro',
      browser: 'Safari',
      location: 'London, UK',
      ip: '192.168.1.101',
      lastActive: '2 hours ago',
      isCurrent: false,
      icon: 'smartphone'
    },
    {
      id: 3,
      name: 'Windows PC',
      browser: 'Firefox 124',
      location: 'Tokyo, Japan',
      ip: '192.168.1.102',
      lastActive: '1 day ago',
      isCurrent: false,
      icon: 'desktop_windows'
    }
  ]);

  // Notification settings
  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    trafficUpdates: true,
    systemMaintenance: false,
    weeklyReport: true
  });

  // Lịch sử cảnh báo gần đây
  const [recentAlerts, setRecentAlerts] = useState([
    { id: 1, type: 'accident', location: 'I-95 North, Exit 22', time: '5 min ago', severity: 'high' },
    { id: 2, type: 'congestion', location: 'Downtown Main St', time: '12 min ago', severity: 'medium' },
    { id: 3, type: 'construction', location: 'Harbor Bridge', time: '25 min ago', severity: 'low' },
    { id: 4, type: 'weather', location: 'Coastal Highway', time: '1 hour ago', severity: 'medium' }
  ]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleEditProfile = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      authService.logout();
      navigate('/login');
    }
  };

  const revokeDevice = (deviceId) => {
    if (window.confirm('Revoke this device? It will be signed out immediately.')) {
      setActiveDevices(prev => prev.filter(d => d.id !== deviceId));
    }
  };

  const revokeAllDevices = () => {
    if (window.confirm('Sign out from all other devices? This will end all other active sessions.')) {
      setActiveDevices(prev => prev.filter(d => d.isCurrent));
    }
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getDeviceIcon = (icon) => {
    switch(icon) {
      case 'computer': return '💻';
      case 'smartphone': return '📱';
      case 'desktop_windows': return '🖥️';
      default: return '💻';
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-slate-500';
    }
  };

  const getAlertIcon = (type) => {
    switch(type) {
      case 'accident': return 'car_crash';
      case 'congestion': return 'traffic_jam';
      case 'construction': return 'construction';
      case 'weather': return 'weather_mix';
      default: return 'info';
    }
  };

  // Thống kê dự đoán
  const predictionStats = {
    accuracy: 94.2,
    falsePositive: 2.8,
    avgPredictTime: 12.4,
    modelsActive: 4
  };

  return (
    <div className="h-full overflow-y-auto bg-[#f7f5f8] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Dashboard Header */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-primary/10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                traffic_jam
              </span>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                Central Traffic Controller
                <span className="text-[9px] bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
                  MAX MASTER GRID
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium italic">
                Metropolitan Smart Grid Management • Operational Status: OPTIMAL
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200">
              Incident Logs
            </button>
            <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
              Commit Config
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Primary Configurations */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Adaptive Signal Control */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-primary/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      traffic
                    </span>
                  </div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">Adaptive Signal Control</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-green-600 uppercase">AI-Dynamic Mode</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-[10px] font-black uppercase text-slate-400">Cycle Optimization Aggression</label>
                      <span className="text-[10px] font-bold text-primary">{adaptiveAggression}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={adaptiveAggression}
                      onChange={(e) => setAdaptiveAggression(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-xs font-bold text-slate-900">EMS Priority Preemption</p>
                      <p className="text-[9px] text-slate-500">Auto-green for emergency vehicles</p>
                    </div>
                    <button
                      onClick={() => setEmsPreemption(!emsPreemption)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${emsPreemption ? 'bg-primary' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${emsPreemption ? 'right-0.5' : 'left-0.5'}`}></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Green-Wave Sync</p>
                      <p className="text-[9px] text-slate-500">Coordinate arterial corridors</p>
                    </div>
                    <button
                      onClick={() => setGreenWaveSync(!greenWaveSync)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${greenWaveSync ? 'bg-primary' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${greenWaveSync ? 'right-0.5' : 'left-0.5'}`}></div>
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-slate-900 rounded-xl flex flex-col justify-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-4 text-center">Active Phase Distribution</p>
                  <div className="flex items-end justify-around h-24 gap-2 mb-4 px-2">
                    <div className="w-8 bg-green-500 rounded-t-sm" style={{ height: '60%' }}></div>
                    <div className="w-8 bg-yellow-500 rounded-t-sm" style={{ height: '15%' }}></div>
                    <div className="w-8 bg-red-500 rounded-t-sm" style={{ height: '25%' }}></div>
                    <div className="w-8 bg-primary rounded-t-sm" style={{ height: '40%' }}></div>
                  </div>
                  <div className="grid grid-cols-4 text-center text-[8px] font-bold text-slate-500 uppercase">
                    <span>Main</span><span>Turn</span><span>Ped</span><span>Bus</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Sensor & Camera Network */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-primary/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      videocam
                    </span>
                  </div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">Sensor & Camera Network</h2>
                </div>
                <span className="text-[10px] font-bold py-1 px-3 bg-slate-100 rounded-full text-slate-600">4,282 ACTIVE NODES</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Thermal Accuracy</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">99.4%</span>
                    <span className="material-symbols-outlined text-green-500 text-sm">trending_up</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Classification</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold"><span>Vehicles</span><span>92%</span></div>
                    <div className="flex justify-between text-[10px] font-bold"><span>Cyclists</span><span>88%</span></div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">IoT Health</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">All Systems Go</span>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  </div>
                </div>
              </div>
              <div className="border border-primary/10 rounded-xl overflow-hidden">
                <div className="bg-primary/5 p-3 border-b border-primary/10 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Live Object Detection Feed</span>
                  <span className="text-[9px] font-mono text-primary">CAM_ID: NW-442-GRID</span>
                </div>
                <div className="h-48 bg-slate-800 relative flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
                  <div className="border border-green-400/50 absolute top-10 left-10 w-24 h-16 flex flex-col">
                    <span className="bg-green-400 text-[8px] text-black px-1 font-bold w-fit uppercase">CAR: 0.98</span>
                  </div>
                  <div className="border border-primary/50 absolute bottom-12 right-20 w-12 h-12 flex flex-col">
                    <span className="bg-primary text-[8px] text-black px-1 font-bold w-fit uppercase">BIKE: 0.84</span>
                  </div>
                  <div className="text-white/20 font-black text-4xl uppercase tracking-[0.2em] pointer-events-none">Vision Core Active</div>
                </div>
              </div>
            </section>

            {/* 3. Predictive Analytics */}
            <section className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <span className="material-symbols-outlined text-9xl">analytics</span>
              </div>
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="p-2 bg-white/10 rounded-lg text-primary">
                  <span className="material-symbols-outlined">query_stats</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold">Predictive AI Analytics</h2>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Incident forecasting & Route Optimization</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-3">Incident Detection Sensitivity</label>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono">LOW</span>
                      <div className="flex-1 relative">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={incidentSensitivity}
                          onChange={(e) => setIncidentSensitivity(parseInt(e.target.value))}
                          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                          style={{
                            background: `linear-gradient(to right, #7b00ff 0%, #7b00ff ${incidentSensitivity}%, rgba(255,255,255,0.1) ${incidentSensitivity}%, rgba(255,255,255,0.1) 100%)`
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono">HIGH</span>
                    </div>
                  </div>
                  
             <div className="grid grid-cols-2 gap-3 w-full">
  
  {/* Forecast Horizon */}
  <div className="p-3 bg-white/5 rounded-xl border border-white/10 min-w-0">
    <p className="text-[9px] font-black text-slate-500 uppercase">
      Forecast Horizon
    </p>

    <div className="flex items-center gap-2 mt-1 min-w-0">
      <input
        type="range"
        min="15"
        max="70"
        value={forecastHorizon}
        onChange={(e) => setForecastHorizon(parseInt(e.target.value))}
        className="flex-1 min-w-0 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
      />

      <span className="text-sm font-bold text-white whitespace-nowrap shrink-0">
        {forecastHorizon} min
      </span>
    </div>
  </div>

  {/* Detection Lag */}
  <div className="p-3 bg-white/5 rounded-xl border border-white/10 min-w-0">
    <p className="text-[9px] font-black text-slate-500 uppercase">
      Detection Lag
    </p>

    <div className="flex items-center gap-2 mt-1 min-w-0">
      <input
        type="range"
        min="0.5"
        max="5"
        step="0.1"
        value={detectionLag}
        onChange={(e) => setDetectionLag(parseFloat(e.target.value))}
        className="flex-1 min-w-0 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
      />

      <span className="text-sm font-bold text-green-400 whitespace-nowrap shrink-0">
        {detectionLag}s
      </span>
    </div>
  </div>

</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[9px] font-black text-slate-500 uppercase">Accuracy</p>
                      <p className="text-xl font-black text-white">{predictionStats.accuracy}%</p>
                      <p className="text-[8px] text-green-400 mt-1">↑ 2.3% vs last week</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[9px] font-black text-slate-500 uppercase">False Positive</p>
                      <p className="text-xl font-black text-white">{predictionStats.falsePositive}%</p>
                      <p className="text-[8px] text-green-400 mt-1">↓ 0.5% vs last week</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[9px] font-black text-slate-500 uppercase">Avg Predict Time</p>
                      <p className="text-xl font-black text-white">{predictionStats.avgPredictTime}ms</p>
                      <p className="text-[8px] text-slate-400 mt-1">Real-time</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[9px] font-black text-slate-500 uppercase">Active Models</p>
                      <p className="text-xl font-black text-white">{predictionStats.modelsActive}</p>
                      <p className="text-[8px] text-slate-400 mt-1">All operational</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold text-primary uppercase">AI Model Version</p>
                      <span className="text-[8px] text-green-400">● Active</span>
                    </div>
                    <p className="text-sm font-bold text-white">Gemini 2.5 Flash</p>
                    <p className="text-[9px] text-slate-400 mt-1">Optimized for real-time traffic prediction</p>
                    <div className="mt-3 pt-2 border-t border-white/10">
                      <div className="flex justify-between text-[8px] text-slate-400">
                        <span>Last trained: March 2026</span>
                        <span>Dataset: 2.4M incidents</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Alternate Route Parameters</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-xs">Prioritize Mass Transit</span>
                      <button
                        onClick={() => setPrioritizeMassTransit(!prioritizeMassTransit)}
                        className={`w-8 h-4 rounded-full relative transition-colors ${prioritizeMassTransit ? 'bg-primary' : 'bg-slate-700'}`}
                      >
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${prioritizeMassTransit ? 'right-0.5' : 'left-0.5'}`}></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-xs">Residential Avoidance</span>
                      <button
                        onClick={() => setResidentialAvoidance(!residentialAvoidance)}
                        className={`w-8 h-4 rounded-full relative transition-colors ${residentialAvoidance ? 'bg-primary' : 'bg-slate-700'}`}
                      >
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${residentialAvoidance ? 'right-0.5' : 'left-0.5'}`}></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-xs">Eco-Routing Focus</span>
                      <button
                        onClick={() => setEcoRouting(!ecoRouting)}
                        className={`w-8 h-4 rounded-full relative transition-colors ${ecoRouting ? 'bg-primary' : 'bg-slate-700'}`}
                      >
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${ecoRouting ? 'right-0.5' : 'left-0.5'}`}></div>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-bold text-green-400 uppercase">Active Route Optimization</p>
                        <p className="text-lg font-black text-white mt-1">8 min saved</p>
                        <p className="text-[9px] text-slate-300">Average daily commute reduction</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-white">+12.4%</p>
                        <p className="text-[8px] text-green-400">efficiency gain</p>
                      </div>
                    </div>
                    <div className="mt-3 w-full h-1.5 bg-green-500/30 rounded-full overflow-hidden">
                      <div className="w-[68%] h-full bg-green-400 rounded-full"></div>
                    </div>
                    <p className="text-[8px] text-slate-400 mt-2">Based on 2,384 optimized routes today</p>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Next 30min Prediction</p>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[9px] mb-1">
                          <span>Main St</span>
                          <span className="text-yellow-400">Moderate</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full">
                          <div className="w-[45%] h-full bg-yellow-500 rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] mb-1">
                          <span>Highway 101</span>
                          <span className="text-red-400">Heavy</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full">
                          <div className="w-[78%] h-full bg-red-500 rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] mb-1">
                          <span>Downtown</span>
                          <span className="text-green-400">Light</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full">
                          <div className="w-[25%] h-full bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Recent Alerts - THÊM SECTION MỚI */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-primary/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                    <span className="material-symbols-outlined">warning</span>
                  </div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">Recent Alerts</h2>
                </div>
                <button className="text-xs font-bold text-primary hover:underline">View All</button>
              </div>
              <div className="space-y-3">
                {recentAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-md transition-all">
                    <div className={`p-2 rounded-lg ${alert.severity === 'high' ? 'bg-red-100' : alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                      <span className={`material-symbols-outlined ${getSeverityColor(alert.severity)}`}>
                        {getAlertIcon(alert.type)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold text-slate-900">{alert.location}</p>
                        <span className="text-[10px] text-slate-400">{alert.time}</span>
                      </div>
                      <p className="text-xs text-slate-500">Alert type: {alert.type}</p>
                    </div>
                    <button className="text-xs font-medium text-primary hover:underline">Details</button>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] text-slate-500">Real-time monitoring active</span>
                </div>
                <span className="text-[9px] text-primary">Last updated: 5s ago</span>
              </div>
            </section>
          </div>

          {/* Right Column: Spatial & Health Status */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Card */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-primary/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <img
                    alt="User profile"
                    className="w-16 h-16 rounded-full border-2 border-primary/20 object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGZenXS3fBzd_tcIojiC9NyGd-5NY2aDAlhS6v_75Q1jDFCmajSsVObrStShxM8YalWWFwxHr7Xeq7NcXYOMDM9dVai4IJYL25IAA2Dk-WoLmzI6NSv5YIAnpgSVQLIpGFNKWacKUubPQagdK5138CKo3bsZ2DqCTAi_KyZjF7Vf1NDy5G-XrzcVr79CWLC3FByjzegMw40mOSZ2Yl5EX1YzzTZJE6um78w4FYCTZSFfssBbMTGNWElVpxxM2GkrOLe8FRW-pbcAU"
                  />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{user?.name || 'Alex Rivera'}</h3>
                  <p className="text-xs text-slate-500">{user?.email || 'alex@traffichub.io'}</p>
                  <p className="text-[10px] font-medium text-primary uppercase tracking-wider mt-1">System Controller</p>
                </div>
              </div>
              <button
                onClick={handleEditProfile}
                className="w-full flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold py-3 rounded-xl border border-primary/20 transition-all uppercase tracking-wider"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Profile
              </button>
            </section>

            {/* Active Devices */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-primary/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">devices</span>
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Active Devices</h2>
                </div>
                {activeDevices.filter(d => !d.isCurrent).length > 0 && (
                  <button
                    onClick={revokeAllDevices}
                    className="text-[10px] text-red-500 hover:text-red-600 font-bold uppercase tracking-wider"
                  >
                    Revoke All
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {activeDevices.map(device => (
                  <div key={device.id} className={`p-3 rounded-xl border ${device.isCurrent ? 'bg-primary/5 border-primary/30' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getDeviceIcon(device.icon)}</div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{device.name}</p>
                          <p className="text-[10px] text-slate-500">{device.browser} • {device.location}</p>
                          <p className="text-[9px] text-slate-400 font-mono">{device.ip}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {device.isCurrent ? (
                          <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Current</span>
                        ) : (
                          <button
                            onClick={() => revokeDevice(device.id)}
                            className="text-[10px] text-red-500 hover:text-red-600 font-bold"
                          >
                            Revoke
                          </button>
                        )}
                        <p className="text-[9px] text-slate-400 mt-1">{device.lastActive}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Notification Preferences */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-primary/10">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">notifications</span>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Notification Preferences</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Critical Alerts</p>
                    <p className="text-[9px] text-slate-500">Accidents, emergencies, major incidents</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('criticalAlerts')}
                    className={`w-9 h-5 rounded-full relative transition-colors ${notifications.criticalAlerts ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${notifications.criticalAlerts ? 'right-0.5' : 'left-0.5'}`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Traffic Updates</p>
                    <p className="text-[9px] text-slate-500">Congestion, delays, route changes</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('trafficUpdates')}
                    className={`w-9 h-5 rounded-full relative transition-colors ${notifications.trafficUpdates ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${notifications.trafficUpdates ? 'right-0.5' : 'left-0.5'}`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-slate-900">System Maintenance</p>
                    <p className="text-[9px] text-slate-500">Scheduled downtime, updates</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('systemMaintenance')}
                    className={`w-9 h-5 rounded-full relative transition-colors ${notifications.systemMaintenance ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${notifications.systemMaintenance ? 'right-0.5' : 'left-0.5'}`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Weekly Report</p>
                    <p className="text-[9px] text-slate-500">Traffic analytics summary</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('weeklyReport')}
                    className={`w-9 h-5 rounded-full relative transition-colors ${notifications.weeklyReport ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${notifications.weeklyReport ? 'right-0.5' : 'left-0.5'}`}></div>
                  </button>
                </div>
              </div>
            </section>

            {/* Quick Stats */}
            <section className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-5 border border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">speed</span>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Quick Stats</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/50 rounded-xl">
                  <p className="text-2xl font-black text-primary">1,248</p>
                  <p className="text-[9px] text-slate-500 uppercase">Incidents Resolved</p>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-xl">
                  <p className="text-2xl font-black text-primary">99.98%</p>
                  <p className="text-[9px] text-slate-500 uppercase">Uptime</p>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-xl">
                  <p className="text-2xl font-black text-primary">2.4s</p>
                  <p className="text-[9px] text-slate-500 uppercase">Avg Response</p>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-xl">
                  <p className="text-2xl font-black text-primary">142</p>
                  <p className="text-[9px] text-slate-500 uppercase">Active Cameras</p>
                </div>
              </div>
            </section>

            {/* Geographic Zones */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-primary/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Geographic Zones</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-primary">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold">Central Business District</p>
                    <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-black uppercase">Active</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-3">Congestion Pricing Level: 3 (Peak)</p>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full">
                    <div className="w-3/4 h-full bg-primary rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-50 rounded-xl transition-all border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400 text-lg">block</span>
                      <span className="text-xs font-bold">Restricted Areas (4)</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-50 rounded-xl transition-all border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400 text-lg">payments</span>
                      <span className="text-xs font-bold">Pricing Policy Editor</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
                  </button>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Sector Capacity Load</p>
                  <div className="flex gap-1 h-8 items-end">
                    <div className="flex-1 bg-green-200 rounded-sm" style={{ height: '40%' }}></div>
                    <div className="flex-1 bg-green-300 rounded-sm" style={{ height: '60%' }}></div>
                    <div className="flex-1 bg-yellow-400 rounded-sm" style={{ height: '85%' }}></div>
                    <div className="flex-1 bg-primary rounded-sm" style={{ height: '95%' }}></div>
                    <div className="flex-1 bg-green-300 rounded-sm" style={{ height: '50%' }}></div>
                  </div>
                </div>
              </div>
            </section>

            {/* System Health */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-primary/10">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">System Health Monitor</h2>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-primary">hub</span>
                      <p className="text-xs font-bold">Active Grid Nodes</p>
                    </div>
                    <span className="text-xs font-mono font-bold">12,402 / 12,405</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-primary">router</span>
                      <p className="text-xs font-bold">Inter-Center Latency</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-green-600">8.4ms</span>
                  </div>
                </div>
                <div className="p-4 bg-primary/90 rounded-xl text-white relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Video Log Cloud Storage</p>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-xl font-black">42.8 TB</span>
                    <span className="text-[9px] font-bold opacity-60">84% FULL</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[84%] h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                  </div>
                  <button className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                    Clear Cache &gt; 90 Days
                  </button>
                </div>
              </div>
            </section>

            {/* Control Quick Actions */}
            <div className="space-y-3">
              <button className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">emergency_share</span>
                Deploy Global Override
              </button>
              <p className="text-[9px] text-center text-slate-400 font-medium px-4">
                Authorized use only. Global overrides impact all metropolitan zones simultaneously.
              </p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-500/10 text-red-500 rounded-xl font-bold text-xs hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Logout from Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;