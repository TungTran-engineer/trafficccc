import React from 'react';

const PrivacyPopup = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
        <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-white/20">
          {/* Modal Header */}
          <div className="px-8 py-6 flex justify-between items-center bg-white border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Privacy Policy</h2>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-0.5">
                  VIOLET FLUX TRAFFIC SYSTEMS • VERSION 4.2.0
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-grow overflow-y-auto px-8 py-6 space-y-8 scroll-smooth">
            {/* Introduction */}
            <article className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed">
                Your privacy is paramount to the operation of the Violet Flux Traffic ecosystem. This policy outlines our commitment to transparency, security, and precision in how we handle your digital footprint within our precision node networks. By continuing, you acknowledge our processing of data as described below.
              </p>
            </article>

            {/* Bento Style Highlighted Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data Collection Card */}
              <div className="bg-slate-50 rounded-xl p-6 border border-primary/5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-primary text-xl">database</span>
                  <h3 className="font-bold text-slate-900 tracking-tight">Data Collection</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">GPS Location</p>
                      <p className="text-xs text-slate-500">High-precision geospatial telemetry for node optimization.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-lg">phone_iphone</span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Device Info</p>
                      <p className="text-xs text-slate-500">Hardware identifiers and OS version for platform stability.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-lg">monitoring</span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Network Statistics</p>
                      <p className="text-xs text-slate-500">Latency metrics and packet throughput analysis.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Usage Card */}
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-primary text-xl">insights</span>
                  <h3 className="font-bold text-slate-900 tracking-tight">Usage</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm font-bold text-primary mb-1">Real-time routing</p>
                    <p className="text-xs text-slate-600 leading-relaxed">We use your current position to calculate dynamic traffic offsets and minimize congestion across urban nodes.</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-sm font-bold text-primary mb-1">System optimization</p>
                    <p className="text-xs text-slate-600 leading-relaxed">Aggregated logs help our Flux Engines predict future bottlenecks and improve predictive AI models.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Text Details */}
            <div className="space-y-6">
              <section>
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">1. Information We Collect</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We collect information that identifies, relates to, describes, references, is reasonably capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular consumer, household, or device. This is strictly limited to the technical telemetry required for Violet Flux operations.
                </p>
              </section>
              <section>
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">2. How We Share Information</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Violet Flux Traffic Systems does not sell your personal data to third-party advertisers. Information is only shared with authorized Precision Node partners under strict non-disclosure agreements and for the sole purpose of infrastructure maintenance.
                </p>
              </section>
              <section>
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">3. Data Retention</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Telemetry data is anonymized after 24 hours of capture. Residual metadata used for long-term analytics is stripped of all PII (Personally Identifiable Information) before being committed to our permanent encrypted vaults.
                </p>
              </section>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-end items-center gap-4 shrink-0">
            <button 
              onClick={onClose}
              className="w-full md:w-auto px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors order-2 md:order-1 active:scale-95"
            >
              Cancel
            </button>
            <button 
              onClick={onAccept}
              className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-lg text-sm font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 order-1 md:order-2"
            >
              I Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPopup;