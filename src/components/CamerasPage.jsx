import React, { useState } from 'react';

const CamerasPage = () => {
  const [selectedCamera, setSelectedCamera] = useState('CAM-084');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [layout, setLayout] = useState('grid');
  const [sortBy, setSortBy] = useState('default');
  const [filterCongestion, setFilterCongestion] = useState('all');

  const cameras = [
    {
      id: "sJvEFrG0wq0",
      title: "Quang Trung - Đà Nẵng",
      shortTitle: "Quang Trung",
      location: "Đà Nẵng",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdBoTr_Sdn6MeagnyrXmeqglDYMA6-nrlCzg&s",
      congestion: "heavy",
      congestionText: "High Traffic (88%)",
      camId: "CAM-084"
    },
    {
      id: "G_G8A6JU_LI",
      title: "Hải Phòng - Đà Nẵng",
      shortTitle: "Hải Phòng",
      location: "Đà Nẵng",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNjMHe1ZAhZCHtRe8Vqr89t8ZuU7G6mvHyOA&s",
      congestion: "moderate",
      congestionText: "Moderate (54%)",
      camId: "CAM-021"
    },
    {
      id: "cyRo5UgQU0A",
      title: "Lê Văn Lương - Hà Nội",
      shortTitle: "Lê Văn Lương",
      location: "Hà Nội",
      image: "https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/04/anh-ha-noi.jpg",
      congestion: "light",
      congestionText: "Light (22%)",
      camId: "CAM-115"
    },
    {
      id: "8JCk5M_xrBs",
      title: "Walworth Road - London",
      shortTitle: "Walworth Road",
      location: "London",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0Waity-g2jHb1xt_ljrEYshujmouHrI9F0Q&s",
      congestion: "moderate",
      congestionText: "Moderate (48%)",
      camId: "CAM-042"
    },
    {
      id: "6dp-bvQ7RWo",
      title: "Tokyo Shinjuku - Japan",
      shortTitle: "Shinjuku",
      location: "Japan",
      image: "https://t4.ftcdn.net/jpg/02/51/12/11/360_F_251121174_5xQyUCqSrkswyLHbM9Ne8DQ8Qb0o1HGw.jpg",
      congestion: "heavy",
      congestionText: "High (82%)",
      camId: "CAM-107"
    },
    {
      id: "DjdUEyjx8GM",
      title: "Shinjuku Kabukicho - Japan",
      shortTitle: "Kabukicho",
      location: "Japan",
      image: "https://media.istockphoto.com/id/615236798/photo/tokyo-tower-night-view-of-tokyo-metropolitan-city.jpg?s=612x612&w=0&k=20&c=evXG6kRJ34pwbpJpV0qkW5CnwmEf_-4V6Ec_HdXner8=",
      congestion: "light",
      congestionText: "Light (15%)",
      camId: "CAM-093"
    },
    {
      id: "fUsJZTHeZn4",
      title: "St. Petersburg - Russia",
      shortTitle: "St. Petersburg",
      location: "Russia",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_aLTnGtoVoBGLyoPlx7nEpmkwvOtzpTigBg&s",
      congestion: "moderate",
      congestionText: "Moderate (45%)",
      camId: "CAM-156"
    },
    {
      id: "u7GyFcQJs98",
      title: "Southampton - UK",
      shortTitle: "Southampton",
      location: "UK",
      image: "https://www.centreforcities.org/wp-content/uploads/2021/08/Southampton-tile.png",
      congestion: "light",
      congestionText: "Light (28%)",
      camId: "CAM-178"
    }
  ];

  const getFilteredCameras = () => {
    let filtered = [...cameras];
    
    if (filterCongestion !== 'all') {
      filtered = filtered.filter(cam => cam.congestion === filterCongestion);
    }
    
    if (sortBy === 'congestion') {
      const order = { 'heavy': 0, 'moderate': 1, 'light': 2 };
      filtered.sort((a, b) => order[a.congestion] - order[b.congestion]);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.shortTitle.localeCompare(b.shortTitle));
    }
    
    return filtered;
  };

  const getCongestionColor = (congestion) => {
    switch(congestion) {
      case 'heavy': return 'text-red-500';
      case 'moderate': return 'text-amber-500';
      case 'light': return 'text-green-500';
      default: return 'text-slate-300';
    }
  };

  const getCongestionBg = (congestion) => {
    switch(congestion) {
      case 'heavy': return 'bg-red-500/20';
      case 'moderate': return 'bg-amber-500/20';
      case 'light': return 'bg-green-500/20';
      default: return 'bg-slate-500/20';
    }
  };

  const showFullScreenVideo = (camera) => {
    setSelectedVideo(camera);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  const filteredCameras = getFilteredCameras();

  return (
    <div className="h-full bg-background-light dark:bg-background-dark flex flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area - Chiếm toàn bộ không gian */}
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-8">
          <div className="flex flex-col gap-8 max-w-[2000px] mx-auto">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setLayout('grid')}
                  className={`flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold border transition-all ${
                    layout === 'grid' 
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30' 
                      : 'bg-white dark:bg-slate-800 border-primary/10 hover:border-primary/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">grid_view</span>
                  Grid
                </button>
                <button 
                  onClick={() => setLayout('list')}
                  className={`flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold border transition-all ${
                    layout === 'list' 
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30' 
                      : 'bg-white dark:bg-slate-800 border-primary/10 hover:border-primary/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">view_list</span>
                  List
                </button>
                
                <div className="w-px h-8 bg-primary/10 mx-3"></div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-primary/10 rounded-lg px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary/30"
                >
                  <option value="default">Default sort</option>
                  <option value="congestion">By congestion</option>
                  <option value="name">By name</option>
                </select>
                
                <select
                  value={filterCongestion}
                  onChange={(e) => setFilterCongestion(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-primary/10 rounded-lg px-5 py-3 text-sm font-bold focus:outline-none focus:border-primary/30"
                >
                  <option value="all">All cameras</option>
                  <option value="heavy">Heavy traffic</option>
                  <option value="moderate">Moderate traffic</option>
                  <option value="light">Light traffic</option>
                </select>
              </div>
              
              <button className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all">
                <span className="material-symbols-outlined text-lg">add</span>
                Add Feed
              </button>
            </div>

            {/* Camera Grid - PHÓNG TO 2 CỘT x 4 HÀNG */}
            {layout === 'grid' ? (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {filteredCameras.map((camera, index) => (
    <div
      key={index}
      className="group relative overflow-hidden rounded-2xl bg-slate-900 border-2 border-primary/20 aspect-video shadow-2xl cursor-pointer hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300"
      onClick={() => {
        setSelectedCamera(camera.camId);
        showFullScreenVideo(camera);
      }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url('${camera.image}')` }}
      ></div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent"></div>

      <div className="absolute top-5 left-5 flex items-center gap-3">
        <span className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span> LIVE
        </span>
        <span className="rounded-lg bg-black/60 px-4 py-1.5 text-xs font-bold text-white">
          {camera.camId}
        </span>
      </div>

      <div className={`absolute top-5 right-5 rounded-xl ${getCongestionBg(camera.congestion)} px-4 py-1.5`}>
        <span className={`text-xs font-bold ${getCongestionColor(camera.congestion)}`}>
          {camera.congestionText}
        </span>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <h3 className="text-xl font-bold text-white">{camera.shortTitle}</h3>
        <p className="text-sm text-white/70">{camera.location}</p>
      </div>
    </div>
  ))}
</div>
            ) : (
              /* List View */
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-primary/10 overflow-hidden">
                {filteredCameras.map((camera, index) => (
                  <div
                    key={index}
                    className="flex items-center p-4 border-b border-primary/5 last:border-0 hover:bg-primary/5 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedCamera(camera.camId);
                      showFullScreenVideo(camera);
                    }}
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden mr-4">
                      <img src={camera.image} alt={camera.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[8px] font-bold text-white">
                          <span className="h-1 w-1 rounded-full bg-white animate-pulse"></span> LIVE
                        </span>
                        <span className="text-xs font-bold text-primary">{camera.camId}</span>
                      </div>
                      <h3 className="font-bold">{camera.title}</h3>
                      <p className={`text-xs ${getCongestionColor(camera.congestion)}`}>
                        {camera.congestionText}
                      </p>
                    </div>
                    <button className="ml-4 p-2 hover:bg-primary/10 rounded-lg">
                      <span className="material-symbols-outlined text-primary">play_arrow</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Hiển thị số lượng camera */}
            <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">
              Showing 8 of {cameras.length} cameras
            </div>
          </div>
        </main>

        {/* Right Side - Camera Details & Stats */}
        <aside className="w-80 shrink-0 border-l border-primary/10 bg-white dark:bg-background-dark p-5 overflow-y-auto">
          <div className="flex flex-col gap-6">
            {/* Traffic Flow Percentage */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Traffic Flow</h3>
              <div className="flex flex-col gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Downtown Grid</span>
                    <span className="text-primary">68%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-primary/10">
                    <div className="h-full w-[68%] rounded-full bg-primary"></div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Financial District</span>
                    <span className="text-green-500">42%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-primary/10">
                    <div className="h-full w-[42%] rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Harbor Bridge</span>
                    <span className="text-red-500">94%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-primary/10">
                    <div className="h-full w-[94%] rounded-full bg-red-500"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Camera Detail */}
            <div className="space-y-3 pt-4 border-t border-primary/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Focus Detail: {selectedCamera}</h3>
              <div className="rounded-xl overflow-hidden shadow-inner border border-primary/5">
                <img 
                  alt="Zoomed view" 
                  className="w-full h-32 object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHAO4up43wXZfhCI8520md9dSjHP4iDFEPbxlATukGpy0pBcsg0NwuBBmDLygw3nhcoo2El56dmaQ5-qDqi21XK0JsckqvzNPaq3kLibO2mWs62Vjij2Hl1g7kIMlOlyKVgwHRwF2Nv6okZM9_qmYnpFIoJS6bi1oRVbv573flnK64JE3tszWYbBehWEHUjNb5Tkb4Mgt1VUV-AkEp3p9fdgMbbpvnegg-rPmwY9M_ELBy4eks6z8me91PG7ta07a7h0zbtaERD88"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-primary/5 p-3">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Vehicle Count</p>
                  <p className="text-xl font-black text-primary">124/min</p>
                </div>
                <div className="rounded-lg bg-primary/5 p-3">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Avg Speed</p>
                  <p className="text-xl font-black text-primary">18 mph</p>
                </div>
              </div>
              <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                  <span>Peak expected in 45m</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">weather_mix</span>
                  <span>Light rain affecting grip</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">history</span>
                  <span>12% increase vs yesterday</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button className="w-full rounded-lg bg-primary/10 border border-primary/20 py-2.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all">
                Export Feed Data
              </button>
              <button className="w-full rounded-lg bg-slate-900 py-2.5 text-xs font-bold text-white dark:bg-slate-700">
                Recalibrate Sensors
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Video Modal với nút Back */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
          <div className="relative w-[95vw] h-[95vh] max-w-7xl">
            {/* Nút Back */}
            <button
              onClick={closeVideoModal}
              className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-primary/80 transition-all z-20 border border-white/20"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="text-sm font-bold">Back to Cameras</span>
            </button>
            
            {/* Nút Close */}
            <button
              onClick={closeVideoModal}
              className="absolute top-4 right-4 text-white hover:text-primary transition-colors z-20 bg-black/50 backdrop-blur-md rounded-full p-2 border border-white/20"
            >
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
            
            {/* Thông tin video */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
              <p className="text-white font-bold">
                {selectedVideo.title} - {selectedVideo.location}
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #7b00ff33;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #7b00ff66;
        }
      `}</style>
    </div>
  );
};

export default CamerasPage;