import React, { useState, useEffect } from 'react';

const HelpPopup = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "System Latency Specs?",
      answer: "Real-time data feeds have a maximum end-to-end latency of 150ms across the global fiber backbone."
    },
    {
      id: 2,
      question: "Hardware Sensors?",
      answer: "We utilize LiDAR and ultrasonic sensor arrays for 99.8% detection accuracy."
    },
    {
      id: 3,
      question: "API Rate Limits?",
      answer: "Standard nodes are limited to 1,000 requests per minute. Contact admin for enterprise tiers."
    },
    {
      id: 4,
      question: "How to use camera feeds?",
      answer: "Camera feeds are available in the Cameras page. You can view live streams from all connected cameras in your network."
    },
    {
      id: 5,
      question: "Route optimization explained?",
      answer: "Our AI analyzes real-time traffic data, historical patterns, and current incidents to suggest the fastest routes."
    }
  ];

  // Chỉ lock body scroll khi popup mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Overlay với blur nhẹ */}
      <div 
        className="fixed inset-0 z-50"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />
      
      {/* Popup Content - không animation */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#f7f5f8] dark:bg-slate-900 rounded-2xl w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl flex flex-col">
          {/* Header Hero - Fixed */}
          <div className="relative bg-gradient-to-br from-[#7b00ff] to-indigo-900 p-6 shrink-0">
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tighter mb-1">How can we help you?</h2>
                  <p className="text-white/80 text-sm">Access technical documentation, neural routing logic, and live system diagnostics.</p>
                </div>
                <button 
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="px-4 py-1.5 bg-white text-[#7b00ff] font-bold rounded-lg text-sm hover:bg-gray-100 transition-all">
                  Open New Ticket
                </button>
                <button className="px-4 py-1.5 bg-[#7b00ff]/20 text-white border border-white/20 font-bold rounded-lg backdrop-blur-sm hover:bg-white/10 transition-all">
                  View API Docs
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar - Fixed */}
          <div className="p-4 border-b border-primary/10 bg-white dark:bg-slate-800 shrink-0">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentation, guides..."
                className="w-full bg-[#f7f5f8] dark:bg-slate-700 border border-primary/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Quick Guide Card */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-primary/10 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-11 h-11 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-2xl">map</span>
                    </div>
                    <h3 className="text-base font-bold tracking-tight mb-1">Quick Guide: Navigation & Visuals</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Master the interactive traffic map layers, live 4K camera streams, and drone-assisted visual confirmation tools.</p>
                  </div>
                  <span className="material-symbols-outlined text-primary/40 group-hover:text-primary transition-colors">arrow_forward</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-2 rounded-lg bg-[#f7f5f8] dark:bg-slate-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">videocam</span>
                    <span className="text-xs font-semibold">Camera Feeds</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#f7f5f8] dark:bg-slate-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">layers</span>
                    <span className="text-xs font-semibold">Map Overlays</span>
                  </div>
                </div>
              </div>

              {/* AI Route Card */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-primary/10 shadow-sm hover:shadow-md transition-all cursor-pointer">
                <div className="w-11 h-11 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">psychology</span>
                </div>
                <h3 className="text-base font-bold tracking-tight mb-2">Neural Routing Engine</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Learn how our AI predicts traffic surges up to 45 minutes in advance using multi-node balancing algorithms.</p>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2 text-[10px] font-bold text-primary tracking-wider uppercase">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Predictive Balancing
                  </li>
                  <li className="flex items-center gap-2 text-[10px] font-bold text-primary tracking-wider uppercase">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Node Optimization
                  </li>
                </ul>
              </div>

              {/* FAQ Section */}
              <div className="bg-[#ede9f0] dark:bg-slate-800/50 p-5 rounded-xl border border-primary/10 md:col-span-2">
                <h3 className="text-sm font-black tracking-widest uppercase mb-4 text-primary">Frequently Asked Questions</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {filteredFaqs.map((faq) => (
                    <details 
                      key={faq.id}
                      className="group border-b border-primary/10 pb-3"
                      open={openFaq === faq.id}
                      onToggle={(e) => setOpenFaq(e.target.open ? faq.id : null)}
                    >
                      <summary className="flex items-center justify-between cursor-pointer list-none py-1">
                        <span className="font-bold text-sm">{faq.question}</span>
                        <span className="material-symbols-outlined text-sm group-open:rotate-180 transition-transform">
                          expand_more
                        </span>
                      </summary>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 pl-2 pb-2">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>

              {/* Data Explanation Card */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-primary/10 shadow-sm md:col-span-2">
                <div className="flex flex-col md:flex-row gap-5">
                  <div className="flex-1">
                    <div className="w-11 h-11 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-2xl">query_stats</span>
                    </div>
                    <h3 className="text-base font-bold tracking-tight mb-2">Realtime Metrics Accuracy</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Understanding the confidence intervals and sensor health data presented in your dashboard. Our latency metrics are calculated through three redundant validation gates.</p>
                    <div className="flex gap-3">
                      <div className="bg-[#f7f5f8] dark:bg-slate-700 p-3 rounded-xl text-center min-w-[90px]">
                        <span className="text-lg font-black text-primary">150ms</span>
                        <p className="text-[8px] font-bold tracking-widest uppercase text-slate-500">Avg Latency</p>
                      </div>
                      <div className="bg-[#f7f5f8] dark:bg-slate-700 p-3 rounded-xl text-center min-w-[90px]">
                        <span className="text-lg font-black text-primary">99.9%</span>
                        <p className="text-[8px] font-bold tracking-widest uppercase text-slate-500">Uptime</p>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-1/3 rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 relative min-h-[140px] flex items-center justify-center">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-3xl text-primary/50">show_chart</span>
                      <p className="text-[10px] text-white/60 mt-2">Sensor Network Map<br/>Node Cluster Alpha-7 active</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Card */}
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 md:col-span-2">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shrink-0">
                      <span className="material-symbols-outlined text-xl">engineering</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Talk to a System Engineer</h4>
                      <p className="text-xs text-slate-500">Having trouble with a specific node deployment? Our engineering team is available 24/7.</p>
                    </div>
                  </div>
                  <button className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all text-sm shrink-0">
                    Send Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Status - Fixed */}
          <div className="p-3 border-t border-primary/10 bg-white/50 dark:bg-slate-800/50 shrink-0">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[8px] font-bold tracking-widest uppercase text-slate-500">Global API: Operational</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[8px] font-bold tracking-widest uppercase text-slate-500">Dashboard: Operational</span>
                </div>
              </div>
              <div className="text-[8px] font-bold tracking-widest uppercase text-slate-400">
                © 2024 SMART TRAFFIC AI • V2.4.0
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpPopup;