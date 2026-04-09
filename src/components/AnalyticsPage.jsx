import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const AnalyticsPage = () => {
  const [trafficData, setTrafficData] = useState([]);        // Dữ liệu từ Flask
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Lấy dữ liệu realtime từ Flask
  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        const res = await fetch('http://localhost:5000/traffic');
        if (res.ok) {
          const data = await res.json();

          const formattedData = Object.keys(data).map(cameraName => ({
            camera: cameraName.split(' - ')[1] || cameraName,
            cars: data[cameraName].cars || 0,
            motorcycles: data[cameraName].motorcycles || 0,
            total: (data[cameraName].cars || 0) + (data[cameraName].motorcycles || 0),
            traffic: data[cameraName].traffic || 'THONG THOANG',
            speed: ((data[cameraName].speed_car || 0) + (data[cameraName].speed_motor || 0)) / 2 || 0,
          }));

          setTrafficData(formattedData);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu traffic:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrafficData();
    const interval = setInterval(fetchTrafficData, 2000);

    return () => clearInterval(interval);
  }, []);

  // Tính KPI từ dữ liệu thực
  const kpiData = useMemo(() => {
    if (trafficData.length === 0) {
      return {
        avgSpeed: 0,
        totalVehicles: 0,
        congestionCount: 0,
        activeCameras: 0,
        congestionRate: 0
      };
    }

    const totalVehicles = trafficData.reduce((sum, cam) => sum + cam.total, 0);
    const avgSpeed = trafficData.reduce((sum, cam) => sum + cam.speed, 0) / trafficData.length || 0;
    const congestionCount = trafficData.filter(cam => cam.traffic === 'TAC NGHEN').length;

    return {
      avgSpeed: Number(avgSpeed.toFixed(1)),
      totalVehicles,
      congestionCount,
      activeCameras: trafficData.length,
      congestionRate: Number(((congestionCount / trafficData.length) * 100).toFixed(1))
    };
  }, [trafficData]);

  // Dữ liệu cho biểu đồ cột
  const barChartData = useMemo(() => {
    return trafficData.map(cam => ({
      name: cam.camera.length > 15 ? cam.camera.substring(0, 15) + '...' : cam.camera,
      Ôtô: cam.cars,
      'Xe máy': cam.motorcycles,
      'Tốc độ': Math.round(cam.speed)
    }));
  }, [trafficData]);

  // Dữ liệu cho biểu đồ tròn
  const pieData = useMemo(() => [
    { name: 'Ô tô', value: trafficData.reduce((sum, cam) => sum + cam.cars, 0) },
    { name: 'Xe máy', value: trafficData.reduce((sum, cam) => sum + cam.motorcycles, 0) }
  ], [trafficData]);

  const COLORS = ['#3b82f6', '#ef4444'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-slate-500">
        Đang tải dữ liệu phân tích...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f7f5f8] p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Traffic Analytics</h1>
          <p className="text-slate-500">
            Dữ liệu thời gian thực từ 4 camera • Cập nhật: {lastUpdated?.toLocaleTimeString('vi-VN')}
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-5 py-2 bg-white rounded-xl shadow-sm hover:bg-slate-50 flex items-center gap-2 transition-all"
        >
          <span className="material-symbols-outlined">refresh</span>
          Làm mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-500">Tổng phương tiện</p>
          <h3 className="text-4xl font-bold mt-2">{kpiData.totalVehicles.toLocaleString()}</h3>
          <p className="text-emerald-600 text-sm mt-1">Đang theo dõi</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-500">Tốc độ trung bình</p>
          <h3 className="text-4xl font-bold mt-2">{kpiData.avgSpeed} km/h</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-500">Camera đang tắc</p>
          <h3 className="text-4xl font-bold mt-2 text-red-600">{kpiData.congestionCount}</h3>
          <p className="text-red-600 text-sm mt-1">/{kpiData.activeCameras} camera</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-500">Tỷ lệ tắc nghẽn</p>
          <h3 className="text-4xl font-bold mt-2">{kpiData.congestionRate}%</h3>
        </div>
      </div>

      {/* Biểu đồ cột so sánh các camera */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">Phương tiện theo từng Camera</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Ôtô" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Xe máy" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Biểu đồ tròn + Trạng thái camera */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ tròn */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">Tỷ lệ phương tiện toàn hệ thống</h2>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="90%" height="90%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={140}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trạng thái các camera */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">Trạng thái hiện tại</h2>
          <div className="space-y-4">
            {trafficData.map((cam, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                <div>
                  <p className="font-semibold text-slate-900">{cam.camera}</p>
                  <p className="text-sm text-slate-500">
                    {cam.cars} ô tô • {cam.motorcycles} xe máy • {cam.speed.toFixed(0)} km/h
                  </p>
                </div>
                <div className={`px-5 py-2 rounded-full text-sm font-bold ${
                  cam.traffic === 'TAC NGHEN' ? 'bg-red-100 text-red-700' :
                  cam.traffic === 'DONG' ? 'bg-orange-100 text-orange-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {cam.traffic}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;