import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const AnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('realtime');
  const [comparisonType, setComparisonType] = useState('yesterday');
  const [isLoading, setIsLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('traffic_flow');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  const [kpiData, setKpiData] = useState({
    avgSpeed: 42.5,
    congestionIndex: 2.4,
    incidents: 14,
    activeVehicles: 128492,
    prevAvgSpeed: 38.2,
    prevCongestionIndex: 2.6,
    prevIncidents: 18,
    prevActiveVehicles: 118234
  });

  // Historical data for charts
  const [trafficData, setTrafficData] = useState([]);
  const [hourlyDistribution, setHourlyDistribution] = useState([]);
  const [congestionHeatmap, setCongestionHeatmap] = useState([]);
  const [radarData, setRadarData] = useState([]);

  // Generate mock data
  useEffect(() => {
    const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    const traffic = hours.map((hour, idx) => ({
      hour,
      actual: Math.floor(30 + Math.sin(idx * 0.5) * 25 + Math.random() * 10),
      historical: Math.floor(32 + Math.sin(idx * 0.5) * 22 + Math.random() * 8),
      predicted: Math.floor(35 + Math.sin(idx * 0.5) * 28 + Math.random() * 12)
    }));
    setTrafficData(traffic);

    const distribution = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => ({
      day,
      volume: Math.floor(65 + Math.random() * 30),
      incidents: Math.floor(3 + Math.random() * 12)
    }));
    setHourlyDistribution(distribution);

    const heatmap = [
      { zone: 'Central Business District', congestion: 8.2, speed: 18.5, volume: 12450 },
      { zone: 'Northern Corridor', congestion: 7.8, speed: 22.3, volume: 9820 },
      { zone: 'Eastern District', congestion: 5.4, speed: 34.2, volume: 7650 },
      { zone: 'Western District', congestion: 6.2, speed: 28.7, volume: 8430 },
      { zone: 'Southern District', congestion: 4.8, speed: 41.5, volume: 6340 },
      { zone: 'Airport Area', congestion: 7.2, speed: 25.4, volume: 7210 }
    ];
    setCongestionHeatmap(heatmap);

    setRadarData([
      { metric: 'Speed', current: 72, target: 85, lastWeek: 68 },
      { metric: 'Flow', current: 68, target: 80, lastWeek: 62 },
      { metric: 'Safety', current: 88, target: 95, lastWeek: 85 },
      { metric: 'Efficiency', current: 64, target: 75, lastWeek: 58 },
      { metric: 'Coverage', current: 92, target: 98, lastWeek: 90 },
      { metric: 'Response', current: 78, target: 90, lastWeek: 72 }
    ]);
  }, []);

  const stats = useMemo(() => [
    { 
      label: 'Average Speed', 
      value: `${kpiData.avgSpeed.toFixed(1)} km/h`, 
      change: `${((kpiData.avgSpeed - kpiData.prevAvgSpeed) / kpiData.prevAvgSpeed * 100).toFixed(1)}%`, 
      changeType: kpiData.avgSpeed > kpiData.prevAvgSpeed ? 'positive' : 'negative', 
      icon: 'speed',
      trend: kpiData.avgSpeed - kpiData.prevAvgSpeed
    },
    { 
      label: 'Congestion Index', 
      value: `${kpiData.congestionIndex.toFixed(1)} / 10`, 
      change: `${((kpiData.congestionIndex - kpiData.prevCongestionIndex) / kpiData.prevCongestionIndex * 100).toFixed(1)}%`, 
      changeType: kpiData.congestionIndex < kpiData.prevCongestionIndex ? 'positive' : 'negative', 
      icon: 'traffic',
      trend: -(kpiData.congestionIndex - kpiData.prevCongestionIndex)
    },
    { 
      label: 'Incidents (24h)', 
      value: kpiData.incidents.toString(), 
      change: kpiData.incidents < kpiData.prevIncidents ? `-${kpiData.prevIncidents - kpiData.incidents}` : `+${kpiData.incidents - kpiData.prevIncidents}`,
      changeType: kpiData.incidents < kpiData.prevIncidents ? 'positive' : 'negative', 
      icon: 'report_problem',
      trend: kpiData.prevIncidents - kpiData.incidents
    },
    { 
      label: 'Active Vehicles', 
      value: kpiData.activeVehicles.toLocaleString(), 
      change: `+${((kpiData.activeVehicles - kpiData.prevActiveVehicles) / 1000).toFixed(1)}k`, 
      changeType: 'positive', 
      icon: 'groups',
      trend: kpiData.activeVehicles - kpiData.prevActiveVehicles
    }
  ], [kpiData]);

  const getChangeColor = (type) => {
    if (type === 'positive') return 'text-emerald-600 bg-emerald-50';
    if (type === 'negative') return 'text-red-600 bg-red-50';
    return 'text-slate-500 bg-slate-50';
  };

  const getChangeIcon = (type) => {
    if (type === 'positive') return 'trending_up';
    if (type === 'negative') return 'trending_down';
    return 'remove';
  };

  const getCongestionColor = (level) => {
    if (level >= 8) return 'bg-red-500';
    if (level >= 6) return 'bg-amber-500';
    if (level >= 4) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const exportAnalytics = useCallback((format = 'json') => {
    const exportData = {
      timestamp: new Date().toISOString(),
      period: selectedPeriod,
      comparison: comparisonType,
      kpi: kpiData,
      charts: {
        trafficData,
        hourlyDistribution,
        congestionHeatmap,
        radarData
      },
      metadata: {
        generatedBy: 'Traffic Analytics Engine v2.0',
        dateRange: {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString()
        }
      }
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `traffic_analytics_${new Date().toISOString().slice(0, 19)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV export
      const csvRows = [
        ['Metric', 'Current Value', 'Previous Value', 'Change', 'Change %'],
        ...stats.map(s => [s.label, s.value, s.trend, s.change, s.changeType])
      ];
      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `traffic_analytics_${new Date().toISOString().slice(0, 19)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    setShowExportModal(false);
    // Show success toast (you can implement this)
  }, [selectedPeriod, comparisonType, kpiData, trafficData, hourlyDistribution, congestionHeatmap, radarData, dateRange, stats]);

  const refreshData = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setKpiData(prev => ({
        ...prev,
        avgSpeed: prev.avgSpeed + (Math.random() - 0.5) * 3,
        congestionIndex: Math.max(1, Math.min(10, prev.congestionIndex + (Math.random() - 0.5) * 0.5)),
        incidents: Math.max(0, prev.incidents + Math.floor(Math.random() * 5) - 2),
        activeVehicles: prev.activeVehicles + Math.floor(Math.random() * 5000) - 2500
      }));
      setIsLoading(false);
    }, 800);
  }, []);

  const COLORS = ['#7b00ff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  return (
    <div className="h-full overflow-y-auto bg-[#f7f5f8] p-6 space-y-8">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 sticky top-0 bg-[#f7f5f8] z-10 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter text-slate-900">Traffic Analytics Engine</h1>
          <p className="text-slate-500 text-sm">Comprehensive multi-vector analysis of metropolitan traffic patterns.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setSelectedPeriod('realtime')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                selectedPeriod === 'realtime'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-500 hover:text-primary'
              }`}
            >
              Real-time
            </button>
            <button
              onClick={() => setSelectedPeriod('historical')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                selectedPeriod === 'historical'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-500 hover:text-primary'
              }`}
            >
              Historical
            </button>
            <button
              onClick={() => setSelectedPeriod('forecast')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                selectedPeriod === 'forecast'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-500 hover:text-primary'
              }`}
            >
              Forecast
            </button>
          </div>
          <button 
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold shadow-sm hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-sm ${isLoading ? 'animate-spin' : ''}`}>
              {isLoading ? 'progress_activity' : 'refresh'}
            </span>
            {isLoading ? 'Updating...' : 'Sync'}
          </button>
          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 bg-primary px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export
          </button>
        </div>
      </section>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${getChangeColor(stat.changeType)}`}>
                <span className="material-symbols-outlined text-xs">{getChangeIcon(stat.changeType)}</span>
                {stat.change}
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${stat.changeType === 'positive' ? 'bg-emerald-500' : stat.changeType === 'negative' ? 'bg-red-500' : 'bg-slate-400'}`}
                style={{ width: `${Math.min(100, Math.abs(stat.trend) / 10 * 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </section>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Flow Chart - Enhanced */}
        <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Traffic Flow Velocity</h2>
              <p className="text-xs text-slate-500 font-medium">Real-time throughput vs. historical average</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="text-xs font-bold text-slate-600">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                <span className="text-xs font-bold text-slate-600">Historical</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary/40 border border-primary border-dashed"></span>
                <span className="text-xs font-bold text-slate-600">Predicted</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Area type="monotone" dataKey="historical" fill="#cbd5e1" stroke="#94a3b8" fillOpacity={0.3} name="Historical" />
                <Line type="monotone" dataKey="actual" stroke="#7b00ff" strokeWidth={2} dot={{ r: 3 }} name="Actual" />
                <Line type="monotone" dataKey="predicted" stroke="#7b00ff" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Predicted" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center p-2 bg-slate-50 rounded-lg">
              <p className="text-[10px] text-slate-500 uppercase">Peak Hour</p>
              <p className="text-sm font-bold text-slate-900">17:00 - 19:00</p>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded-lg">
              <p className="text-[10px] text-slate-500 uppercase">Avg Throughput</p>
              <p className="text-sm font-bold text-slate-900">2,845 veh/h</p>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded-lg">
              <p className="text-[10px] text-slate-500 uppercase">Congestion Window</p>
              <p className="text-sm font-bold text-slate-900">4.2 hrs</p>
            </div>
          </div>
        </section>

        {/* Predictive Analysis - Enhanced */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <h2 className="text-sm font-bold uppercase tracking-widest">AI Predictive Trends</h2>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-xs text-white/70 mb-1">Expected Peak in 2.5 hours</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black">74%</span>
                  <span className="text-xs font-bold text-white/90">Load Factor</span>
                </div>
                <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '74%' }}></div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">psychology</span>
                  AI Advisory
                </h4>
                <p className="text-xs leading-relaxed text-white/80">
                  Significant bottleneck predicted at Northern Corridor intersection due to upcoming public event.
                  Recommend diverting 15% of heavy freight to secondary arterial routes.
                </p>
              </div>
              <div className="flex gap-2">
                {['Confidence', 'Accuracy', 'Stability'].map((item, idx) => (
                  <div key={idx} className="flex-1 text-center">
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-white" style={{ width: `${[85, 78, 92][idx]}%` }}></div>
                    </div>
                    <p className="text-[8px] uppercase tracking-wider text-white/50">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Animated Background */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-primary/30 rounded-full blur-3xl"></div>
        </section>
      </div>

      {/* Weekly Distribution & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Traffic Distribution */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Weekly Distribution</h2>
              <p className="text-xs text-slate-500">Traffic volume by day of week</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium px-3 py-1.5">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="volume" fill="#7b00ff" radius={[4, 4, 0, 0]} name="Volume (x1000)" />
                <Bar dataKey="incidents" fill="#ef4444" radius={[4, 4, 0, 0]} name="Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Congestion Heatmap */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Congestion Heatmap</h2>
              <p className="text-xs text-slate-500">Zone-wise congestion intensity</p>
            </div>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[9px] text-slate-500">Low</span>
              <span className="w-2 h-2 rounded-full bg-yellow-500 ml-2"></span>
              <span className="text-[9px] text-slate-500">Moderate</span>
              <span className="w-2 h-2 rounded-full bg-red-500 ml-2"></span>
              <span className="text-[9px] text-slate-500">High</span>
            </div>
          </div>
          <div className="space-y-3">
            {congestionHeatmap.map((zone, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-32 text-xs font-medium text-slate-700 truncate">{zone.zone}</div>
                <div className="flex-1">
                  <div className="h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                    <div 
                      className={`h-full ${getCongestionColor(zone.congestion)} transition-all duration-500 flex items-center justify-end pr-2`}
                      style={{ width: `${(zone.congestion / 10) * 100}%` }}
                    >
                      <span className="text-[10px] font-bold text-white">{zone.congestion.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="w-16 text-right">
                  <span className="text-xs font-bold text-slate-700">{zone.speed.toFixed(1)} km/h</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 mb-4">Performance Metrics</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#6a84a5" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                <Radar name="Current" dataKey="current" stroke="#6f00e6" fill="#7b00ff" fillOpacity={0.3} />
                <Radar name="Target" dataKey="target" stroke="#010101" fill="#cbd5e1" fillOpacity={0.2} />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Historical Comparison - Enhanced */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Historical Comparison</h2>
            <select
              value={comparisonType}
              onChange={(e) => setComparisonType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider px-3 py-1.5 focus:ring-primary"
            >
              <option value="yesterday">Vs. Yesterday</option>
              <option value="lastweek">Vs. Last Week</option>
              <option value="lastmonth">Vs. Last Month</option>
              <option value="custom">Custom Date</option>
            </select>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all">
              <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm">
                <span className="material-symbols-outlined text-primary">analytics</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Volume Delta</span>
                  <span className="text-sm font-bold text-emerald-600">+4,210 units</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[70%] rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all">
              <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm">
                <span className="material-symbols-outlined text-primary">timer</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Commute Time Variance</span>
                  <span className="text-sm font-bold text-red-600">+12.4 min</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 w-[85%] rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all">
              <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm">
                <span className="material-symbols-outlined text-primary">airplanemode_active</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">Emissions Impact</span>
                  <span className="text-sm font-bold text-emerald-600">-8.2%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[42%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mini Stats Bento */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-5 flex flex-col justify-between hover:scale-[1.02] transition-transform">
            <span className="material-symbols-outlined text-primary text-3xl">map</span>
            <div className="mt-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Hotspot Intensity</p>
              <h3 className="text-2xl font-bold mt-1">Level 4</h3>
              <p className="text-[10px] text-slate-400 mt-2">Northern Corridor</p>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-primary">electric_car</span>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+3.2%</span>
            </div>
            <div className="mt-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">EV Adoption Rate</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">22.8%</h3>
              <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[22.8%] rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-primary">cloud</span>
              <span className="text-[9px] font-bold text-slate-400">Good</span>
            </div>
            <div className="mt-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">AQI Impact</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">42 PM2.5</h3>
              <p className="text-[9px] text-slate-400 mt-1">-5 from yesterday</p>
            </div>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex flex-col justify-between hover:bg-primary/10 transition-all">
            <span className="material-symbols-outlined text-primary">public</span>
            <div className="mt-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-primary">Node Stability</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">99.9%</h3>
              <div className="flex items-center gap-1 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[8px] text-slate-500">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Export Analytics</h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">Choose your export format</p>
            <div className="space-y-3">
              <button 
                onClick={() => exportAnalytics('json')}
                className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">code</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">JSON Format</p>
                    <p className="text-xs text-slate-500">Complete dataset for developers</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
              </button>
              <button 
                onClick={() => exportAnalytics('csv')}
                className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">table_rows</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">CSV Format</p>
                    <p className="text-xs text-slate-500">Spreadsheet compatible</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
              </button>
              <button 
                onClick={() => exportAnalytics('pdf')}
                className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all opacity-50 cursor-not-allowed"
                disabled
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">picture_as_pdf</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">PDF Report</p>
                    <p className="text-xs text-slate-500">Coming soon</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400">lock</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;