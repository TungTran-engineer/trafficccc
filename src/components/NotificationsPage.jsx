import React, { useState } from 'react';

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState({
    today: [
      {
        id: 1,
        type: 'accident',
        title: 'Multiple Vehicle Collision - Sector 7',
        message: 'Significant congestion reported on I-95 Northbound. Automated rerouting protocols initiated for commercial fleets.',
        time: '2 mins ago',
        severity: 'critical',
        hasAction: true
      },
      {
        id: 2,
        type: 'system',
        title: 'AI Optimization Complete',
        message: 'Signal timing algorithms for the Downtown Core have been updated based on peak-hour performance data.',
        time: '45 mins ago',
        severity: 'info',
        hasAction: true
      },
      {
        id: 3,
        type: 'security',
        title: 'Unauthorized Access Attempt',
        message: 'Blocked connection attempt from an unknown IP address targeting Node 442. Security firewall intact.',
        time: '2 hours ago',
        severity: 'warning',
        hasAction: true
      }
    ],
    yesterday: [
      {
        id: 4,
        type: 'maintenance',
        title: 'Scheduled Sensor Maintenance',
        message: 'Proactive maintenance for thermal sensors in the East Tunnel successfully completed.',
        time: '24 hours ago',
        severity: 'info',
        hasAction: false
      },
      {
        id: 5,
        type: 'weather',
        title: 'Weather Advisory Issued',
        message: 'Heavy rainfall alert. Reduced visibility protocols active across the regional network.',
        time: '28 hours ago',
        severity: 'info',
        hasAction: false
      }
    ]
  });

  const getIconAndColor = (type, severity) => {
    switch(type) {
      case 'accident':
        return { icon: 'car_crash', bg: 'bg-red-500/10', color: 'text-red-500' };
      case 'system':
        return { icon: 'settings_suggest', bg: 'bg-primary/10', color: 'text-primary' };
      case 'security':
        return { icon: 'shield', bg: 'bg-amber-500/10', color: 'text-amber-600' };
      case 'maintenance':
        return { icon: 'construction', bg: 'bg-slate-100', color: 'text-slate-500' };
      case 'weather':
        return { icon: 'cloudy_snowing', bg: 'bg-slate-100', color: 'text-slate-500' };
      default:
        return { icon: 'notifications', bg: 'bg-primary/10', color: 'text-primary' };
    }
  };

  const dismissNotification = (id, section) => {
    setNotifications(prev => ({
      ...prev,
      [section]: prev[section].filter(n => n.id !== id)
    }));
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-6 bg-[#f7f5f8]">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-1">Notifications</h2>
            <p className="text-xs text-slate-500">Real-time alerts and system updates for the Flux grid.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-base">done_all</span>
              Mark all as read
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
              Export Logs
            </button>
          </div>
        </div>

        {/* Tabbed Interface */}
        <div className="flex items-center gap-6 border-b border-primary/10 mb-6 overflow-x-auto">
          {['all', 'traffic', 'system', 'security'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-slate-500 hover:text-primary'
              }`}
            >
              {tab === 'all' ? 'All' : tab === 'traffic' ? 'Traffic Alerts' : tab === 'system' ? 'System' : 'Security'}
            </button>
          ))}
        </div>

        {/* Notification Groups */}
        <div className="space-y-6">
          {/* Today Section */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="uppercase tracking-widest text-[10px] font-bold text-slate-400">Today</h3>
              <div className="h-[1px] flex-1 bg-slate-200"></div>
            </div>
            <div className="grid gap-2">
              {notifications.today.map((notif) => {
                const { icon, bg, color } = getIconAndColor(notif.type, notif.severity);
                return (
                  <div
                    key={notif.id}
                    className={`group relative flex items-start gap-3 p-4 bg-white rounded-xl border border-primary/5 hover:border-primary/20 transition-all shadow-sm hover:shadow-md ${notif.severity === 'critical' ? 'border-l-4 border-l-red-500' : ''}`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
                      <span className={`material-symbols-outlined text-lg ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                        {icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                          {notif.title}
                        </h4>
                        <span className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">{notif.message}</p>
                      {notif.hasAction && (
                        <div className="flex gap-2">
                          <button className="px-2.5 py-1 text-[11px] font-bold bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors">
                            {notif.type === 'accident' ? 'View Live Feed' : notif.type === 'system' ? 'View Details' : notif.type === 'security' ? 'Trace IP' : 'View Report'}
                          </button>
                          <button 
                            onClick={() => dismissNotification(notif.id, 'today')}
                            className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Yesterday Section */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="uppercase tracking-widest text-[10px] font-bold text-slate-400">Yesterday</h3>
              <div className="h-[1px] flex-1 bg-slate-200"></div>
            </div>
            <div className="grid gap-2 opacity-80">
              {notifications.yesterday.map((notif) => {
                const { icon, bg, color } = getIconAndColor(notif.type);
                return (
                  <div
                    key={notif.id}
                    className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-transparent hover:border-primary/20 transition-all"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
                      <span className={`material-symbols-outlined text-lg ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                        {icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold text-slate-600">{notif.title}</h4>
                        <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">{notif.message}</p>
                      {notif.hasAction && (
                        <div className="flex gap-2">
                          <button className="px-2.5 py-1 text-[11px] font-bold text-slate-400 hover:text-primary transition-colors">
                            View Report
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* System Stats Bento Style */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pb-6">
            <div className="md:col-span-2 p-4 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Network Health</h4>
                <p className="text-lg font-bold mb-3 leading-tight">System functioning at 99.8% peak efficiency.</p>
                <div className="flex gap-3">
                  <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                    <p className="text-[9px] uppercase opacity-70">Active Nodes</p>
                    <p className="text-base font-bold">12,402</p>
                  </div>
                  <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                    <p className="text-[9px] uppercase opacity-70">Latency</p>
                    <p className="text-base font-bold">14ms</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-12 -bottom-12 opacity-10">
                <span className="material-symbols-outlined text-[120px]">hub</span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-100 flex flex-col justify-between">
              <div>
                <span className="material-symbols-outlined text-primary mb-3 text-xl">history</span>
                <h4 className="text-xs font-bold text-slate-900">Weekly Summary</h4>
                <p className="text-[11px] text-slate-600 mt-1">452 Traffic incidents resolved automatically.</p>
              </div>
              <button className="mt-4 w-full py-2 bg-slate-800 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                Download PDF
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;