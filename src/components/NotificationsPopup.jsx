import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const  NotificationsPopup = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const alerts = [
    {
      id: 1,
      type: "urgent",
      title: "Major Accident on I-95 North",
      description:
        "Multi-vehicle collision reported at Mile Marker 142. Emergency services are on-site. Expect severe 45-60 minute delays in the northbound corridor.",
      time: "2 min ago",
      icon: "warning",
      badge: "Urgent",
    },
    {
      id: 2,
      type: "info",
      title: "AI Route Optimization Complete",
      description:
        "System adjusted signal timings in Zone 4. Automated rerouting successful. North Metro traffic flow improved by 14.5%.",
      time: "2m ago",
      icon: "settings_suggest",
    },
    {
      id: 3,
      type: "weather",
      title: "Weather Alert: Heavy Rain Warning",
      description:
        "Visibility reduced below 200m in the Downtown core. Smart warning beacons activated. Recommended speed limit reduced to 35mph.",
      time: "15m ago",
      icon: "cloudy_snowing",
    },
  ];

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [isOpen]);

  if (!isOpen) return null;

  const getColor = (type) => {
    switch (type) {
      case "urgent":
        return "bg-red-100 text-red-600";
      case "weather":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-violet-100 text-violet-600";
    }
  };

  const handleViewAll = () => {
    onClose(); // Đóng popup
    navigate('/notifications'); // Chuyển sang trang notifications
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-4xl max-h-[90vh] bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 flex flex-col overflow-hidden">

          {/* HEADER */}
          <div className="px-8 py-6 flex items-center justify-between border-b border-violet-500/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-primary">
                  notifications_active
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900">
                   Notifications
                </h2>
                <p className="text-[12px] uppercase tracking-widest text-slate-500 font-bold">
                  Real-time system updates & mission critical data
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-violet-50 text-slate-400 hover:text-primary transition"
            >
              <span className="material-symbols-outlined text-2xl">
                close
              </span>
            </button>
          </div>

          {/* LIST */}
          <div className="p-8 flex flex-col gap-6 overflow-y-auto">

            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="group p-6 rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-xl transition-all"
              >
                <div className="flex gap-6">
                  
                  {/* ICON */}
                  <div
                    className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center ${getColor(
                      alert.type
                    )}`}
                  >
                    <span className="material-symbols-outlined text-3xl">
                      {alert.icon}
                    </span>
                  </div>

                  {/* CONTENT */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-extrabold text-xl text-slate-900">
                        {alert.title}
                      </h4>

                      {alert.badge ? (
                        <span className="text-xs font-black text-red-500 bg-red-50 px-3 py-1 rounded-full uppercase border border-red-100">
                          {alert.badge}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                          {alert.time}
                        </span>
                      )}
                    </div>

                    <p className="text-lg text-slate-600 leading-relaxed mb-4">
                      {alert.description}
                    </p>

                    {alert.type === "urgent" && (
                      <button 
                        onClick={() => {
                          onClose();
                          navigate('/map');
                        }}
                        className="flex items-center gap-3 text-primary text-sm font-black px-5 py-3 bg-primary/5 rounded-xl border border-primary/20 hover:gap-4 transition-all"
                      >
                        View Live Map & Traffic Flow
                        <span className="material-symbols-outlined">
                          arrow_forward
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

          </div>

          {/* FOOTER */}
          <div className="px-8 py-6 bg-slate-50/80 flex items-center justify-end gap-4 border-t border-slate-200/50">
            <button
              onClick={onClose}
              className="px-8 py-3 text-base font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition"
            >
              Dismiss
            </button>

            <button 
              onClick={handleViewAll}
              className="px-10 py-3 text-base font-black bg-primary text-white rounded-xl shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              View All Activity
              <span className="material-symbols-outlined">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPopup;