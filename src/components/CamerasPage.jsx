import React, { useState, useEffect } from 'react';

const CamerasPage = () => {
  const cameraList = [
    { id: 1, name: "Camera 1 - Nguyễn Văn Linh", key: "Camera 1 - Giao lộ Nguyễn Văn Linh" },
    { id: 2, name: "Camera 2 - Hoàng Diệu", key: "Camera 2 - Hoàng Diệu" },
    { id: 3, name: "Camera 3 - Nguyễn Tri Phương", key: "Camera 3 - Nguyễn Tri Phương" },
    { id: 4, name: "Camera 4 - lê duẫn", key: "Camera 4 - lê duẫn" },
  ];

  const [trafficData, setTrafficData] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:5000/traffic')   // thay bằng domain khi deploy
        .then(res => res.json())
        .then(data => setTrafficData(data))
        .catch(() => {});
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 bg-gray-950 min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-8 text-center">📹 AI Traffic Monitoring - Đà Nẵng</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {cameraList.map(cam => {
          const data = trafficData[cam.key] || {};
          return (
            <div key={cam.id} className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-700 shadow-2xl">
              {/* Video Stream */}
              <div className="relative aspect-video bg-black">
                <img 
                  src={`http://localhost:5000/video/${encodeURIComponent(cam.key)}`}
                  alt={cam.name}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 left-4 bg-black/70 px-4 py-1.5 rounded-xl flex items-center gap-2 text-sm font-bold">
                  <span className="text-red-500 animate-pulse">●</span> LIVE
                </div>
              </div>

              {/* Thông tin */}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">{cam.name}</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-gray-400 text-sm">Ô tô</p>
                    <p className="text-3xl font-bold text-blue-400">{data.cars || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Xe máy</p>
                    <p className="text-3xl font-bold text-red-400">{data.motorcycles || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Trạng thái</p>
                    <p className={`text-xl font-bold ${
                      data.traffic === 'TAC NGHEN' ? 'text-red-500' : 
                      data.traffic === 'DONG' ? 'text-orange-500' : 'text-green-500'
                    }`}>
                      {data.traffic || 'Đang tải...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CamerasPage;